const db = require('../db');

// Function to handle API requests with consistent response format
function createResponse(status, body) {
    return {
        status: status,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}

// Azure Functions entry points for database operations
module.exports = {
    // Application operations
    getApplications: async function(context, req) {
        try {
            const applications = await db.getApplications();
            return createResponse(200, applications);
        } catch (error) {
            context.log.error('Error fetching applications:', error);
            return createResponse(500, { error: 'Failed to fetch applications' });
        }
    },
    
    getApplication: async function(context, req) {
        try {
            const id = req.params.id || req.query.id;
            if (!id) {
                return createResponse(400, { error: 'Application ID is required' });
            }
            
            const application = await db.getApplicationById(id);
            if (!application) {
                return createResponse(404, { error: 'Application not found' });
            }
            
            return createResponse(200, application);
        } catch (error) {
            context.log.error('Error fetching application:', error);
            return createResponse(500, { error: 'Failed to fetch application' });
        }
    },
    
    createApplication: async function(context, req) {
        try {
            const application = req.body;
            if (!application) {
                return createResponse(400, { error: 'Application data is required' });
            }
            
            const id = await db.createApplication(application);
            const createdApplication = await db.getApplicationById(id);
            return createResponse(201, createdApplication);
        } catch (error) {
            context.log.error('Error creating application:', error);
            return createResponse(500, { error: 'Failed to create application' });
        }
    },
    
    updateApplicationStatus: async function(context, req) {
        try {
            const id = req.params.id || req.query.id;
            const { status, adminUser } = req.body;
            
            if (!id || !status || !adminUser) {
                return createResponse(400, { error: 'Application ID, status, and adminUser are required' });
            }
            
            const updatedApp = await db.updateApplicationStatus(id, status, adminUser);
            return createResponse(200, updatedApp);
        } catch (error) {
            context.log.error('Error updating application status:', error);
            return createResponse(500, { error: 'Failed to update application status' });
        }
    },
    
    // User operations
    getUsers: async function(context, req) {
        try {
            const users = await db.getUsers();
            return createResponse(200, users);
        } catch (error) {
            context.log.error('Error fetching users:', error);
            return createResponse(500, { error: 'Failed to fetch users' });
        }
    },
    
    getUserByUsername: async function(context, req) {
        try {
            const username = req.params.username || req.query.username;
            if (!username) {
                return createResponse(400, { error: 'Username is required' });
            }
            
            const user = await db.getUserByUsername(username);
            if (!user) {
                return createResponse(404, { error: 'User not found' });
            }
            
            return createResponse(200, user);
        } catch (error) {
            context.log.error('Error fetching user:', error);
            return createResponse(500, { error: 'Failed to fetch user' });
        }
    },
    
    createUser: async function(context, req) {
        try {
            const user = req.body;
            if (!user) {
                return createResponse(400, { error: 'User data is required' });
            }
            
            const id = await db.createUser(user);
            const createdUser = await db.getUserByUsername(user.username);
            return createResponse(201, createdUser);
        } catch (error) {
            context.log.error('Error creating user:', error);
            return createResponse(500, { error: 'Failed to create user' });
        }
    },
    
    updateUser: async function(context, req) {
        try {
            const id = req.params.id || req.query.id;
            const user = req.body;
            
            if (!id || !user) {
                return createResponse(400, { error: 'User ID and data are required' });
            }
            
            user.id = id;
            await db.updateUser(user);
            const updatedUser = await db.getUserByUsername(user.username);
            return createResponse(200, updatedUser);
        } catch (error) {
            context.log.error('Error updating user:', error);
            return createResponse(500, { error: 'Failed to update user' });
        }
    },
    
    deleteUser: async function(context, req) {
        try {
            const id = req.params.id || req.query.id;
            if (!id) {
                return createResponse(400, { error: 'User ID is required' });
            }
            
            await db.deleteUser(id);
            return createResponse(204, null);
        } catch (error) {
            context.log.error('Error deleting user:', error);
            return createResponse(500, { error: 'Failed to delete user' });
        }
    }
};
