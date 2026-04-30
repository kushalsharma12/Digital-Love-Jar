import './Footer.css';

export default function Footer() {
  return (
    <footer className="studio-footer">
      <p>
        Made with <span className="heart">♥</span>{' '}
        <a 
          href="https://www.instagram.com/soulshotsstudio/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="studio-link"
        >
          SoulShots Studio
        </a>
      </p>
    </footer>
  );
}
