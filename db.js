const mysql = require('mysql2/promise');
const dbConfig = require('./db-config');

// Create a connection pool
const pool = mysql.createPool(dbConfig.getConnection());

// Example function to test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

// Example query function
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Initialize database tables if they don't exist
async function initializeTables() {
    try {
        // Create applications table
        await query(`
            CREATE TABLE IF NOT EXISTS applications (
                id VARCHAR(50) PRIMARY KEY,
                discordId VARCHAR(255),
                age INT,
                timezone VARCHAR(50),
                membershipLength VARCHAR(100),
                previousOwner VARCHAR(10),
                mainDiscord VARCHAR(10),
                friendTagDiscord VARCHAR(10),
                betterThan TEXT,
                whyChooseYou TEXT,
                contribution TEXT,
                offering TEXT,
                understandDenial VARCHAR(10),
                availability TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                timestamp BIGINT,
                statusTimestamp BIGINT,
                lastUpdatedBy VARCHAR(100),
                statusChangeLog JSON
            )
        `);
        
        // Create users table
        await query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id VARCHAR(50) PRIMARY KEY,
                fullName VARCHAR(255),
                discordId VARCHAR(255),
                username VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                role VARCHAR(20) DEFAULT 'user',
                created BIGINT,
                lastUpdated BIGINT
            )
        `);
        
        // Create webhook settings table
        await query(`
            CREATE TABLE IF NOT EXISTS webhook_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                url TEXT,
                enabled BOOLEAN DEFAULT FALSE
            )
        `);
        
        // Create login logs table
        await query(`
            CREATE TABLE IF NOT EXISTS login_logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(100),
                timestamp BIGINT,
                date VARCHAR(50),
                time VARCHAR(50),
                userAgent TEXT
            )
        `);
        
        console.log('Database tables initialized successfully');
        return true;
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

// Functions for applications
async function getApplications() {
    return await query('SELECT * FROM applications ORDER BY timestamp DESC');
}

async function getApplicationById(id) {
    const results = await query('SELECT * FROM applications WHERE id = ?', [id]);
    return results.length > 0 ? results[0] : null;
}

async function createApplication(application) {
    const id = application.id || 'app_' + Date.now();
    const { 
        discordId, age, timezone, membershipLength, previousOwner, mainDiscord, 
        friendTagDiscord, betterThan, whyChooseYou, contribution, offering, 
        understandDenial, availability, timestamp 
    } = application;
    
    // Convert availability array to JSON string if it's an array
    const availabilityStr = Array.isArray(availability) ? JSON.stringify(availability) : availability;
    
    await query(
        `INSERT INTO applications (
            id, discordId, age, timezone, membershipLength, previousOwner, 
            mainDiscord, friendTagDiscord, betterThan, whyChooseYou, contribution, 
            offering, understandDenial, availability, timestamp, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
            id, discordId, age, timezone, membershipLength, previousOwner, 
            mainDiscord, friendTagDiscord, betterThan, whyChooseYou, contribution, 
            offering, understandDenial, availabilityStr, timestamp || Date.now()
        ]
    );
    
    return id;
}

async function updateApplicationStatus(id, status, adminUser) {
    const now = Date.now();
    const app = await getApplicationById(id);
    
    if (!app) {
        throw new Error(`Application not found: ${id}`);
    }
    
    // Create or update status change log
    let statusChangeLog = [];
    if (app.statusChangeLog) {
        try {
            statusChangeLog = JSON.parse(app.statusChangeLog);
        } catch (e) {
            console.error('Error parsing status change log:', e);
        }
    }
    
    // Add new log entry
    statusChangeLog.push({
        status,
        adminUser,
        timestamp: now,
        date: new Date().toLocaleString()
    });
    
    // Update the application
    await query(
        `UPDATE applications SET 
            status = ?, 
            statusTimestamp = ?, 
            lastUpdatedBy = ?,
            statusChangeLog = ?
        WHERE id = ?`,
        [status, now, adminUser, JSON.stringify(statusChangeLog), id]
    );
    
    return await getApplicationById(id);
}

// Functions for users
async function getUsers() {
    return await query('SELECT * FROM admin_users');
}

