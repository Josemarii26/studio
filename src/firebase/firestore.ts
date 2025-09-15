
import { doc, getDoc, setDoc, Timestamp, collection, query, orderBy, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './client';
import type { DayData, UserProfile, ChatMessage } from '@/lib/types';
import { getAuth } from 'firebase/auth';

// We need a serializable version of our types for Firestore
type SerializableDayData = Omit<DayData, 'date'> & {
    date: Timestamp;
};
type SerializableChatMessage = Omit<ChatMessage, 'timestamp'> & {
    timestamp: Timestamp;
};


// --- User Profile Functions ---

/**
 * Loads a user's profile from Firestore.
 * @param userId The UID of the user.
 * @returns The UserProfile object or null if not found.
 */
export const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Missing Firebase Admin credentials. Please set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
    }
    try {
        const docRef = doc(db, 'userProfiles', userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
        console.error("Error loading user profile from Firestore:", error);
        return null;
    }
}

/**
 * Saves a user's profile to Firestore.
 * @param userId The UID of the user.
 * @param profile The UserProfile object to save.
 */
export const saveUserProfile = async (userId: string, profile: UserProfile): Promise<void> => {
    try {
        const docRef = doc(db, 'userProfiles', userId);
        await setDoc(docRef, profile, { merge: true }); // Use merge to avoid overwriting
    } catch (error) {
        console.error("Error saving user profile to Firestore:", error);
    }
}


// --- Daily Nutritional Data Functions ---

// Converts DayData[] to a format Firestore can store (using Timestamps)
const toSerializableDayData = (data: DayData[]): SerializableDayData[] => {
    return data.map(d => ({ ...d, date: Timestamp.fromDate(d.date) }));
};

// Converts data from Firestore (with Timestamps) back to DayData[] (with JS Dates)
const fromSerializableDayData = (data: SerializableDayData[]): DayData[] => {
    return data.map(d => ({ ...d, date: d.date.toDate() }));
};

/**
 * Loads all daily nutritional data for a specific user from Firestore.
 * @param userId The UID of the user.
 * @returns An array of DayData, or an empty array if no data is found.
 */
export const loadDailyDataForUser = async (userId: string): Promise<DayData[]> => {
    try {
        const docRef = doc(db, 'userDailyData', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const serializedData = data.dailyData as SerializableDayData[];
            return fromSerializableDayData(serializedData);
        } else {
            console.log("No daily data document found for user, starting fresh.");
            return [];
        }
    } catch (error) {
        console.error("Error loading user daily data from Firestore:", error);
        return [];
    }
};

/**
 * Saves all daily nutritional data for a specific user to Firestore.
 * @param userId The UID of the user.
 * @param dailyData The complete array of DayData to save.
 */
export const saveDailyDataForUser = async (userId: string, dailyData: DayData[]): Promise<void> => {
    try {
        const docRef = doc(db, 'userDailyData', userId);
        const serializableData = toSerializableDayData(dailyData);
        await setDoc(docRef, { dailyData: serializableData });
    } catch (error) {
        console.error("Error saving user daily data to Firestore:", error);
    }
};


// --- Chat History Functions ---

// Converts ChatMessage[] to a format Firestore can store (using Timestamps)
const toSerializableChatHistory = (messages: ChatMessage[]): SerializableChatMessage[] => {
    return messages.map(m => ({ ...m, timestamp: Timestamp.fromDate(m.timestamp) }));
};

// Converts data from Firestore (with Timestamps) back to ChatMessage[] (with JS Dates)
const fromSerializableChatHistory = (messages: SerializableChatMessage[]): ChatMessage[] => {
    return messages.map(m => ({ ...m, timestamp: m.timestamp.toDate() }));
};

/**
 * Loads the chat history for a specific user from Firestore.
 * @param userId The UID of the user.
 * @returns An array of ChatMessage, or an empty array if no history is found.
 */
export const loadChatHistory = async (userId: string): Promise<ChatMessage[]> => {
    try {
        const docRef = doc(db, 'userChatHistories', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const serializedHistory = data.history as SerializableChatMessage[];
            return fromSerializableChatHistory(serializedHistory);
        } else {
            console.log("No chat history found for user, starting fresh.");
            return [];
        }
    } catch (error) {
        console.error("Error loading chat history from Firestore:", error);
        return [];
    }
};

/**
 * Saves the entire chat history for a specific user to Firestore.
 * @param userId The UID of the user.
 * @param messages The complete array of ChatMessage to save.
 */
export const saveChatHistory = async (userId: string, messages: ChatMessage[]): Promise<void> => {
    try {
        const docRef = doc(db, 'userChatHistories', userId);
        const serializableHistory = toSerializableChatHistory(messages);
        await setDoc(docRef, { history: serializableHistory });
    } catch (error) {
        console.error("Error saving chat history to Firestore:", error);
    }
};

/**
 * Deletes all data associated with a user.
 * @param userId The UID of the user to delete.
 */
export const deleteUserData = async (userId: string): Promise<void> => {
    if (!userId) throw new Error("User ID is required for deletion.");

    try {
        // This requires a Cloud Function to delete the auth user.
        // For now, we will delete the Firestore data.
        const userProfileRef = doc(db, 'userProfiles', userId);
        const userDailyDataRef = doc(db, 'userDailyData', userId);
        const userChatHistoriesRef = doc(db, 'userChatHistories', userId);

        await deleteDoc(userProfileRef);
        await deleteDoc(userDailyDataRef);
        await deleteDoc(userChatHistoriesRef);

    } catch (error) {
        console.error("Error deleting user data from Firestore:", error);
        throw new Error("Failed to delete user data.");
    }
};
