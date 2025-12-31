// firestore.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config';

// Firestore Database Functions
const firestoreDB = {
  // User Operations
  createUser: async (userId, userData) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: new Date().toISOString(),
        subscriptionTier: 'free',
      });
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  getUser: async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, message: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  updateUser: async (userId, updates) => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Birth Details Operations
  saveBirthDetails: async (userId, birthDetails) => {
    try {
      await setDoc(doc(db, 'birthDetails', userId), {
        userId,
        ...birthDetails,
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving birth details:', error);
      throw error;
    }
  },

  getBirthDetails: async (userId) => {
    try {
      const docRef = doc(db, 'birthDetails', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, message: 'Birth details not found' };
      }
    } catch (error) {
      console.error('Error getting birth details:', error);
      throw error;
    }
  },

  // Chat Sessions Operations
  saveChatSession: async (sessionId, sessionData) => {
    try {
      await setDoc(doc(db, 'chatSessions', sessionId), {
        ...sessionData,
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving chat session:', error);
      throw error;
    }
  },

  getUserChatSessions: async (userId) => {
    try {
      const q = query(
        collection(db, 'chatSessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = [];
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: sessions };
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  },

  deleteChatSession: async (sessionId) => {
    try {
      await deleteDoc(doc(db, 'chatSessions', sessionId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  },

  // Chat Messages Operations
  saveChatMessage: async (messageId, messageData) => {
    try {
      await setDoc(doc(db, 'chatMessages', messageId), {
        ...messageData,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  },

  getChatMessages: async (sessionId) => {
    try {
      const q = query(
        collection(db, 'chatMessages'),
        where('sessionId', '==', sessionId),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: messages };
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  },

  // Feedback Operations
  saveFeedback: async (feedbackData) => {
    try {
      const feedbackId = `feedback_${Date.now()}`;
      await setDoc(doc(db, 'feedback', feedbackId), {
        ...feedbackData,
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  },

  // Daily Question Count (for free tier rate limiting)
  incrementQuestionCount: async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'questionCounts', `${userId}_${today}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentCount = docSnap.data().count;
        await updateDoc(docRef, { count: currentCount + 1 });
        return { success: true, count: currentCount + 1 };
      } else {
        await setDoc(docRef, { userId, date: today, count: 1 });
        return { success: true, count: 1 };
      }
    } catch (error) {
      console.error('Error incrementing question count:', error);
      throw error;
    }
  },

  getQuestionCount: async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'questionCounts', `${userId}_${today}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, count: docSnap.data().count };
      } else {
        return { success: true, count: 0 };
      }
    } catch (error) {
      console.error('Error getting question count:', error);
      throw error;
    }
  },
};

export default firestoreDB;