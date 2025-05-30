import { openDB } from 'idb';

const DB_NAME = 'activity-tracker';
const DB_VERSION = 1;
const TRACKING_HISTORY_STORE = 'history';
const CONFIG_STORE = 'config';
// Open or upgrade the database
const getDatabase = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(TRACKING_HISTORY_STORE)) {
                const store = db.createObjectStore(TRACKING_HISTORY_STORE, { keyPath: 'timestamp' });
                store.createIndex('name_idx', 'name');
            }

            if (!db.objectStoreNames.contains(CONFIG_STORE)) {
                db.createObjectStore(CONFIG_STORE, { keyPath: 'name' });
            }
        },
    });
};

export const loadTrackingHistory = async (name) => {
    const db = await getDatabase();
    return await db.getAllFromIndex(TRACKING_HISTORY_STORE, 'name_idx', name);
};

// Add a new entry to the 'history' store
export const saveTrackingEntry = async (entry) => {
    const db = await getDatabase();
    try {
        await db.put(TRACKING_HISTORY_STORE, entry);
    } catch (error) {
        await db.add(TRACKING_HISTORY_STORE, entry);
    }
};
export const saveActivityGroup = async (entry) => {
    const db = await getDatabase();
    try {
        await db.put(CONFIG_STORE, entry);
    } catch (error) {
        await db.add(CONFIG_STORE, entry);
    }
};

export const loadActivityGroups = async () => {
    const db = await getDatabase();
    return await db.getAll(CONFIG_STORE);
};

export const deleteActivityGroup = async (name) => {
    const db = await getDatabase();
    return await db.delete(CONFIG_STORE, name);
};
