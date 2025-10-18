import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Css/Score.css';
import { getRivalryData } from '../utils/scoreManager';

// Score Card Component
function ScoreCard({ matchup, gender, onDelete, showDelete }) {
  const { team1, team2 } = matchup;
  const rivalryData = getRivalryData(team1.name, team2.name, gender);

  // Helper function to get winning team for a weapon
  const getWinningTeam = (weapon) => {
    const team1Score = rivalryData.scores[team1.name]?.[weapon] || 0;
    const team2Score = rivalryData.scores[team2.name]?.[weapon] || 0;

    if (team1Score > team2Score) return team1;
    if (team2Score > team1Score) return team2;
    return null; // Tied
  };

  return (
    <div className="score-card">
      {showDelete && (
        <button className="score-card-delete-btn" onClick={onDelete}>
          ×
        </button>
      )}

      <div className="score-matchup">
        <div className="score-team">
          <img
            src={team1.logo}
            alt={team1.name}
            className="score-team-logo"
          />
          <h2 className="score-team-name">{team1.name}</h2>
          <div className="score-total">
            {rivalryData.scores[team1.name]?.total || 0}
            {(rivalryData.scores[team1.name]?.total || 0) >= 14 && (
              <img src="/crown.png" alt="Winner" className="score-total-crown" />
            )}
          </div>

          {/* Clinch Bar for Team 1 - positioned on right (inside) */}
          <div className="score-clinch-bar score-clinch-bar-left">
            {[...Array(14)].map((_, index) => {
              const squareNumber = 14 - index; // Count from bottom to top
              const team1Total = rivalryData.scores[team1.name]?.total || 0;
              const isFilled = team1Total >= squareNumber;
              const isWinningSquare = squareNumber === 14;

              return (
                <div
                  key={index}
                  className={`score-clinch-square ${isFilled ? 'filled' : ''} ${isWinningSquare ? 'winning-square' : ''}`}
                >
                  {isWinningSquare && isFilled && (
                    <img src="/crown.png" alt="Crown" className="score-clinch-crown" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="score-vs">VS</div>

        <div className="score-team">
          {/* Clinch Bar for Team 2 - positioned on left (inside) */}
          <div className="score-clinch-bar score-clinch-bar-right">
            {[...Array(14)].map((_, index) => {
              const squareNumber = 14 - index; // Count from bottom to top
              const team2Total = rivalryData.scores[team2.name]?.total || 0;
              const isFilled = team2Total >= squareNumber;
              const isWinningSquare = squareNumber === 14;

              return (
                <div
                  key={index}
                  className={`score-clinch-square ${isFilled ? 'filled' : ''} ${isWinningSquare ? 'winning-square' : ''}`}
                >
                  {isWinningSquare && isFilled && (
                    <img src="/crown.png" alt="Crown" className="score-clinch-crown" />
                  )}
                </div>
              );
            })}
          </div>

          <img
            src={team2.logo}
            alt={team2.name}
            className="score-team-logo"
          />
          <h2 className="score-team-name">{team2.name}</h2>
          <div className="score-total">
            {rivalryData.scores[team2.name]?.total || 0}
            {(rivalryData.scores[team2.name]?.total || 0) >= 14 && (
              <img src="/crown.png" alt="Winner" className="score-total-crown" />
            )}
          </div>
        </div>
      </div>

      <div className="score-breakdown">
        <h3>Weapon Breakdown</h3>

        <div className="score-weapon-row">
          <div className="score-weapon-label">Sabre</div>
          <div className="score-weapon-scores">
            <span className="score-team1-score">
              {rivalryData.scores[team1.name]?.sabre || 0}
            </span>
            <span className="score-divider">-</span>
            <span className="score-team2-score">
              {rivalryData.scores[team2.name]?.sabre || 0}
            </span>
          </div>
          {getWinningTeam('sabre') ? (
            <img
              src={getWinningTeam('sabre').logo}
              alt={getWinningTeam('sabre').name}
              className="score-winner-logo"
            />
          ) : (
            <div className="score-winner-logo-placeholder"></div>
          )}
        </div>

        <div className="score-weapon-row">
          <div className="score-weapon-label">Foil</div>
          <div className="score-weapon-scores">
            <span className="score-team1-score">
              {rivalryData.scores[team1.name]?.foil || 0}
            </span>
            <span className="score-divider">-</span>
            <span className="score-team2-score">
              {rivalryData.scores[team2.name]?.foil || 0}
            </span>
          </div>
          {getWinningTeam('foil') ? (
            <img
              src={getWinningTeam('foil').logo}
              alt={getWinningTeam('foil').name}
              className="score-winner-logo"
            />
          ) : (
            <div className="score-winner-logo-placeholder"></div>
          )}
        </div>

        <div className="score-weapon-row">
          <div className="score-weapon-label">Epee</div>
          <div className="score-weapon-scores">
            <span className="score-team1-score">
              {rivalryData.scores[team1.name]?.epee || 0}
            </span>
            <span className="score-divider">-</span>
            <span className="score-team2-score">
              {rivalryData.scores[team2.name]?.epee || 0}
            </span>
          </div>
          {getWinningTeam('epee') ? (
            <img
              src={getWinningTeam('epee').logo}
              alt={getWinningTeam('epee').name}
              className="score-winner-logo"
            />
          ) : (
            <div className="score-winner-logo-placeholder"></div>
          )}
        </div>
      </div>

      <div className="score-footer">
        <p className="score-last-updated">
          Last Updated: {rivalryData.lastUpdated ?
            new Date(rivalryData.lastUpdated).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }) : 'Never'}
        </p>
      </div>
    </div>
  );
}

function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchups: initialMatchups, gender } = location.state || {};
  const [matchups, setMatchups] = useState(initialMatchups || []);

  const deleteMatchup = (index) => {
    if (matchups.length > 1) {
      setMatchups(matchups.filter((_, i) => i !== index));
    } else {
      navigate('/');
    }
  };

  if (!matchups || matchups.length === 0) {
    return (
      <div className="score-container">
        <div className="score-placeholder">
          <h2 className="score-title">Rivalry Scores</h2>
          <p className="score-message">Select teams to view their rivalry history</p>
          <button
            className="score-back-btn"
            onClick={() => navigate('/')}
          >
            Go to Team Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="score-page-container">
      <div className="score-page-header">
        <h1 className="score-page-title">Rivalry Scores</h1>
        <div className="score-page-gender">
          {gender?.charAt(0).toUpperCase() + gender?.slice(1)}'s Fencing
        </div>
        <button
          className="score-page-back-btn"
          onClick={() => navigate('/')}
        >
          Back to Team Selection
        </button>
      </div>

      <div className="score-cards-grid">
        {matchups.map((matchup, index) => (
          <ScoreCard
            key={index}
            matchup={matchup}
            gender={gender}
            onDelete={() => deleteMatchup(index)}
            showDelete={matchups.length > 1}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="score-footer-credits">
        <div className="score-footer-name">Made by Sergei</div>
        <div className="score-footer-suggestions">Suggestions Welcome</div>
      </div>
    </div>
  );
}

export default Score;