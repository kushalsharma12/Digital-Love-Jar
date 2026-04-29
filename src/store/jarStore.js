// jarStore.js
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
    // Save to Firebase Cloud Firestore
    await setDoc(doc(db, "jars", jarId), newJar);
    
    // Also save to localStorage as a local backup
    const jars = JSON.parse(localStorage.getItem('jars') || '{}');
    jars[jarId] = newJar;
    localStorage.setItem('jars', JSON.stringify(jars));
    
    return jarId;
  } catch (error) {
    console.error("Firebase Save Error:", error);
    throw error;
  }
};

export const getJar = async (jarId) => {
  try {
    // 1. Try to fetch from Firebase
    const docRef = doc(db, "jars", jarId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Firebase Fetch Error:", error);
  }

  // 2. Fallback to localStorage
  const jars = JSON.parse(localStorage.getItem('jars') || '{}');
  return jars[jarId] || null;
};
