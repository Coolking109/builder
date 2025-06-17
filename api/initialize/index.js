const db = require('../db');

module.exports = async function (context, req) {
    context.log('Database initialization started');
    
    try {
        // Test database connection
        await db.testConnection();
        
        // Initialize database tables
        await db.initializeTables();
        
        // Add default admin user if it doesn't exist
        const adminUser = await db.getUserByUsername('admin');
        if (!adminUser) {
            context.log('Creating default admin user');
            await db.createUser({
                fullName: 'Admin User',
                discordId: 'admin',
                username: 'admin',
                password: 'weed123',
                role: 'admin'
            });
        }
        
        return {
            status: 200,
            body: {
                success: true,
                message: "Database initialized successfully",
                timestamp: new Date().toISOString()
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        context.log.error('Database initialization failed:', error);
        
        return {
            status: 500,
            body: {
                success: false,
                message: "Database initialization failed",
                error: error.message
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
