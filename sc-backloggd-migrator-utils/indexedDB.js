const FIREBASE_METADATA_SECRETS_MAP = async () => {
    return new Promise((resolve) => {
        const request = indexedDB.open("firebaseLocalStorageDb");
        request.onerror = () => resolve(null);
        request.onsuccess = () => {
            try {
                const db = request.result;
                const tx = db.transaction("firebaseLocalStorage", "readonly");
                const store = tx.objectStore("firebaseLocalStorage");
                const getAll = store.getAll();

                getAll.onsuccess = () => {
                    const result = getAll.result;

                    for (const item of result) {
                        if (item.value) {
                            const metadata = {
                                apiKey: item.value.apiKey || item.value?.stsTokenManager?.apiKey || null,
                                authDomain: item.value.authDomain || null,
                                accessToken: item.value?.stsTokenManager?.accessToken || null,
                                email: item.value?.email || null,
                                uid: item.value?.uid || null
                            };
                            resolve(metadata);
                            return;
                        }
                    }
                    resolve(null);
                };
                getAll.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        };
    });
}

module.exports = {
    FIREBASE_METADATA_SECRETS_MAP,
};