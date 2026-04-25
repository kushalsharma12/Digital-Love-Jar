import { Link } from 'react-router-dom';
import './CreatorHome.css';

export default function CreatorHome() {
  return (
    <div className="home-container">
      <div className="glass-panel hero-panel">
        <img src="/assets/jar_logo.svg" alt="Jar Logo" className="hero-icon jar-logo" />
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
