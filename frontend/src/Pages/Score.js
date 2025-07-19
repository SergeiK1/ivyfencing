import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Css/Score.css';

function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const { team1, team2, gender } = location.state || {};
  // Mock rivalry data - in a real app, this would come from a database
  const getRivalryData = (team1Name, team2Name, gender) => {
    // Sample data structure for demonstration
    const mockData = {
      team1: {
        name: team1Name || 'Team 1',
        logo: team1?.logo || '/logos/Harvard.png',
        totalScore: 45,
        weapons: {
          sabre: 18,
          foil: 15,
          epee: 12
        }
      },
      team2: {
        name: team2Name || 'Team 2', 
        logo: team2?.logo || '/logos/Yale.png',
        totalScore: 38,
        weapons: {
          sabre: 12,
          foil: 13,
          epee: 13
        }
      },
      totalMatches: 83,
      lastUpdated: '2024-01-15'
    };
    
    return mockData;
  };

  const rivalryData = getRivalryData(team1?.name, team2?.name, gender);

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
          <h2 className="score-title">Rivalry History</h2>
          <p className="score-subtitle">{gender === 'women' ? "Women's" : "Men's"} Fencing</p>
        </div>
        
        <div className="score-matchup">
          <div className="score-team">
            <img src={rivalryData.team1.logo} alt={rivalryData.team1.name} className="score-team-logo" />
            <h3 className="score-team-name">{rivalryData.team1.name}</h3>
            <div className="score-total">{rivalryData.team1.totalScore}</div>
          </div>
          
          <div className="score-vs">
            <span className="score-vs-text">VS</span>
            <div className="score-match-info">
              <span className="score-total-matches">{rivalryData.totalMatches} matches</span>
            </div>
          </div>
          
          <div className="score-team">
            <img src={rivalryData.team2.logo} alt={rivalryData.team2.name} className="score-team-logo" />
            <h3 className="score-team-name">{rivalryData.team2.name}</h3>
            <div className="score-total">{rivalryData.team2.totalScore}</div>
          </div>
        </div>
        
        <div className="score-breakdown">
          <h4 className="score-breakdown-title">Weapon Breakdown</h4>
          
          <div className="score-weapons">
            <div className="score-weapon-row">
              <div className="score-weapon-label">Sabre</div>
              <div className="score-weapon-scores">
                <span className="score-weapon-team1">{rivalryData.team1.weapons.sabre}</span>
                <span className="score-weapon-divider">-</span>
                <span className="score-weapon-team2">{rivalryData.team2.weapons.sabre}</span>
              </div>
            </div>
            
            <div className="score-weapon-row">
              <div className="score-weapon-label">Foil</div>
              <div className="score-weapon-scores">
                <span className="score-weapon-team1">{rivalryData.team1.weapons.foil}</span>
                <span className="score-weapon-divider">-</span>
                <span className="score-weapon-team2">{rivalryData.team2.weapons.foil}</span>
              </div>
            </div>
            
            <div className="score-weapon-row">
              <div className="score-weapon-label">Epee</div>
              <div className="score-weapon-scores">
                <span className="score-weapon-team1">{rivalryData.team1.weapons.epee}</span>
                <span className="score-weapon-divider">-</span>
                <span className="score-weapon-team2">{rivalryData.team2.weapons.epee}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="score-footer">
          <p className="score-last-updated">Last updated: {rivalryData.lastUpdated}</p>
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