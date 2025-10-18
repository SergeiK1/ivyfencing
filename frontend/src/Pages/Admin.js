import React, { useState, useEffect } from 'react';
import '../Css/Admin.css';
import {
  getRivalryData,
  updateRivalryScores,
  getSchoolsByGender,
  getRivalriesByGender
} from '../utils/scoreManager';

function Admin() {
  const [gender, setGender] = useState('women');
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [team1Scores, setTeam1Scores] = useState({ sabre: 0, foil: 0, epee: 0 });
  const [team2Scores, setTeam2Scores] = useState({ sabre: 0, foil: 0, epee: 0 });
  const [existingRivalries, setExistingRivalries] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availableSchools = getSchoolsByGender(gender);

  // Load existing rivalries when gender changes
  useEffect(() => {
    const loadRivalries = async () => {
      setIsLoading(true);
      const rivalries = await getRivalriesByGender(gender);
      setExistingRivalries(rivalries);
      setIsLoading(false);
    };
    loadRivalries();
  }, [gender]);

  // Load rivalry data when teams are selected
  useEffect(() => {
    const loadRivalryData = async () => {
      if (selectedTeam1 && selectedTeam2 && selectedTeam1 !== selectedTeam2) {
        const rivalryData = await getRivalryData(selectedTeam1, selectedTeam2, gender);
        setTeam1Scores(rivalryData.scores[selectedTeam1] || { sabre: 0, foil: 0, epee: 0 });
        setTeam2Scores(rivalryData.scores[selectedTeam2] || { sabre: 0, foil: 0, epee: 0 });
      }
    };
    loadRivalryData();
  }, [selectedTeam1, selectedTeam2, gender]);

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    setSelectedTeam1('');
    setSelectedTeam2('');
    setTeam1Scores({ sabre: 0, foil: 0, epee: 0 });
    setTeam2Scores({ sabre: 0, foil: 0, epee: 0 });
    setSaveStatus('');
  };

  const handleTeam1ScoreChange = (weapon, value) => {
    const newScores = {
      ...team1Scores,
      [weapon]: parseInt(value) || 0
    };
    setTeam1Scores(newScores);

    // Auto-save after a short delay
    setTimeout(async () => {
      if (selectedTeam1 && selectedTeam2) {
        const success = await updateRivalryScores(selectedTeam1, selectedTeam2, gender, selectedTeam1, newScores);
        if (success) {
          const rivalries = await getRivalriesByGender(gender);
          setExistingRivalries(rivalries);
          setSaveStatus('Auto-saved!');
          setTimeout(() => setSaveStatus(''), 1500);
        } else {
          setSaveStatus('Error saving!');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      }
    }, 500);
  };

  const handleTeam2ScoreChange = (weapon, value) => {
    const newScores = {
      ...team2Scores,
      [weapon]: parseInt(value) || 0
    };
    setTeam2Scores(newScores);

    // Auto-save after a short delay
    setTimeout(async () => {
      if (selectedTeam1 && selectedTeam2) {
        const success = await updateRivalryScores(selectedTeam1, selectedTeam2, gender, selectedTeam2, newScores);
        if (success) {
          const rivalries = await getRivalriesByGender(gender);
          setExistingRivalries(rivalries);
          setSaveStatus('Auto-saved!');
          setTimeout(() => setSaveStatus(''), 1500);
        } else {
          setSaveStatus('Error saving!');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      }
    }, 500);
  };

  const calculateTotal = (scores) => {
    return scores.sabre + scores.foil + scores.epee;
  };

  const handleClearCurrentScores = async () => {
    if (window.confirm('Are you sure you want to clear the scores for this matchup?')) {
      const clearedScores = { sabre: 0, foil: 0, epee: 0 };
      setTeam1Scores(clearedScores);
      setTeam2Scores(clearedScores);

      // Save the cleared scores
      if (selectedTeam1 && selectedTeam2) {
        await updateRivalryScores(selectedTeam1, selectedTeam2, gender, selectedTeam1, clearedScores);
        await updateRivalryScores(selectedTeam1, selectedTeam2, gender, selectedTeam2, clearedScores);
        const rivalries = await getRivalriesByGender(gender);
        setExistingRivalries(rivalries);
      }

      setSaveStatus('Current matchup scores cleared and saved!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const getTeamLogo = (teamName) => {
    return `/logos/${teamName}.png`;
  };

  const handleRivalryClick = (rivalry) => {
    setSelectedTeam1(rivalry.team1);
    setSelectedTeam2(rivalry.team2);
    setTeam1Scores(rivalry.scores[rivalry.team1] || { sabre: 0, foil: 0, epee: 0 });
    setTeam2Scores(rivalry.scores[rivalry.team2] || { sabre: 0, foil: 0, epee: 0 });
    setDropdown1Open(false);
    setDropdown2Open(false);
  };

  const CustomDropdown = ({ value, onChange, placeholder, excludeValue, isOpen, setIsOpen, dropdownId }) => {
    return (
      <div className="admin-custom-dropdown">
        <div
          className={`admin-dropdown-selected ${isOpen ? 'admin-dropdown-open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {value ? (
            <div className="admin-dropdown-selected-content">
              <img src={getTeamLogo(value)} alt={value} className="admin-dropdown-logo" />
              <span>{value}</span>
            </div>
          ) : (
            <span className="admin-dropdown-placeholder">{placeholder}</span>
          )}
          <span className="admin-dropdown-arrow">▼</span>
        </div>
        {isOpen && (
          <div className="admin-dropdown-options">
            {availableSchools
              .filter(school => school !== excludeValue)
              .map(school => (
                <div
                  key={school}
                  className="admin-dropdown-option"
                  onClick={() => {
                    onChange(school);
                    setIsOpen(false);
                  }}
                >
                  <img src={getTeamLogo(school)} alt={school} className="admin-dropdown-logo" />
                  <span>{school}</span>
                </div>
              ))
            }
          </div>
        )}
      </div>
    );
  };

  const CustomNumberInput = ({ value, onChange, min = 0 }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value.toString());

    const handleIncrement = () => {
      onChange(Math.max(min, value + 1));
    };

    const handleDecrement = () => {
      onChange(Math.max(min, value - 1));
    };

    const handleNumberClick = () => {
      setIsEditing(true);
      setTempValue(value.toString());
    };

    const handleInputChange = (e) => {
      setTempValue(e.target.value);
    };

    const handleInputBlur = () => {
      const newValue = parseInt(tempValue) || 0;
      onChange(Math.max(min, newValue));
      setIsEditing(false);
    };

    const handleInputKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleInputBlur();
      }
    };

    return (
      <div className="admin-custom-number-input">
        <button
          className="admin-number-btn admin-minus-btn"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          −
        </button>
        {isEditing ? (
          <input
            type="number"
            value={tempValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleInputKeyPress}
            className="admin-number-edit-input"
            autoFocus
            min={min}
          />
        ) : (
          <div
            className="admin-number-display"
            onClick={handleNumberClick}
          >
            {value}
          </div>
        )}
        <button
          className="admin-number-btn admin-plus-btn"
          onClick={handleIncrement}
        >
          +
        </button>
      </div>
    );
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Score Management</h1>

      {/* Gender Toggle */}
      <div className="admin-gender-toggle">
        <button
          className={`admin-toggle-btn ${gender === 'women' ? 'admin-active' : ''}`}
          onClick={() => handleGenderChange('women')}
        >
          Women
        </button>
        <button
          className={`admin-toggle-btn ${gender === 'men' ? 'admin-active' : ''}`}
          onClick={() => handleGenderChange('men')}
        >
          Men
        </button>
      </div>

      {/* Team Selection */}
      <div className="admin-team-selection">
        <h2 className="admin-section-title">Select Teams</h2>
        <div className="admin-team-selectors">
          <div className="admin-team-selector">
            <label>Team 1:</label>
            <CustomDropdown
              value={selectedTeam1}
              onChange={setSelectedTeam1}
              placeholder="Select Team 1"
              excludeValue={selectedTeam2}
              isOpen={dropdown1Open}
              setIsOpen={setDropdown1Open}
              dropdownId="team1"
            />
          </div>
          <div className="admin-vs-divider">VS</div>
          <div className="admin-team-selector">
            <label>Team 2:</label>
            <CustomDropdown
              value={selectedTeam2}
              onChange={setSelectedTeam2}
              placeholder="Select Team 2"
              excludeValue={selectedTeam1}
              isOpen={dropdown2Open}
              setIsOpen={setDropdown2Open}
              dropdownId="team2"
            />
          </div>
        </div>
      </div>

      {/* Score Input Section */}
      {selectedTeam1 && selectedTeam2 && selectedTeam1 !== selectedTeam2 && (
        <div className="admin-score-section">
          <h2 className="admin-section-title">Enter Scores</h2>
          <div className="admin-score-input-container">
            {/* Team 1 Scores */}
            <div className="admin-team-score-card">
              <div className="admin-team-header">
                <img src={getTeamLogo(selectedTeam1)} alt={selectedTeam1} className="admin-team-logo" />
                <h3>{selectedTeam1}</h3>
              </div>
              <div className="admin-weapon-inputs">
                <div className="admin-weapon-input">
                  <label>Sabre:</label>
                  <CustomNumberInput
                    value={team1Scores.sabre}
                    onChange={(value) => handleTeam1ScoreChange('sabre', value)}
                    min={0}
                  />
                </div>
                <div className="admin-weapon-input">
                  <label>Foil:</label>
                  <CustomNumberInput
                    value={team1Scores.foil}
                    onChange={(value) => handleTeam1ScoreChange('foil', value)}
                    min={0}
                  />
                </div>
                <div className="admin-weapon-input">
                  <label>Epee:</label>
                  <CustomNumberInput
                    value={team1Scores.epee}
                    onChange={(value) => handleTeam1ScoreChange('epee', value)}
                    min={0}
                  />
                </div>
              </div>
              <div className="admin-total-score">
                Total: {calculateTotal(team1Scores)}
              </div>
            </div>

            {/* Team 2 Scores */}
            <div className="admin-team-score-card">
              <div className="admin-team-header">
                <img src={getTeamLogo(selectedTeam2)} alt={selectedTeam2} className="admin-team-logo" />
                <h3>{selectedTeam2}</h3>
              </div>
              <div className="admin-weapon-inputs">
                <div className="admin-weapon-input">
                  <label>Sabre:</label>
                  <CustomNumberInput
                    value={team2Scores.sabre}
                    onChange={(value) => handleTeam2ScoreChange('sabre', value)}
                    min={0}
                  />
                </div>
                <div className="admin-weapon-input">
                  <label>Foil:</label>
                  <CustomNumberInput
                    value={team2Scores.foil}
                    onChange={(value) => handleTeam2ScoreChange('foil', value)}
                    min={0}
                  />
                </div>
                <div className="admin-weapon-input">
                  <label>Epee:</label>
                  <CustomNumberInput
                    value={team2Scores.epee}
                    onChange={(value) => handleTeam2ScoreChange('epee', value)}
                    min={0}
                  />
                </div>
              </div>
              <div className="admin-total-score">
                Total: {calculateTotal(team2Scores)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="admin-actions">
            <button onClick={handleClearCurrentScores} className="admin-clear-btn">
              Clear Current Scores
            </button>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className={`admin-status ${saveStatus.includes('Error') ? 'admin-error' : 'admin-success'}`}>
              {saveStatus}
            </div>
          )}
        </div>
      )}

      {/* Existing Rivalries */}
      {isLoading ? (
        <div className="admin-loading">Loading rivalries...</div>
      ) : Object.keys(existingRivalries).length > 0 ? (
        <div className="admin-existing-rivalries">
          <h2 className="admin-section-title">Existing {gender.charAt(0).toUpperCase() + gender.slice(1)}'s Rivalries</h2>
          <div className="admin-rivalries-grid">
            {Object.entries(existingRivalries).map(([key, rivalry]) => (
              <div
                key={key}
                className="admin-rivalry-card admin-rivalry-clickable"
                onClick={() => handleRivalryClick(rivalry)}
              >
                <div className="admin-rivalry-header">
                  <div className="admin-rivalry-teams">
                    <img src={getTeamLogo(rivalry.team1)} alt={rivalry.team1} className="admin-rivalry-logo" />
                    <span>{rivalry.team1}</span>
                    <span className="admin-rivalry-vs">vs</span>
                    <img src={getTeamLogo(rivalry.team2)} alt={rivalry.team2} className="admin-rivalry-logo" />
                    <span>{rivalry.team2}</span>
                  </div>
                </div>
                <div className="admin-rivalry-scores">
                  <div className="admin-rivalry-team">
                    <strong>{rivalry.team1}:</strong> {rivalry.scores[rivalry.team1]?.total || 0}
                  </div>
                  <div className="admin-rivalry-team">
                    <strong>{rivalry.team2}:</strong> {rivalry.scores[rivalry.team2]?.total || 0}
                  </div>
                </div>
                <div className="admin-rivalry-updated">
                  Updated: {new Date(rivalry.lastUpdated).toLocaleDateString()}
                </div>
                <div className="admin-rivalry-click-hint">
                  Click to edit
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Admin;
