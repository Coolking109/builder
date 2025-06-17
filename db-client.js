/**
 * Client-side database adapter for Azure Static Web Apps
 * Provides a unified interface for using either the API or localStorage (fallback)
 */

class DatabaseClient {
    constructor() {
        this.useApi = true; // Default to using the API
        this.apiBase = '/api'; // Base URL for API in Azure Static Web Apps
    }
    
    // Helper method for API requests
    async apiRequest(endpoint, options = {}) {
        try {
            if (!this.useApi) {
                throw new Error('API mode disabled');
            }
            
            const response = await fetch(`${this.apiBase}/${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                
                // If response is not ok, throw an error
                if (!response.ok) {
                    throw new Error(data.error || `API error: ${response.status}`);
                }
                
                return data;
            } 
            
            // Handle non-JSON responses
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return { success: true };
            
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            this.useApi = false; // Fallback to localStorage on API failure
            throw error;
        }
    }
    
    // Applications
    async getApplications() {
        try {
            return await this.apiRequest('applications');
        } catch (error) {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('applications') || '[]');
        }
    }
    
    async getApplicationById(id) {
        try {
            return await this.apiRequest(`applications/${id}`);
        } catch (error) {
            // Fallback to localStorage
            const apps = JSON.parse(localStorage.getItem('applications') || '[]');
            return apps.find(app => app.id === id);
        }
    }
    
    async createApplication(application) {
        try {
            return await this.apiRequest('applications', {
                method: 'POST',
                body: JSON.stringify(application)
            });
        } catch (error) {
            // Fallback to localStorage
            application.id = 'app_' + Date.now();
            application.timestamp = Date.now();
            const apps = JSON.parse(localStorage.getItem('applications') || '[]');
            apps.push(application);
            localStorage.setItem('applications', JSON.stringify(apps));
            return application;
        }
    }
    
    async updateApplicationStatus(id, status, adminUser) {
        try {
            return await this.apiRequest(`applications/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, adminUser })
            });
        } catch (error) {
            // Fallback to localStorage
            const apps = JSON.parse(localStorage.getItem('applications') || '[]');
            const appIndex = apps.findIndex(app => app.id === id);
            if (appIndex !== -1) {
                apps[appIndex].status = status;
                apps[appIndex].statusTimestamp = Date.now();
                apps[appIndex].lastUpdatedBy = adminUser;
                apps[appIndex].statusChangeLog = apps[appIndex].statusChangeLog || [];
                apps[appIndex].statusChangeLog.push({
                    status, adminUser, timestamp: Date.now(), 
                    date: new Date().toLocaleString()
                });
                localStorage.setItem('applications', JSON.stringify(apps));
                return apps[appIndex];
            }
            return null;
        }
    }
    
    // Users
    async getUsers() {
        try {
            return await this.apiRequest('users');
        } catch (error) {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('adminUsers') || '[]');
        }
    }
    
    async getUserByUsername(username) {
        try {
            return await this.apiRequest(`users/by-username/${username}`);
        } catch (error) {
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
            return users.find(user => user.username === username);
        }
    }
    
    async createUser(user) {
        try {
            return await this.apiRequest('users', {
                method: 'POST',
                body: JSON.stringify(user)
            });
        } catch (error) {
            // Fallback to localStorage
            user.id = 'user_' + Date.now();
            user.role = user.role || 'user';
            user.created = Date.now();
            const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
            users.push(user);
            localStorage.setItem('adminUsers', JSON.stringify(users));
            return user;
        }
    }
    
    async updateUser(user) {
        try {
            return await this.apiRequest(`users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify(user)
            });
        } catch (error) {
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...user };
                localStorage.setItem('adminUsers', JSON.stringify(users));
                return users[userIndex];
            }
            return null;
        }
    }
    
    async deleteUser(id) {
        try {
            await this.apiRequest(`users/${id}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
            const filteredUsers = users.filter(user => user.id !== id);
            localStorage.setItem('adminUsers', JSON.stringify(filteredUsers));
            return true;
        }
    }
    
    // Webhook settings & logs are handled similarly
    async getWebhookSettings() {
        try {
            return await this.apiRequest('webhook-settings');
        } catch (error) {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('webhookSettings') || '{"url":"","enabled":false}');
        }
    }
    
    async saveWebhookSettings(settings) {
        try {
            return await this.apiRequest('webhook-settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });
        } catch (error) {
            // Fallback to localStorage
            localStorage.setItem('webhookSettings', JSON.stringify(settings));
            return settings;
        }
    }
    
    // Login Logs
    async addLoginLog(log) {
        try {
            return await this.apiRequest('login-logs', {
                method: 'POST',
                body: JSON.stringify(log)
            });
        } catch (error) {
            // Fallback to localStorage
            const logs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
            logs.unshift(log);
            if (logs.length > 100) logs.length = 100;
            localStorage.setItem('loginLogs', JSON.stringify(logs));
            return log;
        }
    }
    
    async getLoginLogs() {
        try {
            return await this.apiRequest('login-logs');
        } catch (error) {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('loginLogs') || '[]');
        }
    }
    
    // Database initialization
    async initializeDatabase() {
        try {
            console.log('Initializing database...');
            const response = await this.apiRequest('initialize');
            console.log('Database initialization result:', response);
            
            // If initialization was successful, migrate data from localStorage if needed
            if (response.success) {
                this.useApi = true;
                await this.migrateFromLocalStorage();
                return true;
            } else {
                this.useApi = false;
                return false;
            }
        } catch (error) {
            console.error('Database initialization failed:', error);
            this.useApi = false;
            return false;
        }
    }
    
    // Migrate data from localStorage to database
    async migrateFromLocalStorage() {
        if (!this.useApi) return false;
        
        try {
            console.log('Checking if migration is needed...');
            
            // Get count of applications in database
            const dbApps = await this.apiRequest('applications');
            
            // If database already has data, skip migration
            if (dbApps && dbApps.length > 0) {
                console.log('Database already has data, skipping migration');
                return true;
            }
            
            console.log('Starting migration from localStorage to database...');
            
            // Migrate applications
            const localApps = JSON.parse(localStorage.getItem('applications') || '[]');
            if (localApps.length > 0) {
                console.log(`Migrating ${localApps.length} applications...`);
                
                for (const app of localApps) {
                    await this.apiRequest('applications', {
                        method: 'POST',
                        body: JSON.stringify(app)
                    });
                }
            }
            
            // Migrate users
            const localUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
            if (localUsers.length > 0) {
                console.log(`Migrating ${localUsers.length} users...`);
                
                for (const user of localUsers) {
                    // Skip if it's the default admin
                    if (user.username === 'admin') continue;
                    
                    await this.apiRequest('users', {
                        method: 'POST',
                        body: JSON.stringify(user)
                    });
                }
            }
            
            // Migrate webhook settings
            const webhookSettings = JSON.parse(localStorage.getItem('webhookSettings') || '{}');
            if (webhookSettings.url) {
                console.log('Migrating webhook settings...');
                
                await this.apiRequest('webhook-settings', {
                    method: 'PUT',
                    body: JSON.stringify(webhookSettings)
                });
            }
            
            console.log('Migration completed successfully');
            return true;
        } catch (error) {
            console.error('Migration failed:', error);
            return false;
        }
    }
}

// Create and export a singleton instance
const dbClient = new DatabaseClient();

// Automatically initialize when in browser
if (typeof window !== 'undefined') {
    window.dbClient = dbClient;
    
    // Initialize database when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            dbClient.initializeDatabase()
                .then(initialized => console.log('Database initialization completed:', initialized))
                .catch(err => console.error('Database initialization error:', err));
        });
    } else {
        // DOM is already ready
        dbClient.initializeDatabase()
            .then(initialized => console.log('Database initialization completed:', initialized))
            .catch(err => console.error('Database initialization error:', err));
    }
}

// Export for module usage
if (typeof module !== 'undefined') {
    module.exports = dbClient;
}
