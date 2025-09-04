
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './client';
import type { DayData } from '@/lib/types';

// We need a serializable version of DayData for Firestore
type SerializableDayData = Omit<DayData, 'date'> & {
    date: Timestamp;
};

// Converts DayData to a format Firestore can store (using Timestamps)
const toSerializable = (data: DayData[]): SerializableDayData[] => {
    return data.map(d => ({ ...d, date: Timestamp.fromDate(d.date) }));
};

// Converts data from Firestore (with Timestamps) back to DayData (with JS Dates)
const fromSerializable = (data: SerializableDayData[]): DayData[] => {
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
            // The data is stored under a 'dailyData' field which is an array
            const serializedData = data.dailyData as SerializableDayData[];
            return fromSerializable(serializedData);
        } else {
            console.log("No daily data document found for user, starting fresh.");
            return [];
        }
    } catch (error) {
        console.error("Error loading user daily data from Firestore:", error);
        // Return empty array on error to prevent app crash
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
        const serializableData = toSerializable(dailyData);
        // Store the entire array in a single field 'dailyData'
        await setDoc(docRef, { dailyData: serializableData });
    } catch (error) {
        console.error("Error saving user daily data to Firestore:", error);
    }
};
