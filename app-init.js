/**
 * Application initialization script
 * Ensures all components start properly on page load
 */

// Global initialization state
window.appInitialized = false;

// Application initialization function
async function initializeApplication() {
    console.log('Initializing application...');
    
    try {
        // Step 1: Initialize database
        if (window.dbClient) {
            const dbInitialized = await window.dbClient.initializeDatabase();
            console.log('Database initialization:', dbInitialized ? 'successful' : 'failed');
        } else {
            console.error('Database client not available');
        }
        
        // Step 2: Check authentication if needed
        const isAdmin = document.getElementById('adminPanel') !== null;
        if (isAdmin) {
            const auth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
            if (!auth.token) {
                console.log('Not authenticated, redirecting to login page');
                window.location.href = '/admin.html';
                return;
            }
        }
        
        // Step 3: Initialize UI components
        if (typeof initializeDashboardUI === 'function') {
            initializeDashboardUI();
        }
        
        // Step 4: Load data
        if (typeof loadApplications === 'function') {
            loadApplications();
        }
        
        console.log('Application initialized successfully');
        window.appInitialized = true;
    } catch (error) {
        console.error('Application initialization failed:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    // DOM is already ready
    initializeApplication();
}
