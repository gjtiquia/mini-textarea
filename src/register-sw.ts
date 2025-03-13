// Function to register the service worker
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    } else {
        console.log('Service workers are not supported by this browser');
    }
}

// Check if the app is online
export function isOnline(): boolean {
    return navigator.onLine;
}

// Add offline status listener
export function setupOfflineListener(callback: (isOnline: boolean) => void) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
    // Initial call with current status
    callback(isOnline());
} 