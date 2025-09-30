import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Css/Score.css';
import { getRivalryData } from '../utils/scoreManager';

function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const { team1, team2, gender } = location.state || {};
  // Get real rivalry data from localStorage
  const rivalryData = team1 && team2 ? getRivalryData(team1.name, team2.name, gender) : null;

  if (!team1 || !team2) {
    return (
      <div className="score-container">
        <div className="score-placeholder">
          <h2 className="score-title">Rivalry Scores</h2>
          <p className="score-message">Select two teams to view their rivalry history</p>
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
    <div className="score-container">
      <div className="score-card">
        <div className="score-header">
          <h1>Rivalry Scores</h1>
          <div className="score-gender-indicator">
            {gender?.charAt(0).toUpperCase() + gender?.slice(1)}'s Fencing
          </div>
        </div>

        <div className="score-matchup">
          <div className="score-team">
            <img 
              src={team1.logo} 
              alt={team1.name} 
              className="score-team-logo"
            />
            <h2 className="score-team-name">{team1.name}</h2>
            <div className="score-total">{rivalryData.scores[team1.name]?.total || 0}</div>
          </div>

          <div className="score-vs">VS</div>

          <div className="score-team">
            <img 
              src={team2.logo} 
              alt={team2.name} 
              className="score-team-logo"
            />
            <h2 className="score-team-name">{team2.name}</h2>
            <div className="score-total">{rivalryData.scores[team2.name]?.total || 0}</div>
          </div>
        </div>

        <div className="score-breakdown">
          <h3>Weapon Breakdown</h3>
          
          <div className="score-weapon-row">
            <div className="score-weapon-label">Sabre</div>
            <div className="score-weapon-scores">
              <span className={`score-team1-score ${
                (rivalryData.scores[team1.name]?.sabre || 0) > (rivalryData.scores[team2.name]?.sabre || 0) ? 'winning-score' : 
                (rivalryData.scores[team1.name]?.sabre || 0) === (rivalryData.scores[team2.name]?.sabre || 0) ? 'tied-score' : ''
              }`}>
                {rivalryData.scores[team1.name]?.sabre || 0}
              </span>
              <span className="score-divider">-</span>
              <span className={`score-team2-score ${
                (rivalryData.scores[team2.name]?.sabre || 0) > (rivalryData.scores[team1.name]?.sabre || 0) ? 'winning-score' : 
                (rivalryData.scores[team1.name]?.sabre || 0) === (rivalryData.scores[team2.name]?.sabre || 0) ? 'tied-score' : ''
              }`}>
                {rivalryData.scores[team2.name]?.sabre || 0}
              </span>
            </div>
          </div>

          <div className="score-weapon-row">
            <div className="score-weapon-label">Foil</div>
            <div className="score-weapon-scores">
              <span className={`score-team1-score ${
                (rivalryData.scores[team1.name]?.foil || 0) > (rivalryData.scores[team2.name]?.foil || 0) ? 'winning-score' : 
                (rivalryData.scores[team1.name]?.foil || 0) === (rivalryData.scores[team2.name]?.foil || 0) ? 'tied-score' : ''
              }`}>
                {rivalryData.scores[team1.name]?.foil || 0}
              </span>
              <span className="score-divider">-</span>
              <span className={`score-team2-score ${
                (rivalryData.scores[team2.name]?.foil || 0) > (rivalryData.scores[team1.name]?.foil || 0) ? 'winning-score' : 
                (rivalryData.scores[team1.name]?.foil || 0) === (rivalryData.scores[team2.name]?.foil || 0) ? 'tied-score' : ''
              }`}>
                {rivalryData.scores[team2.name]?.foil || 0}
              </span>
            </div>
          </div>

          <div className="score-weapon-row">
            <div className="score-weapon-label">Epee</div>
            <div className="score-weapon-scores">
              <span className={`score-team1-score ${
                (rivalryData.scores[team1.name]?.epee || 0) > (rivalryData.scores[team2.name]?.epee || 0) ? 'winning-score' : 
                (rivalryData.scores[team1.name]?.epee || 0) === (rivalryData.scores[team2.name]?.epee || 0) ? 'tied-score' : ''
              }`}>
                {rivalryData.scores[team1.name]?.epee || 0}
              </span>
              <span className="score-divider">-</span>
              <span className={`score-team2-score ${
                (rivalryData.scores[team2.name]?.epee || 0) > (rivalryData.scores[team1.name]?.epee || 0) ? 'winning-score' : 
                (rivalryData.scores[team1.name]?.epee || 0) === (rivalryData.scores[team2.name]?.epee || 0) ? 'tied-score' : ''
              }`}>
                {rivalryData.scores[team2.name]?.epee || 0}
              </span>
            </div>
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
          <button 
            className="score-back-btn"
            onClick={() => navigate('/')}
          >
            Back to Team Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default Score;