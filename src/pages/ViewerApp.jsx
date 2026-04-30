import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getJar } from '../store/jarStore';
import gsap from 'gsap';
import './ViewerApp.css';

/* ================================================================
   Deterministic PRNG for stable chit placement
   ================================================================ */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const CHIT_COLORS = ['pink', 'red', 'yellow', 'green', 'blue'];

export default function ViewerApp() {
  const { jarId } = useParams();
  const [jarData, setJarData] = useState(null);
  const [activeChit, setActiveChit] = useState(null);
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const assemblyRef = useRef(null);
  const lidRef = useRef(null);
  const labelRef = useRef(null);
  const overlayRef = useRef(null);
  const chitRevealRef = useRef(null);
  const animatedChitElRef = useRef(null);
  const animatedCloneRef = useRef(null);

  /* ---- Load jar data ---- */
  useEffect(() => {
    const loadJar = async () => {
      const data = await getJar(jarId);
      if (data) {
        setJarData(data);
      } else {
        setShowError(true);
      }
    };
    
    loadJar();
  }, [jarId]);



  /* ---- Generate decorative chits inside jar ---- */
  const decorativeChits = useMemo(() => {
    if (!jarData || !jarData.chits) return [];

    const totalNotes = jarData.chits.length;
    // Cap visible rendered notes to around 24 max for performance
    const renderCount = Math.min(totalNotes, 24);

    // 1. Determine configuration based on note count
    let rowsCount = 1;
    let baseSize = 24; // % width of chit

    if (totalNotes <= 6) {
      rowsCount = 1;
      baseSize = 24; // larger chits
    } else if (totalNotes <= 12) {
      rowsCount = 2;
      baseSize = 20; // medium chits
    } else if (totalNotes <= 20) {
      rowsCount = 3;
      baseSize = 17; // slightly smaller
    } else {
      rowsCount = 4;
      baseSize = 15; // dense pile
    }

    // 2. Pyramidal row distribution (bottom row widest)
    const chitsPerRow = [];
    let remaining = renderCount;
    for (let r = 0; r < rowsCount; r++) {
      if (r === rowsCount - 1) {
        chitsPerRow.push(remaining);
      } else {
        let fraction = (rowsCount - r) / ((rowsCount * (rowsCount + 1)) / 2);
        let count = Math.ceil(renderCount * fraction);
        if (count > remaining - (rowsCount - 1 - r)) {
          count = remaining - (rowsCount - 1 - r);
        }
        chitsPerRow.push(count);
        remaining -= count;
      }
    }

    const generated = [];
    let currentChitIndex = 0;

    for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
      const countInRow = chitsPerRow[rowIndex];
      if (countInRow <= 0) continue;

      // Vertical placement - use a smaller step so rows overlap naturally (rest on each other)
      const verticalStep = 15;
      const rowBaseBottom = rowIndex * verticalStep;

      // Horizontal spread logic
      // Center of container is 50%, but we must offset by chit width to find exact center
      const centerLeft = 50 - (baseSize / 2);
      // Tighten max spread so chits never reach the curved glass walls.
      // The inner glass belly is narrower than the full .chits-pile box,
      // so we apply a 0.62 safety multiplier (vs the old ~1.0) on the bottom
      // row, and let upper rows be slightly wider since the belly widens there.
      const rawHalf = (100 - baseSize) / 2;
      // Bottom rows get tighter (0.62), top rows slightly looser (0.80)
      const rowYProgress = rowsCount === 1 ? 0 : rowIndex / (rowsCount - 1);
      const safetyFactor = 0.62 + rowYProgress * 0.18; // 0.62 → 0.80
      const maxHalfWidth = rawHalf * safetyFactor;
      // Upper rows are narrower still (pyramid)
      const rowSpreadFraction = 1 - (rowYProgress * 0.40); // top row 60% as wide
      const spread = maxHalfWidth * rowSpreadFraction;

      for (let c = 0; c < countInRow; c++) {
        const sourceChit = jarData.chits[currentChitIndex];
        const seed = currentChitIndex * 10 + 1;
        const rand1 = seededRandom(seed);
        const rand2 = seededRandom(seed + 1);
        const rand3 = seededRandom(seed + 2);
        const rand4 = seededRandom(seed + 3);

        // Jitter Y (-4% to +8% relative to row height)
        const jitterY = (rand1 - 0.5) * 12;
        let finalBottom = Math.max(0, Math.min(100, rowBaseBottom + jitterY));

        // Spread evenly across the row's available width
        let expectedXFraction = 0.5;
        if (countInRow > 1) {
          // Stagger alternate rows so they sit in the "valleys" of the row below
          if (rowIndex % 2 === 1) {
            expectedXFraction = (c + 0.5) / countInRow;
          } else {
            expectedXFraction = c / (countInRow - 1);
          }
        }

        const expectedXOffset = (expectedXFraction - 0.5) * 2 * spread;
        // Random X jitter tightened to 15% of spread (was 40%) to avoid edge bleed
        const jitterX = (rand2 - 0.5) * (spread * 0.30);

        const finalLeft = Math.max(0, Math.min(100 - baseSize, centerLeft + expectedXOffset + jitterX));

        // Slight random rotations (-12deg to +12deg)
        const rotate = -12 + rand3 * 24;

        // Slight random scale variance 0.96 to 1.04
        const scale = 0.96 + rand4 * 0.08;

        generated.push({
          ...sourceChit,
          renderId: `${sourceChit.id}_${currentChitIndex}`,
          left: `${finalLeft}%`,
          bottom: `${finalBottom}%`,
          width: `${baseSize}%`,
          rotate,
          scale,
          zIndex: currentChitIndex + 1
        });

        currentChitIndex++;
      }
    }

    return generated;
  }, [jarData]);

  /* ---- Open lid animation ---- */
  const openLid = () => {
    if (isLidOpen) return;
    setIsLidOpen(true);
    gsap.to(lidRef.current, {
      y: -15,
      rotation: 12,
      transformOrigin: 'right center',
      duration: 0.9,
      ease: 'power3.out',
    });
  };

  /* ---- Draw a chit by color ---- */
  const drawChit = (colorId) => {
    if (activeChit) return; // Prevent double-clicks during animation
    if (!isLidOpen) {
      openLid();
      // Wait for lid to open halfway before starting the chit journey
      setTimeout(() => selectAndReveal(colorId), 400);
      return;
    }
    selectAndReveal(colorId);
  };

  const selectAndReveal = (colorId) => {
    let chosen;
    if (colorId === 'random_any') {
      if (jarData.chits.length === 0) return;
      chosen = jarData.chits[Math.floor(Math.random() * jarData.chits.length)];
    } else {
      const available = jarData.chits.filter(c => c.colorId === colorId);
      if (available.length === 0) return;
      chosen = available[Math.floor(Math.random() * available.length)];
    }

    setActiveChit(chosen);

    // Animate reveal after React renders the overlay
    requestAnimationFrame(() => {
      if (!chitRevealRef.current || !overlayRef.current) return;

      animatedChitElRef.current = null;
      const activeMiniChits = Array.from(document.querySelectorAll(`.mini-chit.color-${chosen.colorId}`));
      const tl = gsap.timeline();

      // ─── Phase 1: Warm backdrop fades in ───
      tl.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: 'power1.inOut' }, 0);

      // ─── Phase 2: A mini chit gently rises from the pile ───
      if (activeMiniChits.length > 0) {
        const pickedEl = activeMiniChits[Math.floor(Math.random() * activeMiniChits.length)];
        animatedChitElRef.current = pickedEl;

        // Clone the chit to escape the .chits-pile clip-path
        const pickedRect = pickedEl.getBoundingClientRect();
        const assemblyRect = assemblyRef.current.getBoundingClientRect();
        
        const clone = pickedEl.cloneNode(true);
        clone.classList.add('flying-clone');
        assemblyRef.current.appendChild(clone);
        animatedCloneRef.current = clone;

        // Hide the original inside the pile
        gsap.set(pickedEl, { opacity: 0 });

        // Position clone exactly over the original
        gsap.set(clone, {
          position: 'absolute',
          left: pickedRect.left - assemblyRect.left,
          top: pickedRect.top - assemblyRect.top,
          width: pickedRect.width,
          height: pickedRect.height,
          bottom: 'auto', // Override bottom from original class
          margin: 0,
          zIndex: 2, // Behind label (3) and lid (4)
        });

        // Stage A: Lift gently upward to the neck gap
        tl.to(clone, {
          y: -80,
          x: -15, // Move slightly left towards gap
          scale: parseFloat(pickedEl.dataset.scale || 1) * 1.5,
          duration: 0.6,
          ease: 'power2.out'
        }, 0);

        // Stage B: Float upward out of the jar, growing toward the viewer
        tl.to(clone, {
          y: -220,
          x: -40,
          rotation: (Math.random() - 0.5) * 40,
          scale: 3.0,
          opacity: 0,
          duration: 0.9,
          ease: 'power1.inOut'
        }, 0.5);
      }

      // ─── Phase 3: Jar softly blurs into the background ───
      tl.to(assemblyRef.current, {
        filter: 'blur(6px)',
        opacity: 0.35,
        duration: 1.0,
        ease: 'power2.inOut'
      }, 0.3);

      // ─── Phase 4: Note card materializes — the "unfold" ───
      // It starts small and tilted (like a folded chit), then gracefully
      // expands to full size and settles with a gentle rotation.
      const finalTilt = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
      tl.fromTo(chitRevealRef.current,
        {
          y: 80,
          scale: 0.15,
          opacity: 0,
          rotation: -20
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          rotation: finalTilt,
          duration: 1.4,
          ease: 'power4.out'
        }, 0.7);
    });
  };

  /* ── Close chit — gentle reverse of the reveal ── */
  const closeChit = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Cleanup the clone and restore original
        if (animatedCloneRef.current) {
          animatedCloneRef.current.remove();
          animatedCloneRef.current = null;
        }
        if (animatedChitElRef.current) {
          animatedChitElRef.current.style.opacity = ''; // Restores CSS default opacity
        }
        setActiveChit(null);
      },
    });

    // 1. Note card gently shrinks and fades back toward the jar
    tl.to(chitRevealRef.current, {
      y: 60,
      opacity: 0,
      scale: 0.2,
      rotation: -8,
      duration: 0.6,
      ease: 'power2.in',
    });

    // 2. Backdrop fades out
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power1.inOut',
    }, '-=0.3');

    // 3. Mini chit settles back into the pile
    if (animatedCloneRef.current && animatedChitElRef.current) {
      tl.to(animatedCloneRef.current, {
        y: 0,
        x: 0,
        rotation: 0,
        opacity: 1,
        scale: 1, // original transforms were stripped from clone during GSAP set, it was absolute positioned
        duration: 0.7,
        ease: 'power2.out',
      }, '-=0.4');
    }

    // 4. Jar comes back into focus
    tl.to(assemblyRef.current, {
      filter: 'blur(0px)',
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.5');

    // 5. Lid softly closes
    tl.to(lidRef.current, {
      y: 0,
      rotation: 0,
      duration: 0.7,
      ease: 'power3.inOut',
      onComplete: () => setIsLidOpen(false)
    }, '-=0.3');
  };

  /* ---- Error state ---- */
  if (showError) {
    return (
      <div className="viewer-page error">
        <h2>Jar not found</h2>
        <p>This jar might have been deleted or the link is incorrect.</p>
        <Link to="/" style={{ color: '#ff4d85', fontSize: '1.1rem' }}>
          ← Create a New Jar
        </Link>
      </div>
    );
  }

  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const loadingPhrases = [
    "Capture your favorite moments and keep them safe in a Digital Love Jar.",
    "Small notes. Big stories.",
    "Every little note tells a story worth keeping.",
    "A digital home for your most precious memories.",
    "Curated with love, shared with wonder."
  ];

  useEffect(() => {
    if (!jarData) {
      const interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [jarData, loadingPhrases.length]);

  /* ---- Loading state ---- */
  if (!jarData) {
    return (
      <div className="viewer-page loading-screen">
        <div className="loading-content">
          <div className="loading-spinner-wrapper">
            <div className="loading-dot-pulse" />
          </div>
          <h2 className="loading-title">Loading...</h2>
          <div className="phrase-container">
            {loadingPhrases.map((phrase, idx) => (
              <p 
                key={idx} 
                className={`loading-subtext ${idx === loadingPhraseIndex ? 'active' : ''}`}
              >
                {phrase}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getChitSvg = (colorId) => `/chits_svg/${colorId}_chit.svg`;

  return (
    <div className="viewer-page">
      {/* Header */}
      <div className="viewer-header">
        <h1>A jar full of wonder</h1>
        <p>Curated with love by {jarData.creatorName}</p>
      </div>

      {/* Stage */}
      <div className="stage">
        <div className="jar-assembly" ref={assemblyRef}>

          {/* Layer 1 — Jar body (in normal flow, sets height) */}
          {!imageLoaded && <div className="jar-skeleton" />}
          <img
            src="/jar.svg"
            className={`jar-img ${imageLoaded ? 'loaded' : ''}`}
            alt="Glass jar"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Layer 2 — Chits inside the jar (behind label) */}
          <div className="chits-pile">
            {decorativeChits.map((chit) => (
              <img
                key={chit.renderId || chit.id}
                src={getChitSvg(chit.colorId)}
                className={`mini-chit color-${chit.colorId}`}
                alt=""
                data-scale={chit.scale}
                style={{
                  left: chit.left,
                  bottom: chit.bottom,
                  width: chit.width,
                  zIndex: chit.zIndex,
                  transform: `rotate(${chit.rotate}deg) scale(${chit.scale})`,
                }}
              />
            ))}
          </div>

          {/* Layer 3 — Label card (front of jar) */}
          <div className="jar-label" ref={labelRef}>
            <ul className="label-list">
              {jarData.labelSettings
                .filter((color) => jarData.chits.some(chit => chit.colorId === color.id))
                .map((color) => (
                  <li
                    key={color.id}
                    className="label-row"
                    onClick={() => drawChit(color.id)}
                  >
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: color.colorHex }}
                    />
                    <span className="color-title">{color.title}</span>
                  </li>
                ))}
              {/* Special fixed Random button */}
              {jarData.chits.length > 0 && (
                <li
                  className="label-row fixed-random"
                  onClick={() => drawChit('random_any')}
                  style={{ borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '4px', paddingTop: '8px' }}
                >
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: '#e0e0e0', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                  />
                  <span className="color-title" style={{ fontWeight: '600' }}>Random ♥</span>
                </li>
              )}
            </ul>
          </div>

          {/* Layer 4 — Lid (on top of everything) */}
          <img
            src="/lid.svg"
            className="lid-img"
            ref={lidRef}
            alt="Jar lid"
          />
        </div>
      </div>
      
      {/* Footer / CTA */}
      <div className="viewer-footer">
        <div className="footer-content">
          <h2 className="footer-tagline">Small notes. Big stories.</h2>
          <p className="footer-subtext">Capture your favorite moments and keep them safe in a Digital Love Jar.</p>
        </div>
        <Link to="/" className="btn-secondary cta-btn">
          <Plus size={18} /> Create your Love Jar
        </Link>
      </div>

      <footer className="branding-footer">
        Made with ♥ <a href="https://www.instagram.com/soulshotsstudio/" target="_blank" rel="noopener noreferrer">SoulShots Studio</a>
      </footer>

      {/* Active Chit Overlay */}
      {activeChit && (
        <div className="chit-overlay" ref={overlayRef} onClick={closeChit}>
          <div
            className="chit-reveal"
            ref={chitRevealRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="chit-paper"
              style={{
                backgroundColor:
                  jarData.labelSettings.find(
                    (c) => c.id === activeChit.colorId
                  )?.colorHex || '#fff',
              }}
            >
              <div className="paper-fold" />
              <p>{activeChit.text}</p>
            </div>
            <button className="btn-close-chit" onClick={closeChit}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
