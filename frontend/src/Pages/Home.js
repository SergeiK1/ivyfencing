import React, { useState } from 'react';
import '../Css/Home.css';

function Home() {
  const [gender, setGender] = useState('women');
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
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

  const handleDragStart = (e, school) => {
    setDraggedSchool(school);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSchoolClick = (school) => {
    if (!team1) {
      setTeam1(school);
    } else if (!team2) {
      setTeam2(school);
    } else {
      // If both teams are selected, replace team1 and clear team2
      setTeam1(school);
      setTeam2(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, teamSlot) => {
    e.preventDefault();
    if (draggedSchool) {
      if (teamSlot === 'team1') {
        setTeam1(draggedSchool);
      } else {
        setTeam2(draggedSchool);
      }
      setDraggedSchool(null);
    }
  };

  const clearTeam = (teamSlot) => {
    if (teamSlot === 'team1') {
      setTeam1(null);
    } else {
      setTeam2(null);
    }
  };

  const resetSelection = () => {
    setTeam1(null);
    setTeam2(null);
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
            resetSelection();
          }}
        >
          Women
        </button>
        <button 
          className={`home-toggle-btn ${gender === 'men' ? 'home-active' : ''}`}
          onClick={() => {
            setGender('men');
            resetSelection();
          }}
        >
          Men
        </button>
      </div>

      {/* Team Selection Area */}
       <div className="home-teams-section">
         <h2 className="home-section-title">Select Teams</h2>
         <div className="home-teams-container">
           {/* Team 1 */}
           <div 
             className="home-team-slot"
             onDragOver={handleDragOver}
             onDrop={(e) => handleDrop(e, 'team1')}
           >
             {team1 ? (
               <div className="home-selected-team">
                 <img 
                   src={team1.logo} 
                   alt={team1.name} 
                   className="home-selected-logo"
                 />
                 <span className="home-selected-name">{team1.name}</span>
                 <button 
                   className="home-clear-btn"
                   onClick={() => clearTeam('team1')}
                 >
                   ×
                 </button>
               </div>
             ) : (
               <div className="home-empty-slot">
                 <span>Click or Drag Team 1</span>
               </div>
             )}
           </div>

           <div className="home-vs-divider">VS</div>

           {/* Team 2 */}
           <div 
             className="home-team-slot"
             onDragOver={handleDragOver}
             onDrop={(e) => handleDrop(e, 'team2')}
           >
             {team2 ? (
               <div className="home-selected-team">
                 <img 
                   src={team2.logo} 
                   alt={team2.name} 
                   className="home-selected-logo"
                 />
                 <span className="home-selected-name">{team2.name}</span>
                 <button 
                   className="home-clear-btn"
                   onClick={() => clearTeam('team2')}
                 >
                   ×
                 </button>
               </div>
             ) : (
               <div className="home-empty-slot">
                 <span>Click or Drag Team 2</span>
               </div>
             )}
           </div>
         </div>

         {team1 && team2 && (
           <div className="home-matchup-ready">
             <p className="home-matchup-text">
               Ready for {gender}'s match: {team1.name} vs {team2.name}
             </p>
             <button className="home-reset-btn" onClick={resetSelection}>
               Reset Selection
             </button>
           </div>
         )}
       </div>

       {/* Available Schools */}
       <div className="home-schools-section">
         <h2 className="home-section-title">Available Schools</h2>
         <div className="home-schools-grid">
           {getAvailableSchools().map((school) => (
             <div
                key={school.name}
                className="home-school-item"
                draggable
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
           ))}
         </div>
       </div>
    </div>
  );
}

export default Home;