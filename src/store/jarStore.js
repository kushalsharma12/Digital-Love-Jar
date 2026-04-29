// jarStore.js
// Mocking a backend like Firestore using localStorage for the MVP

const generateId = () => Math.random().toString(36).substring(2, 9);

export const defaultColors = [
  { id: 'pink', colorHex: '#fdcfe8', title: 'I love you because...' },
  { id: 'red', colorHex: '#f28b82', title: 'Remember when?' },
  { id: 'yellow', colorHex: '#fff475', title: 'Song lyrics' },
  { id: 'green', colorHex: '#ccff90', title: 'Date ideas' },
  { id: 'blue', colorHex: '#cbf0f8', title: 'Gifts' }
];

export const createJar = async (creatorName, labelSettings, chits) => {
  const jarId = generateId();
  const newJar = {
    id: jarId,
    creatorName,
    labelSettings,
    chits,
    createdAt: new Date().toISOString()
  };
  
  try {
    const response = await fetch('/api/save-jar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newJar),
    });

    if (!response.ok) {
      throw new Error('Failed to save jar to the cloud');
    }

    // Also save to localStorage as a local backup
    const jars = JSON.parse(localStorage.getItem('jars') || '{}');
    jars[jarId] = newJar;
    localStorage.setItem('jars', JSON.stringify(jars));
    
    return jarId;
  } catch (error) {
    console.error('Error saving jar:', error);
    // Even if cloud fails, we return the ID if it's in localStorage, 
    // though the viewer won't see it. Better to handle this in UI.
    throw error;
  }
};

export const getJar = async (jarId) => {
  // 1. Try cloud first (production behavior)
  try {
    const response = await fetch(`/api/get-jar?id=${jarId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Cloud fetch failed, falling back to local:', error);
  }

  // 2. Fallback to localStorage (for development or offline creator)
  const jars = JSON.parse(localStorage.getItem('jars') || '{}');
  return jars[jarId] || null;
};