async function getUserByUsername(username) {
    const results = await query('SELECT * FROM admin_users WHERE username = ?', [username]);
    return results.length > 0 ? results[0] : null;
}

async function createUser(user) {
    const id = user.id || 'user_' + Date.now();
    const now = Date.now();
    
    await query(
        `INSERT INTO admin_users (
            id, fullName, discordId, username, password, role, created, lastUpdated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id, 
            user.fullName, 
            user.discordId, 
            user.username, 
            user.password, // In a real app, this should be hashed
            user.role || 'user', 
            now, 
            now
        ]
    );
    
    return id;
}

async function updateUser(user) {
    const now = Date.now();
    
    await query(
        `UPDATE admin_users SET 
            fullName = ?, 
            discordId = ?, 
            username = ?, 
            password = ?,
            role = ?,
            lastUpdated = ?
        WHERE id = ?`,
        [
            user.fullName, 
            user.discordId, 
            user.username, 
            user.password, // In a real app, this should be hashed
            user.role || 'user',
            now,
            user.id
        ]
    );
    
    return user.id;
}

async function deleteUser(id) {
    await query('DELETE FROM admin_users WHERE id = ?', [id]);
    return true;
}

// Functions for webhook settings
async function getWebhookSettings() {
    const results = await query('SELECT * FROM webhook_settings LIMIT 1');
    return results.length > 0 ? results[0] : { url: '', enabled: false };
}

async function saveWebhookSettings(settings) {
    const existing = await getWebhookSettings();
    
    if (existing.id) {
        await query(
            'UPDATE webhook_settings SET url = ?, enabled = ? WHERE id = ?',
            [settings.url, settings.enabled ? 1 : 0, existing.id]
        );
    } else {
        await query(
            'INSERT INTO webhook_settings (url, enabled) VALUES (?, ?)',
            [settings.url, settings.enabled ? 1 : 0]
        );
    }
    
    return await getWebhookSettings();
}

// Functions for login logs
async function addLoginLog(log) {
    await query(
        `INSERT INTO login_logs (username, timestamp, date, time, userAgent)
        VALUES (?, ?, ?, ?, ?)`,
        [log.username, log.timestamp, log.date, log.time, log.userAgent]
    );
    
    // Limit to latest 100 entries
    const allLogs = await query('SELECT * FROM login_logs ORDER BY timestamp DESC');
    if (allLogs.length > 100) {
        const oldestToKeep = allLogs[99].id;
        await query('DELETE FROM login_logs WHERE id < ?', [oldestToKeep]);
    }
}

async function getLoginLogs() {
    return await query('SELECT * FROM login_logs ORDER BY timestamp DESC LIMIT 100');
}

// Migrations: LocalStorage to Database
async function migrateFromLocalStorage() {
    if (typeof window === 'undefined') return; // Not in browser environment
    
    try {
        // Migrate applications
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        for (const app of applications) {
            const exists = await getApplicationById(app.id || 'legacy_' + app.timestamp);
            if (!exists) {
                await createApplication(app);
            }
        }
        
        // Migrate users
        const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        for (const user of users) {
            const exists = await getUserByUsername(user.username);
            if (!exists) {
                await createUser(user);
            }
        }
        
        // Migrate webhook settings
        const webhookSettings = JSON.parse(localStorage.getItem('webhookSettings') || '{}');
        if (webhookSettings.url) {
            await saveWebhookSettings(webhookSettings);
        }
        
        // Migrate login logs
        const loginLogs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
        for (const log of loginLogs) {
            await addLoginLog(log);
        }
        
        console.log('Migration from localStorage completed successfully');
    } catch (error) {
        console.error('Migration error:', error);
    }
}

module.exports = {
    testConnection,
    query,
    initializeTables,
    getApplications,
    getApplicationById,
    createApplication,
    updateApplicationStatus,
    getUsers,
    getUserByUsername,
    createUser,
    updateUser,
    deleteUser,
    getWebhookSettings,
    saveWebhookSettings,
    addLoginLog,
    getLoginLogs,
    migrateFromLocalStorage
};
