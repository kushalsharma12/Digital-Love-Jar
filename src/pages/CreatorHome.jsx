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
            alt="Digital Love Jar Logo"
            className={`hero-icon ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <h1 className="hero-title">Digital Love Jar</h1>
        <p className="hero-subtitle">
          Gift a virtual jar filled with your personal notes, memories, and love. 
          Beautifully packaged and ready to be unboxed.
        </p>
        
        <Link to="/create" className="btn-primary">
          Create Your Jar
        </Link>
      </div>
    </div>
  );
}
