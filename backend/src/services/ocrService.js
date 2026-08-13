const Tesseract = require("tesseract.js");

const extractTextFromImage = async (imagePath) => {
  try {
    const result = await Tesseract.recognize(
      imagePath,
      "eng",
      {
        logger: (m) => console.log(m)
      }
    );

    return {
      success: true,
      text: result.data.text
    };

  } catch (err) {

    console.error(err);

    return {
      success: false,
      text: ""
    };

  }
};

module.exports = {
  extractTextFromImage
};