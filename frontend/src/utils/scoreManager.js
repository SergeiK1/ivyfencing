// Score Management Utility
// Handles localStorage operations and data structure for Ivy League fencing scores

const STORAGE_KEY = 'ivyFencingScores';

// Normalize rivalry key to ensure Yale vs Harvard = Harvard vs Yale
const createRivalryKey = (team1, team2, gender) => {
  const teams = [team1, team2].sort(); // Alphabetical order
  return `${teams[0]}_vs_${teams[1]}_${gender}`;
};

// Initialize default score structure
const createDefaultScore = () => ({
  sabre: 0,
  foil: 0,
  epee: 0,
  total: 0
});

// Initialize default rivalry data
const createDefaultRivalry = (team1, team2, gender) => {
  const teams = [team1, team2].sort();
  return {
    team1: teams[0],
    team2: teams[1],
    gender,
    scores: {
      [teams[0]]: createDefaultScore(),
      [teams[1]]: createDefaultScore()
    },
    lastUpdated: new Date().toISOString()
  };
};

// Load all scores from localStorage
export const loadScores = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading scores:', error);
    return {};
  }
};

// Save all scores to localStorage
export const saveScores = (scores) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return true;
  } catch (error) {
    console.error('Error saving scores:', error);
    return false;
  }
};

// Get specific rivalry data
export const getRivalryData = (team1, team2, gender) => {
  const scores = loadScores();
  const key = createRivalryKey(team1, team2, gender);
  return scores[key] || createDefaultRivalry(team1, team2, gender);
};

// Update rivalry scores
export const updateRivalryScores = (team1, team2, gender, teamName, weaponScores) => {
  const scores = loadScores();
  const key = createRivalryKey(team1, team2, gender);
  
  if (!scores[key]) {
    scores[key] = createDefaultRivalry(team1, team2, gender);
  }
  
  // Update weapon scores
  scores[key].scores[teamName] = {
    sabre: parseInt(weaponScores.sabre) || 0,
    foil: parseInt(weaponScores.foil) || 0,
    epee: parseInt(weaponScores.epee) || 0,
    total: (parseInt(weaponScores.sabre) || 0) + 
           (parseInt(weaponScores.foil) || 0) + 
           (parseInt(weaponScores.epee) || 0)
  };
  
  scores[key].lastUpdated = new Date().toISOString();
  
  return saveScores(scores);
};

// Get all rivalries for a specific gender
// Helper function to check if a rivalry has all zero scores
const hasAllZeroScores = (rivalryData) => {
  const scores = rivalryData.scores;
  for (const team in scores) {
    const teamScores = scores[team];
    if (teamScores.sabre > 0 || teamScores.foil > 0 || teamScores.epee > 0) {
      return false;
    }
  }
  return true;
};

export const getRivalriesByGender = (gender) => {
  const scores = loadScores();
  return Object.entries(scores)
    .filter(([key, data]) => data.gender === gender && !hasAllZeroScores(data))
    .reduce((acc, [key, data]) => {
      acc[key] = data;
      return acc;
    }, {});
};

// Get all available schools
export const getAllSchools = () => [
  'Harvard', 'Yale', 'Princeton', 'Columbia', 'UPenn', 'Brown', 'Cornell'
];

// Get schools available for specific gender
export const getSchoolsByGender = (gender) => {
  const allSchools = getAllSchools();
  if (gender === 'women') {
    return allSchools;
  } else {
    // Men: exclude Brown and Cornell
    return allSchools.filter(school => school !== 'Brown' && school !== 'Cornell');
  }
};

// Clear all scores (for admin use)
export const clearAllScores = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing scores:', error);
    return false;
  }
};

// Export scores as JSON (for backup)
export const exportScores = () => {
  const scores = loadScores();
  return JSON.stringify(scores, null, 2);
};

// Import scores from JSON (for restore)
export const importScores = (jsonData) => {
  try {
    const scores = JSON.parse(jsonData);
    return saveScores(scores);
  } catch (error) {
    console.error('Error importing scores:', error);
    return false;
  }
};