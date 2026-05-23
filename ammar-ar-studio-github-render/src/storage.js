const DB_NAME = 'ammar-ar-studio';
const DB_VERSION = 1;
const STORE_NAME = 'captures';

let databasePromise;

function openDatabase() {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB is not available in this browser.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return databasePromise;
}

function runStore(mode, handler) {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = handler(store);

        transaction.oncomplete = () => resolve(request?.result);
        transaction.onerror = () => reject(transaction.error);
      }),
  );
}

export function makeCaptureId(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(16).slice(2)}`;
}

export async function listCaptures(type) {
  const records = await runStore('readonly', (store) => {
    if (!type) return store.getAll();
    return store.index('type').getAll(type);
  });

  return [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function saveCapture(record) {
  return runStore('readwrite', (store) => store.put(record));
}

export function deleteCapture(id) {
  return runStore('readwrite', (store) => store.delete(id));
}
