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

export const createJar = (creatorName, labelSettings, chits) => {
  const jarId = generateId();
  const newJar = {
    id: jarId,
    creatorName,
    labelSettings,
    chits,
    createdAt: new Date().toISOString()
  };
  
  const jars = JSON.parse(localStorage.getItem('jars') || '{}');
  jars[jarId] = newJar;
  localStorage.setItem('jars', JSON.stringify(jars));
  
  return jarId;
};

export const getJar = (jarId) => {
  const jars = JSON.parse(localStorage.getItem('jars') || '{}');
  return jars[jarId] || null;
};
