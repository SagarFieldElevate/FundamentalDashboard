import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header>
      <div className="header-top">
        <a href="/" className="back-home">← Back to Home</a>
      </div>
      <h1>Developer Activity Dashboard</h1>
      <p className="subtitle">Real-time GitHub metrics for 144+ cryptocurrency projects</p>
      
      <div className="highlight-box">
        <h3>🚀 Fast-Growing Altcoins</h3>
        <p>
          <strong>High Activity Projects (Rank 51-150):</strong> Arweave (AR), Mina Protocol (MINA), GMX, Blur (BLUR), 
          Celestia (TIA), Kaspa (KAS), Render (RENDER), Arbitrum (ARB), Optimism (OP), Jupiter (JUP), 
          Sei (SEI), Injective (INJ), and Movement (MOVE).
        </p>
      </div>
    </header>
  );
};

export default Header;