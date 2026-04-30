import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CreatorHome.css';

export default function CreatorHome() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="home-container">
      <div className="hero-panel">
        <div className="hero-icon-container">
          {!imageLoaded && <div className="hero-icon-skeleton" />}
          <img
            src="/jar_logo.svg"
            alt="Digital Jar Logo"
            className={`hero-icon ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <h1 className="hero-title">Digital Jar</h1>
        <p className="hero-subtitle">
          Gift a virtual jar filled with your personal notes, memories, and love. 
          Beautifully packaged and ready to be unboxed.
        </p>
        
        <Link to="/create" className="btn-primary">
          Create Your Jar
        </Link>
      </div>

      <footer className="branding-footer">
        Made with ♥ <a href="https://www.instagram.com/soulshotsstudio/" target="_blank" rel="noopener noreferrer">SoulShots Studio</a>
      </footer>
    </div>
  );
}
