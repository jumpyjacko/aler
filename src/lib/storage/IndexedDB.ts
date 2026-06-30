import { DB_NAME, DB_VERSION, STORES } from "./IDBschema.ts";

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            for (const [storeName, config] of Object.entries(STORES)) {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, config);
                }
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getStore(storeName: string, mode: IDBTransactionMode = "readonly") {
    const db = await openDB();
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    return { store, tx };
}

export async function addItem<T>(storeName: string, item: T) {
    const { store } = await getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
        const request = store.add(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getItem<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    const { store } = await getStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllItems<T>(storeName: string): Promise<T[]> {
    const { store } = await getStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function putItem<T>(storeName: string, item: T) {
    const { store } = await getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
        const request = store.put(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteItem(storeName: string, key: IDBValidKey) {
    const { store } = await getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
        const request = store.delete(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function clearStore(storeName: string) {
    const { store } = await getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    })
}

export async function getAllStores(): Promise<string[]> {
    const db = await openDB();
    const storeNames = Array.from(db.objectStoreNames);
    db.close();
    return storeNames;
}

export function wipeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.deleteDatabase(DB_NAME);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
            console.warn("Database deletion blocked. Please close other open tabs/connections.");
            reject(new Error("Database deletion blocked by an open connection."));
        };
    });
}

// export async function getFromAllStores<T>(key: IDBValidKey): Promise<T | null> {
//     const db = await openDB();
//
//     const storeNames = Array.from(db.objectStoreNames);
//     for (const storeName of storeNames) {
//         try {
//             const result = await getItem<T>(storeName, key);
//             if (result !== undefined) {
//                 return result;
//             }
//         } catch {
//             // do nothing
//         }
//     }
//
//     return null;
// }

interface ExportedStoreItem {
    key: any;
    value: any;
}

interface ExportedDatabase {
    databaseName: string;
    version: number;
    createdAt: string;
    data: {
        [storeName: string]: ExportedStoreItem[];
    };
}

export async function exportDatabase(): Promise<void> {
    const backup: ExportedDatabase = {
        databaseName: DB_NAME,
        version: DB_VERSION,
        createdAt: new Date().toISOString(),
        data: {}
    }

    const storeNames: string[] = await getAllStores();

    for (const storeName of storeNames) {
        try {
            const store = await getAllItems<ExportedStoreItem>(storeName);
            console.log(store);
            backup.data[storeName] = store;
        } catch {
            backup.data[storeName] = [];
        }
    }

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${backup.databaseName}_backup_${new Date().toISOString().slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
