// Score Management Utility with Supabase Backend
// Handles database operations for Ivy League fencing scores

import { supabase } from '../supabaseClient';

// Normalize team order to ensure consistency (alphabetical)
const normalizeTeams = (team1, team2) => {
  return [team1, team2].sort();
};

// Initialize default score structure
const createDefaultScore = () => ({
  sabre: 0,
  foil: 0,
  epee: 0,
  total: 0
});

// Get specific rivalry data from database
export const getRivalryData = async (team1, team2, gender) => {
  try {
    const [normalizedTeam1, normalizedTeam2] = normalizeTeams(team1, team2);

    const { data, error } = await supabase
      .from('rivalries')
      .select('*')
      .eq('team1', normalizedTeam1)
      .eq('team2', normalizedTeam2)
      .eq('gender', gender)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is ok
      console.error('Error fetching rivalry:', error);
    }

    if (!data) {
      // Return default structure if no data exists
      return {
        team1: normalizedTeam1,
        team2: normalizedTeam2,
        gender,
        scores: {
          [normalizedTeam1]: createDefaultScore(),
          [normalizedTeam2]: createDefaultScore()
        },
        lastUpdated: new Date().toISOString()
      };
    }

    // Transform database format to application format
    return {
      team1: data.team1,
      team2: data.team2,
      gender: data.gender,
      scores: {
        [data.team1]: {
          sabre: data.team1_sabre || 0,
          foil: data.team1_foil || 0,
          epee: data.team1_epee || 0,
          total: data.team1_total || 0
        },
        [data.team2]: {
          sabre: data.team2_sabre || 0,
          foil: data.team2_foil || 0,
          epee: data.team2_epee || 0,
          total: data.team2_total || 0
        }
      },
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error('Error in getRivalryData:', error);
    // Return default structure on error
    const [normalizedTeam1, normalizedTeam2] = normalizeTeams(team1, team2);
    return {
      team1: normalizedTeam1,
      team2: normalizedTeam2,
      gender,
      scores: {
        [normalizedTeam1]: createDefaultScore(),
        [normalizedTeam2]: createDefaultScore()
      },
      lastUpdated: new Date().toISOString()
    };
  }
};

// Update rivalry scores in database
export const updateRivalryScores = async (team1, team2, gender, teamName, weaponScores) => {
  try {
    const [normalizedTeam1, normalizedTeam2] = normalizeTeams(team1, team2);

    // Calculate total
    const total = (parseInt(weaponScores.sabre) || 0) +
                  (parseInt(weaponScores.foil) || 0) +
                  (parseInt(weaponScores.epee) || 0);

    // Determine which team is being updated
    const isTeam1 = teamName === normalizedTeam1;

    // First, check if the rivalry exists
    const { data: existing } = await supabase
      .from('rivalries')
      .select('*')
      .eq('team1', normalizedTeam1)
      .eq('team2', normalizedTeam2)
      .eq('gender', gender)
      .single();

    let result;

    if (existing) {
      // Update existing rivalry
      const updateData = {
        last_updated: new Date().toISOString()
      };

      if (isTeam1) {
        updateData.team1_sabre = parseInt(weaponScores.sabre) || 0;
        updateData.team1_foil = parseInt(weaponScores.foil) || 0;
        updateData.team1_epee = parseInt(weaponScores.epee) || 0;
        updateData.team1_total = total;
      } else {
        updateData.team2_sabre = parseInt(weaponScores.sabre) || 0;
        updateData.team2_foil = parseInt(weaponScores.foil) || 0;
        updateData.team2_epee = parseInt(weaponScores.epee) || 0;
        updateData.team2_total = total;
      }

      result = await supabase
        .from('rivalries')
        .update(updateData)
        .eq('id', existing.id);
    } else {
      // Insert new rivalry
      const insertData = {
        team1: normalizedTeam1,
        team2: normalizedTeam2,
        gender: gender,
        team1_sabre: isTeam1 ? (parseInt(weaponScores.sabre) || 0) : 0,
        team1_foil: isTeam1 ? (parseInt(weaponScores.foil) || 0) : 0,
        team1_epee: isTeam1 ? (parseInt(weaponScores.epee) || 0) : 0,
        team1_total: isTeam1 ? total : 0,
        team2_sabre: !isTeam1 ? (parseInt(weaponScores.sabre) || 0) : 0,
        team2_foil: !isTeam1 ? (parseInt(weaponScores.foil) || 0) : 0,
        team2_epee: !isTeam1 ? (parseInt(weaponScores.epee) || 0) : 0,
        team2_total: !isTeam1 ? total : 0,
        last_updated: new Date().toISOString()
      };

      result = await supabase
        .from('rivalries')
        .insert([insertData]);
    }

    if (result.error) {
      console.error('Error updating rivalry:', result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateRivalryScores:', error);
    return false;
  }
};

// Get all rivalries for a specific gender
export const getRivalriesByGender = async (gender) => {
  try {
    const { data, error } = await supabase
      .from('rivalries')
      .select('*')
      .eq('gender', gender);

    if (error) {
      console.error('Error fetching rivalries:', error);
      return {};
    }

    // Transform to match the original format and filter out zero-score rivalries
    const rivalries = {};

    data.forEach(row => {
      // Check if rivalry has any non-zero scores
      const hasScores = row.team1_sabre > 0 || row.team1_foil > 0 || row.team1_epee > 0 ||
                       row.team2_sabre > 0 || row.team2_foil > 0 || row.team2_epee > 0;

      if (hasScores) {
        const key = `${row.team1}_vs_${row.team2}_${row.gender}`;
        rivalries[key] = {
          team1: row.team1,
          team2: row.team2,
          gender: row.gender,
          scores: {
            [row.team1]: {
              sabre: row.team1_sabre || 0,
              foil: row.team1_foil || 0,
              epee: row.team1_epee || 0,
              total: row.team1_total || 0
            },
            [row.team2]: {
              sabre: row.team2_sabre || 0,
              foil: row.team2_foil || 0,
              epee: row.team2_epee || 0,
              total: row.team2_total || 0
            }
          },
          lastUpdated: row.last_updated
        };
      }
    });

    return rivalries;
  } catch (error) {
    console.error('Error in getRivalriesByGender:', error);
    return {};
  }
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
export const clearAllScores = async () => {
  try {
    const { error } = await supabase
      .from('rivalries')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error('Error clearing scores:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in clearAllScores:', error);
    return false;
  }
};

// Export scores as JSON (for backup)
export const exportScores = async () => {
  try {
    const { data, error } = await supabase
      .from('rivalries')
      .select('*');

    if (error) {
      console.error('Error exporting scores:', error);
      return '{}';
    }

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error in exportScores:', error);
    return '{}';
  }
};

// Import scores from JSON (for restore) - ADMIN ONLY
export const importScores = async (jsonData) => {
  try {
    const scores = JSON.parse(jsonData);

    // Clear existing data first
    await clearAllScores();

    // Insert new data
    const { error } = await supabase
      .from('rivalries')
      .insert(scores);

    if (error) {
      console.error('Error importing scores:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in importScores:', error);
    return false;
  }
};
