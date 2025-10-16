import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Home.css';

function Home() {
  const navigate = useNavigate();
  const [gender, setGender] = useState('women');
  const [matchups, setMatchups] = useState([
    { id: 1, team1: null, team2: null }
  ]);
  const [currentMatchupId, setCurrentMatchupId] = useState(1);
  const [draggedSchool, setDraggedSchool] = useState(null);

  const allSchools = [
    { name: 'Harvard', logo: '/logos/Harvard.png' },
    { name: 'Yale', logo: '/logos/Yale.png' },
    { name: 'Princeton', logo: '/logos/Princeton.png' },
    { name: 'Columbia', logo: '/logos/Columbia.png' },
    { name: 'UPenn', logo: '/logos/UPenn.png' },
    { name: 'Brown', logo: '/logos/Brown.png' },
    { name: 'Cornell', logo: '/logos/Cornell.png' }
  ];

  const getAvailableSchools = () => {
    if (gender === 'women') {
      // Women: all except Dartmouth (not in logos anyway)
      return allSchools;
    } else {
      // Men: exclude Brown and Cornell
      return allSchools.filter(school =>
        school.name !== 'Brown' && school.name !== 'Cornell'
      );
    }
  };

  const getSelectedSchools = () => {
    const selected = new Set();
    matchups.forEach(m => {
      if (m.team1) selected.add(m.team1.name);
      if (m.team2) selected.add(m.team2.name);
    });
    return selected;
  };

  const isSchoolSelected = (schoolName) => {
    const selectedSchools = getSelectedSchools();
    return selectedSchools.has(schoolName);
  };

  const handleDragStart = (e, school) => {
    // Prevent dragging schools that are already selected
    if (isSchoolSelected(school.name)) {
      e.preventDefault();
      return;
    }
    setDraggedSchool(school);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getCurrentMatchup = () => {
    return matchups.find(m => m.id === currentMatchupId);
  };

  const handleSchoolClick = (school) => {
    // Prevent selecting schools that are already selected in any matchup
    if (isSchoolSelected(school.name)) {
      return;
    }

    const currentMatchup = getCurrentMatchup();
    // Prevent selecting the same school twice in current matchup
    if ((currentMatchup.team1 && currentMatchup.team1.name === school.name) ||
        (currentMatchup.team2 && currentMatchup.team2.name === school.name)) {
      return;
    }

    setMatchups(matchups.map(m => {
      if (m.id === currentMatchupId) {
        if (!m.team1) {
          return { ...m, team1: school };
        } else if (!m.team2) {
          return { ...m, team2: school };
        } else {
          // If both teams are selected, replace team1 and clear team2
          return { ...m, team1: school, team2: null };
        }
      }
      return m;
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, teamSlot) => {
    e.preventDefault();
    if (draggedSchool) {
      const currentMatchup = getCurrentMatchup();
      // Prevent dropping the same school twice
      if ((currentMatchup.team1 && currentMatchup.team1.name === draggedSchool.name && teamSlot !== 'team1') ||
          (currentMatchup.team2 && currentMatchup.team2.name === draggedSchool.name && teamSlot !== 'team2')) {
        setDraggedSchool(null);
        return;
      }

      setMatchups(matchups.map(m => {
        if (m.id === currentMatchupId) {
          if (teamSlot === 'team1') {
            return { ...m, team1: draggedSchool };
          } else {
            return { ...m, team2: draggedSchool };
          }
        }
        return m;
      }));
      setDraggedSchool(null);
    }
  };

  const clearTeam = (teamSlot) => {
    setMatchups(matchups.map(m => {
      if (m.id === currentMatchupId) {
        if (teamSlot === 'team1') {
          return { ...m, team1: null };
        } else {
          return { ...m, team2: null };
        }
      }
      return m;
    }));
  };

  const resetSelection = () => {
    setMatchups(matchups.map(m => {
      if (m.id === currentMatchupId) {
        return { ...m, team1: null, team2: null };
      }
      return m;
    }));
  };

  const addMatchup = () => {
    if (matchups.length < 3) {
      const newId = Math.max(...matchups.map(m => m.id)) + 1;
      setMatchups([...matchups, { id: newId, team1: null, team2: null }]);
      setCurrentMatchupId(newId);
    }
  };

  const deleteMatchup = (id) => {
    if (matchups.length > 1) {
      const newMatchups = matchups.filter(m => m.id !== id);
      setMatchups(newMatchups);
      if (currentMatchupId === id) {
        setCurrentMatchupId(newMatchups[0].id);
      }
    }
  };

  const viewScores = () => {
    const completeMatchups = matchups.filter(m => m.team1 && m.team2);
    if (completeMatchups.length > 0) {
      navigate('/scores', { state: { matchups: completeMatchups, gender } });
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Ivy League Fencing Matchup</h1>
      
      {/* Gender Toggle */}
      <div className="home-gender-toggle">
        <button
          className={`home-toggle-btn ${gender === 'women' ? 'home-active' : ''}`}
          onClick={() => {
            setGender('women');
            setMatchups(matchups.map(m => ({ ...m, team1: null, team2: null })));
          }}
        >
          Women
        </button>
        <button
          className={`home-toggle-btn ${gender === 'men' ? 'home-active' : ''}`}
          onClick={() => {
            setGender('men');
            setMatchups(matchups.map(m => ({ ...m, team1: null, team2: null })));
          }}
        >
          Men
        </button>
      </div>

      {/* Team Selection Area */}
       <div className="home-teams-section">
         <h2 className="home-section-title">Select Teams</h2>
         <div className="home-matchups-container">
           <div className="home-matchups-horizontal">
         {matchups.map((matchup) => (
           <div key={matchup.id} className={`home-matchup-card ${matchup.id === currentMatchupId ? 'active' : ''}`}>
             {matchups.length > 1 && (
               <button
                 className="home-matchup-card-delete"
                 onClick={(e) => {
                   e.stopPropagation();
                   deleteMatchup(matchup.id);
                 }}
               >
                 ×
               </button>
             )}
             <div className="home-teams-container" onClick={() => setCurrentMatchupId(matchup.id)}>
               <div className="home-teams-row">
                 {/* Team 1 */}
                 <div
                   className="home-team-slot"
                   onDragOver={handleDragOver}
                   onDrop={(e) => handleDrop(e, 'team1')}
                 >
                   {matchup.id === currentMatchupId && matchup.team1 ? (
                     <div className="home-selected-team">
                       <img
                         src={matchup.team1.logo}
                         alt={matchup.team1.name}
                         className="home-selected-logo"
                       />
                       <span className="home-selected-name">{matchup.team1.name}</span>
                       <button
                         className="home-clear-btn"
                         onClick={() => clearTeam('team1')}
                       >
                         ×
                       </button>
                     </div>
                   ) : matchup.team1 ? (
                     <div className="home-selected-team">
                       <img
                         src={matchup.team1.logo}
                         alt={matchup.team1.name}
                         className="home-selected-logo"
                       />
                       <span className="home-selected-name">{matchup.team1.name}</span>
                     </div>
                   ) : (
                     <div className="home-empty-slot">
                       <span>Team 1</span>
                     </div>
                   )}
                 </div>

                 {/* Team 2 */}
                 <div
                   className="home-team-slot"
                   onDragOver={handleDragOver}
                   onDrop={(e) => handleDrop(e, 'team2')}
                 >
                   {matchup.id === currentMatchupId && matchup.team2 ? (
                     <div className="home-selected-team">
                       <img
                         src={matchup.team2.logo}
                         alt={matchup.team2.name}
                         className="home-selected-logo"
                       />
                       <span className="home-selected-name">{matchup.team2.name}</span>
                       <button
                         className="home-clear-btn"
                         onClick={() => clearTeam('team2')}
                       >
                         ×
                       </button>
                     </div>
                   ) : matchup.team2 ? (
                     <div className="home-selected-team">
                       <img
                         src={matchup.team2.logo}
                         alt={matchup.team2.name}
                         className="home-selected-logo"
                       />
                       <span className="home-selected-name">{matchup.team2.name}</span>
                     </div>
                   ) : (
                     <div className="home-empty-slot">
                       <span>Team 2</span>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         ))}
           </div>
           {matchups.length < 3 && (
             <div className="home-add-match-btn" onClick={addMatchup}>
               <div className="home-add-match-plus">+</div>
               <div className="home-add-match-text">Add Match</div>
             </div>
           )}
         </div>

         <div className="home-action-buttons">
           {getCurrentMatchup().team1 && getCurrentMatchup().team2 && (
             <button className="home-reset-btn" onClick={resetSelection}>
               Reset This Matchup
             </button>
           )}
           {matchups.filter(m => m.team1 && m.team2).length > 0 && (
             <button
               className="home-view-scores-btn"
               onClick={viewScores}
             >
               View Rivalry Scores ({matchups.filter(m => m.team1 && m.team2).length})
             </button>
           )}
         </div>
       </div>

       {/* Available Schools */}
       <div className="home-schools-section">
         <h2 className="home-section-title">Available Schools</h2>
         <div className="home-schools-grid">
           {getAvailableSchools().map((school) => {
             const isDisabled = isSchoolSelected(school.name);
             return (
               <div
                 key={school.name}
                 className={`home-school-item ${isDisabled ? 'home-school-item-disabled' : ''}`}
                 draggable={!isDisabled}
                 onDragStart={(e) => handleDragStart(e, school)}
                 onClick={() => handleSchoolClick(school)}
               >
                 <img
                   src={school.logo}
                   alt={school.name}
                   className="home-school-logo"
                 />
                 <span className="home-school-name">{school.name}</span>
               </div>
             );
           })}
         </div>
       </div>
    </div>
  );
}

export default Home;