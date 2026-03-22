import React, { useState, useEffect } from 'react';

// --- CSS STİLLERİ (JavaScript Nesnesi Olarak) ---
const styles = {
  gameContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#1a1a1a', // Koyu arka plan
    color: 'white',
    margin: 0,
    padding: 0,
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden', // Kaydırma çubuklarını gizler
    position: 'fixed', // Ekranı sabitlemek için
    top: 0,
    left: 0
  },
  gameContent: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  stimulus: {
    fontSize: '80px',
    fontWeight: 'bold',
    marginBottom: '40px',
    textTransform: 'uppercase'
  },
  buttonGroup: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  },
  gameButton: {
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#333',
    color: 'white',
    border: '2px solid #555',
    borderRadius: '8px',
    transition: 'all 0.2s',
    outline: 'none' // Tıklanınca çıkan mavi çizgiyi yok eder
  },
  trialCounter: {
    marginTop: '30px',
    color: '#888',
    fontSize: '16px'
  }
};
// --------------------------------------------------

const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const maxTrials = 20;

function App() {
  const [currentText, setCurrentText] = useState('');
  const [currentDisplayColor, setCurrentDisplayColor] = useState('');
  const [trialCount, setTrialCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Yeni bir kelime ve renk ayarlar
  const generateTrial = () => {
    const randomText = colors[Math.floor(Math.random() * colors.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentText(randomText);
    setCurrentDisplayColor(randomColor);
    setStartTime(performance.now());
  };

  // İlk başlangıç
  useEffect(() => {
    generateTrial();
  }, []);

  const handleResponse = async (selectedColor) => {
    const endTime = performance.now();
    const reactionTime = endTime - startTime;

    const newLog = {
      trial: trialCount + 1,
      text: currentText,
      color: currentDisplayColor,
      selected: selectedColor,
      isCorrect: selectedColor === currentDisplayColor,
      responseTime: reactionTime
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    if (trialCount + 1 < maxTrials) {
      setTrialCount(prev => prev + 1);
      generateTrial();
    } else {
      setIsCompleted(true);
      await sendResultsToBackend(updatedLogs);
    }
  };

  const sendResultsToBackend = async (finalLogs) => {
    try {
      // Backend portun 5062 olduğu için adresi güncelledik
      const response = await fetch('http://localhost:5062/api/game/submit-stroop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalLogs)
      });

      if (response.ok) {
        console.log("Data successfully sent to TalentMind API");
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };

  // Tamamlandı ekranı
  if (isCompleted) {
    return (
      <div style={styles.gameContainer}>
        <div style={styles.gameContent}>
          <h1 style={{ color: '#4CAF50', fontSize: '40px' }}>Assessment Completed!</h1>
          <p>Your results have been sent to the TalentMind Backend.</p>
          <p>Thank you for participating.</p>
        </div>
      </div>
    );
  }

  // Oyun ekranı
  return (
    <div style={styles.gameContainer}>
      <div style={styles.gameContent}>
        <h1 
          style={{ ...styles.stimulus, color: currentDisplayColor.toLowerCase() }}
        >
          {currentText}
        </h1>

        <div style={styles.buttonGroup}>
          {colors.map((color) => (
            <button
              key={color}
              style={styles.gameButton}
              onClick={() => handleResponse(color)}
              // Hover efekti için basit bir çözüm (inline style'da hover zordur)
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#444';
                e.target.style.borderColor = '#fff';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#333';
                e.target.style.borderColor = '#555';
              }}
            >
              {color}
            </button>
          ))}
        </div>

        <p style={styles.trialCounter}>Trial: {trialCount + 1} / {maxTrials}</p>
      </div>
    </div>
  );
}

export default App;