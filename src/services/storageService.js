import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import apiClient from "./apiClient";

const DB_NAME = 'SanchitOfflineDB';
const STORE_NAME = 'vault_files';
const DB_VERSION = 1;

class StorageService {
    constructor() {
        this.db = null;
        this.initPromise = this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    async saveFile(file, userId, additionalData = {}) {
        await this.initPromise;

        // 1. Always save locally first (Offline RAG)
        let localResult;
        try {
            localResult = await this.saveToLocal(file, userId, additionalData);
        } catch (e) {
            console.error("Local save failed:", e);
        }

        // 2. Sync to Backend (Cloud Persistence of Extracted Text)
        if (navigator.onLine && userId) {
            // A. Upload File Blob (Cloudinary via Backend)
            this.saveToCloudinary(file, userId).then(async (cloudResult) => {
                // B. Save Metadata + Text to MongoDB
                await this.saveToBackend({
                    uid: userId,
                    name: file.name,
                    url: cloudResult.secure_url,
                    storageType: 'cloudinary',
                    extractedText: additionalData.content, // Critical for avoiding re-indexing
                    size: file.size,
                    type: file.type
                });
                console.log("Cloud backup & Text Sync complete (Cloudinary)");
            }).catch(e => console.warn("Cloud backup failed:", e));
        }
        
        return localResult;
    }

    async saveToBackend(data) {
        try {
            await apiClient.post('/vault', data);
        } catch (e) {
            console.warn("Backend vault sync failed:", e);
        }
    }

    async saveToCloudinary(file, userId) {
        if (!userId) throw new Error("User ID required for cloud storage");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('uid', userId);

        const response = await apiClient.post('/vault/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    }

    // Deprecated: Firebase Upload
    async saveToCloud(file, userId) {
        if (!userId) throw new Error("User ID required for cloud storage");
        
        const fileRef = ref(storage, `users/${userId}/vault/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
            id: Date.now().toString(),
            name: file.name,
            storageType: 'cloud',
            url: downloadURL,
            createdAt: new Date().toISOString(),
            size: file.size,
            type: file.type
        };
    }

    async saveToLocal(file, userId, additionalData = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const fileData = {
                id: Date.now().toString(),
                userId: userId || 'anonymous',
                name: file.name,
                storageType: 'local',
                blob: file, // Store the actual file blob
                createdAt: new Date().toISOString(),
                size: file.size,
                type: file.type,
                ...additionalData // Store extracted text or other metadata
            };

            const request = store.add(fileData);

            request.onsuccess = () => {
                resolve({
                    ...fileData,
                    blob: undefined // Don't return blob in metadata if not needed immediately
                });
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    // Unified get files (Try Backend -> Fallback Local)
    async getFiles(userId) {
        await this.initPromise;
        
        let backendFiles = [];
        if (navigator.onLine && userId) {
            try {
                const res = await apiClient.get(`/vault/${userId}`);
                backendFiles = res.data.map(f => ({
                    ...f,
                    content: f.extractedText // Map backend text to 'content' for RAG
                }));
            } catch (e) {
                console.warn("Backend vault fetch failed, using local only", e);
            }
        }

        const localFiles = await this.getLocalFiles(userId);
        
        // Merge strategy: Use backend files, but if local has a file not in backend (offline created), add it.
        // Or simpler: Just return backend files if we have them, because they contain the text.
        // But what if user is offline? Then backendFiles is empty.
        
        if (backendFiles.length > 0) {
            return backendFiles;
        }
        return localFiles;
    }

    async getLocalFiles(userId) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const files = request.result;
                // Filter by userId if provided
                const userFiles = userId ? files.filter(f => f.userId === userId) : files;
                resolve(userFiles);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    // Helper to sync offline files when online (can be called later)
    async syncOfflineFiles(userId) {
        if (!navigator.onLine) return;
        
        const localFiles = await this.getLocalFiles(userId);
        for (const fileData of localFiles) {
            if (fileData.storageType === 'local' && fileData.blob) {
                try {
                    console.log(`Syncing file ${fileData.name} to cloud...`);
                    // Upload to cloud
                    await this.saveToCloud(fileData.blob, userId);
                    
                    // Remove from local or update status?
                    // For now, let's keep it simple and just leave it or delete it.
                    // Ideally, we delete the blob to save space but keep metadata.
                } catch (err) {
                    console.error("Sync failed for", fileData.name, err);
                }
            }
        }
    }
}

export const storageService = new StorageService();
