import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultColors, createJar } from '../store/jarStore';
import { Plus, X, Link as LinkIcon, Edit2, Check, Trash2, Loader2 } from 'lucide-react';
import './CreatorDashboard.css';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [creatorName, setCreatorName] = useState('');
  const [colors, setColors] = useState(defaultColors);
  const [chits, setChits] = useState([]);
  
  const [chitText, setChitText] = useState('');
  const [selectedColorId, setSelectedColorId] = useState(colors[0].id);

  const [editingColorId, setEditingColorId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddChit = (e) => {
    e.preventDefault();
    if (!chitText.trim()) return;
    setChits([{ id: Math.random().toString(), text: chitText, colorId: selectedColorId }, ...chits]);
    setChitText('');
  };

  const handleRemoveChit = (id) => {
    setChits(chits.filter(c => c.id !== id));
  };

  const handleSaveJar = async () => {
    if (!creatorName) {
      alert("Please enter who this jar is from!");
      return;
    }
    if (chits.length === 0) {
      alert("Please add at least one note to the jar!");
      return;
    }
    
    setIsSaving(true);
    setSaveError('');

    try {
      const jarId = await createJar(creatorName, colors, chits);
      setStep(3);
      navigate(`/create?jarId=${jarId}`);
    } catch (error) {
      console.error("Save error:", error);
      setSaveError("Error. Please try after some time.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditColor = (color) => {
    setEditingColorId(color.id);
    setEditingTitle(color.title);
  };

  const saveColorEdit = () => {
    setColors(colors.map(c => c.id === editingColorId ? { ...c, title: editingTitle } : c));
    setEditingColorId(null);
  };

  const removeColor = (id) => {
    if (colors.length <= 1) {
      alert("You need at least one category!");
      return;
    }
    const updated = colors.filter(c => c.id !== id);
    setColors(updated);
    // Remove all chits associated with this color
    setChits(chits.filter(c => c.colorId !== id));
    // Reset selected color if it was deleted
    if (selectedColorId === id) {
      setSelectedColorId(updated[0].id);
    }
  };

  const addColor = (colorObj) => {
    setColors([...colors, colorObj]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableToAdd = defaultColors.filter(dc => !colors.find(c => c.id === dc.id));

  const currentJarId = new URLSearchParams(window.location.search).get('jarId');
  const shareLink = currentJarId ? `${window.location.origin}/jar/${currentJarId}` : '';

  return (
    <div className="dashboard-container">
      <div className="glass-panel dashboard-panel">
        
        {step === 1 && (
          <div className="step-content split-step">
            <div className="form-side">
              <h2>Step 1: Setup Jar Label</h2>
              <p className="step-desc">Customize what each color represents.</p>
            
            <div className="input-group">
              <div className="input-header">
                <label>Who is this from?</label>
                <span className="char-limit">{creatorName.length}/30</span>
              </div>
              <input 
                type="text" 
                placeholder="E.g., Your Best Friend" 
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="colors-list">
              {colors.map(color => (
                <div key={color.id} className="color-item">
                  <div className="color-swatch" style={{ backgroundColor: color.colorHex }} />
                  {editingColorId === color.id ? (
                    <div className="edit-color-form">
                      <div className="edit-input-wrapper">
                        <input 
                          type="text" 
                          value={editingTitle} 
                          onChange={(e) => setEditingTitle(e.target.value)}
                          maxLength={24}
                          autoFocus
                        />
                        <span className="edit-char-limit">{editingTitle.length}/24</span>
                      </div>
                      <button onClick={saveColorEdit} className="icon-btn" title="Save"><Check size={16} /></button>
                    </div>
                  ) : (
                    <div className="color-title">
                      <span className="category-text">{color.title}</span>
                      <div className="color-actions">
                        <button onClick={() => startEditColor(color)} className="icon-btn edit-btn" title="Edit text"><Edit2 size={14} /></button>
                        <button onClick={() => removeColor(color.id)} className="icon-btn delete-btn" title="Remove category"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Fixed Random Item Preview */}
              <div className="color-item" style={{ opacity: 0.8, borderStyle: 'dashed' }}>
                <div className="color-swatch" style={{ backgroundColor: '#e0e0e0', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }} />
                <div className="color-title">
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Random ♥ (Always Included)</span>
                </div>
              </div>
            </div>

            {availableToAdd.length > 0 && (
              <div className="add-category-section">
                <p>Add another category:</p>
                <div className="available-swatches">
                  {availableToAdd.map(dc => (
                    <button 
                      key={dc.id}
                      className="add-swatch-btn"
                      style={{ backgroundColor: dc.colorHex }}
                      onClick={() => addColor(dc)}
                      title={`Add ${dc.id} category`}
                    >
                      <Plus size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              className="btn-primary mt-4" 
              onClick={() => setStep(2)}
              disabled={!creatorName.trim()}
            >
              Next: Add Notes
            </button>
            </div>

            <div className="jar-preview-side">
              <div className="preview-header">
                <h3>Live Preview</h3>
              </div>
              <div className="preview-container">
                <img src="/jar_with_lid.svg" alt="Jar with lid" className="preview-jar-img" />
                
                <div className="preview-label">
                  <ul className="preview-label-list">
                    {colors.map(color => (
                      <li key={color.id} className="preview-label-row">
                        <span className="preview-color-swatch" style={{ backgroundColor: color.colorHex }} />
                        <span className="preview-color-title">{color.title}</span>
                      </li>
                    ))}
                    <li className="preview-label-row">
                      <span className="preview-color-swatch" style={{ backgroundColor: '#e0e0e0' }} />
                      <span className="preview-color-title" style={{ fontWeight: '600' }}>Random ♥</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content split-view">
            <div className="left-pane">
              <h2>Step 2: Fill the Jar</h2>
              <form onSubmit={handleAddChit} className="add-chit-form">
                <div className="input-header">
                  <label>Write your note:</label>
                  <span className="char-limit">{chitText.length}/280</span>
                </div>
                <textarea 
                  placeholder="Type your message here..." 
                  value={chitText}
                  onChange={(e) => setChitText(e.target.value)}
                  rows={4}
                  maxLength={280}
                />
                
                <div className="color-selector">
                  <label>Select Note Type:</label>
                  <div className="swatches">
                    {colors.map(color => (
                      <div 
                        key={color.id} 
                        className={`swatch-btn ${selectedColorId === color.id ? 'active' : ''}`}
                        style={{ backgroundColor: color.colorHex }}
                        onClick={() => setSelectedColorId(color.id)}
                        title={color.title}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-secondary">
                  <Plus size={18} /> Add Note
                </button>
              </form>
            </div>

            <div className="right-pane">
              <div className="pane-header">
                <h3>Notes in Jar</h3>
                <span className="chit-count">{chits.length} {chits.length === 1 ? 'Note' : 'Notes'}</span>
              </div>
              <div className="chits-list">
                {chits.length === 0 && <p className="empty-state">No notes added yet.</p>}
                {chits.map(chit => {
                  const chitColor = colors.find(c => c.id === chit.colorId);
                  return (
                    <div 
                      key={chit.id} 
                      className="chit-preview" 
                      style={{ '--chit-color': chitColor?.colorHex }}
                    >
                      <div className="chit-preview-content">
                        <span className="chit-category-tag">
                          {chitColor?.title}
                        </span>
                        <p>{chit.text}</p>
                      </div>
                      <button onClick={() => handleRemoveChit(chit.id)} className="remove-btn">
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="actions-column">
                <div className="actions">
                  <button className="btn-text" onClick={() => setStep(1)} disabled={isSaving}>Back</button>
                  <button 
                    className="btn-primary" 
                    onClick={handleSaveJar} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="btn-loading-content">
                        <Loader2 size={18} className="spinner" /> Saving...
                      </span>
                    ) : 'Finish & Share'}
                  </button>
                </div>
                {saveError && <p className="save-error-msg">{saveError}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content success-view">
            <div className="success-icon">🎉</div>
            <h2>Your Jar is Ready!</h2>
            <p>Share this unique link with your loved one to let them open it.</p>
            
            <div className="link-box">
              <input type="text" readOnly value={shareLink} />
              <button 
                className={`btn-secondary copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? (
                  <span className="btn-loading-content">
                    <Check size={18} /> Copied!
                  </span>
                ) : 'Copy Link'}
              </button>
            </div>

            <button className="btn-primary mt-4" onClick={() => navigate(`/jar/${currentJarId}`)}>
              Preview Jar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
