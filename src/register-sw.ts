// Function to register the service worker
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Wait until window is loaded
        window.addEventListener('load', async () => {
            try {
                // Attempt to register (or update) the service worker
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    // Make sure service worker controls all pages within scope
                    scope: '/'
                });

                console.log('Service Worker registered with scope:', registration.scope);

                // Check for updates on page load
                registration.update();

                // Set up update detection
                registration.addEventListener('updatefound', () => {
                    // Get the installing worker
                    const newWorker = registration.installing;
                    if (newWorker) {
                        console.log('New service worker is being installed');
                        newWorker.addEventListener('statechange', () => {
                            console.log('Service worker state:', newWorker.state);
                        });
                    }
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        });

        // Handle controller change events (when a new service worker takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service worker controller has changed');
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