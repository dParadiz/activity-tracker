import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {ActivityGroup} from "@/services/ActivityGroup.ts";
import {Activity} from "@/services/Activity.ts";

const DB_NAME = 'activity-tracker';
const DB_VERSION = 1;
const TRACKING_HISTORY_STORE = 'history';
const CONFIG_STORE = 'config';

interface TrackingEntry {
    timestamp: number;
    name: string;
    [key: string]: any;
}



interface ActivityTrackerDB extends DBSchema {
    [TRACKING_HISTORY_STORE]: {
        key: number;
        value: TrackingEntry;
        indexes: {
            'name_idx': string;
        };
    };
    [CONFIG_STORE]: {
        key: string;
        value: ActivityGroup;
    };
}

// Open or upgrade the database
const getDatabase = async (): Promise<IDBPDatabase<ActivityTrackerDB>> => {
    return openDB<ActivityTrackerDB>(DB_NAME, DB_VERSION, {
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

export const loadTrackingHistory = async (name: string): Promise<TrackingEntry[]> => {
    const db = await getDatabase();
    return await db.getAllFromIndex(TRACKING_HISTORY_STORE, 'name_idx', name);
};

export const removeTrackingHistory = async (name: string): Promise<void> => {
    const db = await getDatabase();
    const tx = db.transaction(TRACKING_HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(TRACKING_HISTORY_STORE);
    const index = store.index('name_idx');

    let cursor = await index.openCursor(name);
    while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
    }

    await tx.done;
};

// Add a new entry to the 'history' store
export const saveTrackingEntry = async (entry: TrackingEntry): Promise<void> => {
    const db = await getDatabase();
    try {
        await db.put(TRACKING_HISTORY_STORE, entry);
    } catch {
        await db.add(TRACKING_HISTORY_STORE, entry);
    }
};

export const saveActivityGroup = async (entry: ActivityGroup): Promise<void> => {
    const db = await getDatabase();
    try {
        await db.put(CONFIG_STORE, entry);
    } catch {
        await db.add(CONFIG_STORE, entry);
    }
};



export const loadActivityGroups = async (): Promise<ActivityGroup[]> => {
    const db = await getDatabase();
    const groupData = await db.getAll(CONFIG_STORE);

    return groupData.map(group => {
        const activityGroup = new ActivityGroup(group.name);
        group.activities.forEach((activity) => activityGroup.addActivity(new Activity(activity.name, activity.weight)));
        return activityGroup;
    });
};

export const deleteActivityGroup = async (name: string): Promise<void> => {
    const db = await getDatabase();
    return await db.delete(CONFIG_STORE, name);
};