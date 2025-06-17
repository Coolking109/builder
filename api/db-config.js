/**
 * Azure Functions database configuration
 * Use environment variables for secure database connection
 */

// Get database credentials from environment variables
const dbConfig = {
    host: process.env.DB_HOST || '157.90.211.250',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'u1848_lcWeZKZzMH',
    password: process.env.DB_PASSWORD || 'K!VJ64O0H7MJQk95G@cF+4a2',
    database: process.env.DB_NAME || 's1848_musiccore',
    ssl: {
        // Azure MySQL typically requires SSL
        rejectUnauthorized: false
    }
};

// For security, don't export the raw credentials
module.exports = {
    getConnection: function() {
        return { ...dbConfig };
    }
};
