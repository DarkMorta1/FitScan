const { GOALS, ACTIVITY_LEVELS } = require('../utils/constants');
const { calculateBMI, calculateDailyCalories } = require('../utils/nutrition');
const EXERCISES = require('../data/exercises');

const DEFAULTS = {
  daysPerWeek: 3,
  durationMinutes: 45,
  equipment: [],
  fitnessLevel: null,
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const inferFitnessLevel = (profile) => {
  if (profile.fitnessLevel) return profile.fitnessLevel; // explicit override
  const bmi = calculateBMI(profile.weight, profile.height);
  const activity = profile.activityLevel;
  if (activity === 'Sedentary' || activity === 'Light') return 'Beginner';
  if (activity === 'Moderate' || (activity === 'Active' && bmi > 28)) return 'Intermediate';
  return 'Advanced';
};

const pickExercises = ({ focus, level, goal, equipment = [], count = 5, preferredType = 'Mixed' }) => {
  const ownedEquipment = equipment.filter((item) => item !== 'None');
  const hasEquipment = ownedEquipment.length > 0;
  // filter by muscle group or category matching focus
  const focusLower = (focus || '').toLowerCase();

  const byFocus = EXERCISES.filter((ex) => {
    const mg = (ex.muscleGroup || '').toLowerCase();
    const cat = (ex.category || '').toLowerCase();
    return mg.includes(focusLower) || cat.includes(focusLower) || focusLower.includes(cat) || focusLower.includes(mg);
  });

  // fallback to all exercises
  const pool = (byFocus.length ? byFocus : EXERCISES)
    .filter((ex) => {
      // difficulty filter
      if (level === 'Beginner' && ex.difficulty === 'Advanced') return false;
      if (level === 'Intermediate' && ex.difficulty === 'Advanced' && Math.random() > 0.6) return false;
      // equipment filter: keep if no equipment needed or equipment available intersects
      if (!ex.equipment || ex.equipment.length === 0) return true;
      if (!hasEquipment) return false;
      return ex.equipment.some((e) => ownedEquipment.includes(e));
    })
    // prefer exercises that match the user's goal
    .map((ex) => ({ ex, score: ex.goals.includes(goal) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.ex);

  // pick top `count`, prefer compound (category Strength/Full Body) for Bulking
  let selected = [];
  if (goal === 'Bulking') {
    selected = pool.filter((p) => ['Strength', 'Full Body'].includes(p.category)).slice(0, count);
  }

  // Respect preferred workout type: if Bodyweight, only include exercises with no equipment
  if (preferredType === 'Bodyweight') {
    const bodyweightPool = pool.filter((p) => !p.equipment || p.equipment.length === 0);
    selected = selected.concat(bodyweightPool.filter((p) => !selected.includes(p)).slice(0, count - selected.length));
  }

  // If preferred is Cardio, push cardio items up the list
  if (preferredType === 'Cardio') {
    const cardioExtras = pool.filter((p) => p.category === 'Cardio' && !selected.includes(p)).slice(0, count - selected.length);
    selected = selected.concat(cardioExtras);
  }

  if (selected.length < count) {
    const needed = count - selected.length;
    const rest = pool.filter((p) => !selected.includes(p)).slice(0, needed);
    selected = selected.concat(rest);
  }

  // format with structured fields
  return selected.map((s) => ({
    name: s.name,
    target: s.muscleGroup,
    sets: s.sets || 3,
    reps: s.reps || '8-12',
    restSeconds: s.restSeconds || 60,
    instructions: s.instructions || [],
    equipment: s.equipment || [],
    difficulty: s.difficulty || 'Beginner',
    durationMinutes: s.durationMinutes || 5,
  }));
};

const buildWeeklyPlan = ({ daysPerWeek, level, goal, equipment, durationMinutes, preferredWorkoutType }) => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const plan = [];
  const d = clamp(daysPerWeek, 1, 6);

  // split patterns based on days
  let pattern = [];
  if (d <= 3) {
    pattern = ['Full Body', 'Full Body', 'Full Body'];
  } else if (d === 4) {
    pattern = ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'];
  } else if (d === 5) {
    pattern = ['Push', 'Pull', 'Legs', 'Shoulders + Core', 'Full Body'];
  } else if (d >= 6) {
    pattern = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];
  }

  // desired exercise counts per level
  const countsByLevel = { Beginner: [4, 5], Intermediate: [5, 7], Advanced: [6, 8] };
  const [minEx, maxEx] = countsByLevel[level] || countsByLevel.Intermediate;

  const used = new Set();

  for (let i = 0, wi = 0; wi < 7; wi++) {
    const dayName = weekDays[wi];
    if (plan.length < d) {
      // assign workout according to pattern order
      const focus = pattern[plan.length % pattern.length];

      // determine count based on duration and level
      const targetCount = Math.round(((durationMinutes || 45) / 45) * ((minEx + maxEx) / 2));
      const count = clamp(targetCount, minEx, maxEx);

      // pick exercises, avoid repeats across week
      const preferredType = (typeof preferredWorkoutType !== 'undefined') ? preferredWorkoutType : 'Mixed';
      const exCandidates = pickExercises({ focus, level, goal, equipment, count: count * 2, preferredType });
      const selected = [];
      // try to avoid repeating the same muscle group as previous day
      const prev = plan[plan.length - 1];
      const prevGroups = new Set((prev && prev.exercises ? prev.exercises.map((e) => (e.muscleGroup || '').toLowerCase()) : []));
      for (const ex of exCandidates) {
        if (selected.length >= count) break;
        if (used.has(ex.name)) continue;
        const mg = (ex.target || '').toLowerCase();
        if (prevGroups.has(mg) && selected.filter((s) => (s.target || '').toLowerCase() === mg).length >= 2) continue;
        selected.push(ex);
        used.add(ex.name);
      }

      // if we still need more exercises, allow repeats
      if (selected.length < count) {
        const more = exCandidates.filter((e) => !selected.some((s) => s.name === e.name)).slice(0, count - selected.length);
        selected.push(...more);
      }

      const exercises = selected.map((s) => ({
        name: s.name,
        muscleGroup: s.target,
        sets: s.sets,
        reps: s.reps,
        restSeconds: s.restSeconds,
        durationMinutes: s.durationMinutes,
        instructions: s.instructions,
        equipment: s.equipment,
        difficulty: s.difficulty,
      }));

      // estimates
      const estimatedDuration = exercises.reduce((sum, e) => sum + (e.durationMinutes || 5), 0);
      const estimatedCalories = exercises.reduce((sum, e) => sum + (e.durationMinutes || 5) * 6, 0); // rough 6 kcal/min

      plan.push({ day: dayName, focus, exercises, estimatedDuration, estimatedCalories });
    } else {
      // rest day
      plan.push({ day: dayName, focus: 'Rest', exercises: [], estimatedDuration: 0, estimatedCalories: 0 });
    }
  }

  // trim to full week but ensure exactly 7 entries
  return plan.slice(0, 7);
};

const getMealRecommendations = (profile, foods) => {
  const dailyCalories = calculateDailyCalories(profile);
  const distribution = {
    Breakfast: 0.25,
    Lunch: 0.35,
    Dinner: 0.3,
    Snacks: 0.1,
  };

  const goalFilter = (food) => {
    if (profile.goal === 'Cutting') return food.calories < 400 && food.protein >= 15;
    if (profile.goal === 'Bulking') return food.calories >= 300 && food.protein >= 20;
    return food.calories <= 500;
  };

  const recommendations = {};

  Object.entries(distribution).forEach(([mealType, ratio]) => {
    const targetCalories = dailyCalories * ratio;
    recommendations[mealType] = foods
      .filter(goalFilter)
      .sort((a, b) => Math.abs(a.calories - targetCalories) - Math.abs(b.calories - targetCalories))
      .slice(0, 3)
      .map((food) => ({
        _id: food._id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        imageUrl: food.imageUrl,
        category: food.category,
      }));
  });

  return recommendations;
};

const getWorkoutRecommendations = (profile) => {
  const fitnessLevel = inferFitnessLevel(profile);
  const daysPerWeek = profile.workoutDays || DEFAULTS.daysPerWeek;
  const durationMinutes = profile.workoutDurationMinutes || DEFAULTS.durationMinutes;
  const equipment = profile.equipment || DEFAULTS.equipment;
  const goal = profile.goal || 'Maintain';

  const weeklyPlan = buildWeeklyPlan({ daysPerWeek, level: fitnessLevel, goal, equipment, durationMinutes, preferredWorkoutType: profile.preferredWorkoutType });
  const estimatedWeeklyDuration = weeklyPlan.reduce((s, d) => s + (d.estimatedDuration || 0), 0);
  const estimatedWeeklyCalories = weeklyPlan.reduce((s, d) => s + (d.estimatedCalories || 0), 0);

  let planReason = `Your plan focuses on ${
    goal === 'Bulking' ? 'resistance training and recovery' : goal === 'Cutting' ? 'a mix of strength and cardio to preserve muscle while increasing activity' : 'balanced strength and cardio to maintain fitness'
  } because your goal is ${goal.toLowerCase()} and your fitness level is ${fitnessLevel.toLowerCase()}.`;

  if (profile.preferredWorkoutType) {
    planReason += ` It also favors ${profile.preferredWorkoutType.toLowerCase()} workouts.`;
  }

  if (profile.medicalConditions && profile.medicalConditions.length > 0) {
    planReason += ' You have medical conditions on file; consult a qualified professional before starting this program.';
  }

  return {
    goal,
    fitnessLevel,
    daysPerWeek,
    workoutDurationMinutes: durationMinutes,
    preferredWorkoutType: profile.preferredWorkoutType || 'Mixed',
    activityLevel: profile.activityLevel || ACTIVITY_LEVELS[2],
    weeklyPlan,
    estimatedWeeklyDuration,
    estimatedWeeklyCalories,
    planReason,
  };
};

module.exports = {
  getMealRecommendations,
  getWorkoutRecommendations,
  getWorkoutLevel: inferFitnessLevel,
};
