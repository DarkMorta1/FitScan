const Food = require('../models/Food');
const Fuse = require('fuse.js');
const { extractTextFromImage } = require('./ocrService');

const PRICE_RE = /[£$€¥]\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*(?:kr|c|¢)?/gi;
const CLEAN_RE = /[^a-zA-Z0-9&'\- ]+/g;
const MIN_TEXT_LENGTH = 3;
const CATEGORY_HEADINGS = [
    'main course',
    'appetizers',
    'appetizer',
    'drinks',
    'drink',
    'desserts',
    'dessert',
    'beverages',
    'starters',
    'salads',
    'sides',
    'entrees',
    'soups',
    'breakfast',
    'lunch',
    'dinner'
];

const normalizeLine = (line) => {
    if (!line) return '';
    // remove prices and currency symbols
    let cleaned = line.replace(PRICE_RE, '');
    // remove extra punctuation
    cleaned = cleaned.replace(CLEAN_RE, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned.toLowerCase();
};

const isHeading = (line) => {
    if (!line) return false;
    const l = line.toLowerCase().trim();
    return CATEGORY_HEADINGS.includes(l);
};

const detectFood = async (imagePath) => {
    const ocr = await extractTextFromImage(imagePath);

    if (!ocr.success) {
        return {
            success: false,
            detected: false,
            message: 'OCR failed.'
        };
    }

    const detectedText = ocr.text || '';
    console.log('OCR TEXT:');
    console.log(detectedText);

    // split by lines and commas, keep meaningful candidates
    const rawLines = detectedText
        .split(/\r?\n|,/) // split on new lines and commas
        .map((l) => l.trim())
        .filter((l) => l && l.length >= MIN_TEXT_LENGTH);

    const candidates = rawLines
        .map((l) => ({ raw: l, cleaned: normalizeLine(l) }))
        .filter(({ cleaned }) => cleaned && cleaned.length >= MIN_TEXT_LENGTH && !isHeading(cleaned))
        .map(({ raw, cleaned }) => cleaned)
        .filter((v, i, a) => a.indexOf(v) === i); // unique

    if (candidates.length === 0) {
        return {
            success: true,
            detected: false,
            message: 'No menu items detected from OCR.'
        };
    }

    const foods = await Food.find();

    const fuse = new Fuse(foods, {
        keys: ['name'],
        threshold: 0.45,
        ignoreLocation: true,
    });

    const matchesMap = new Map();

    for (const candidate of candidates) {
        if (!candidate || candidate.length < MIN_TEXT_LENGTH) continue;

        const results = fuse.search(candidate);

        if (results && results.length > 0) {
            const top = results[0];
            const food = top.item;
            const score = typeof top.score === 'number' ? 1 - top.score : 0.0; // convert to confidence
            const id = String(food._id);

            // keep the best confidence for duplicates
            if (!matchesMap.has(id) || matchesMap.get(id).confidence < score) {
                matchesMap.set(id, {
                    food,
                    matchedText: candidate,
                    confidence: Math.round(score * 100) / 100,
                });
            }
        }
    }

    const items = Array.from(matchesMap.values()).sort((a, b) => b.confidence - a.confidence);

    if (items.length === 0) {
        return {
            success: true,
            detected: false,
            message: 'No matching foods were found in our nutrition database.'
        };
    }

    return {
        success: true,
        detected: true,
        items,
    };
};

module.exports = { detectFood };