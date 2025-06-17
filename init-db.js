/**
 * Database initialization script
 * This script initializes the database tables and migrates data from localStorage
 */

const db = require('./db');

async function initializeDatabase() {
    try {
        console.log('Testing database connection...');
        const connected = await db.testConnection();
        
        if (!connected) {
            console.error('Failed to connect to the database. Please check your credentials.');
            return;
        }
        
        console.log('Initializing database tables...');
        await db.initializeTables();
        
        // Add default admin user if it doesn't exist
        const adminUser = await db.getUserByUsername('admin');
        if (!adminUser) {
            console.log('Creating default admin user...');
            await db.createUser({
                fullName: 'Admin User',
                discordId: 'admin',
                username: 'admin',
                password: 'weed123',
                role: 'admin'
            });
        }
        
        console.log('Database initialization completed successfully!');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
}

// Run the initialization
initializeDatabase();
