/**
 * Express server for Azure Web App
 * This file sets up a complete Express server with database connectivity
 */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Database initialization
db.initializeTables()
  .then(() => console.log('Database tables initialized'))
  .catch(err => console.error('Database initialization error:', err));

// API Routes for Applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await db.getApplications();
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/applications/:id', async (req, res) => {
  try {
    const application = await db.getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const id = await db.createApplication(req.body);
    const application = await db.getApplicationById(id);
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { status, adminUser } = req.body;
    if (!status || !adminUser) {
      return res.status(400).json({ error: 'Status and adminUser are required' });
    }
    const application = await db.updateApplicationStatus(req.params.id, status, adminUser);
    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// API Routes for Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/by-username/:username', async (req, res) => {
  try {
    const user = await db.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const id = await db.createUser(req.body);
    // Get the created user
    const user = await db.getUserByUsername(req.body.username);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    await db.updateUser({ ...req.body, id: req.params.id });
    const user = await db.getUserByUsername(req.body.username);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.deleteUser(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// API Routes for Webhook Settings
app.get('/api/webhook-settings', async (req, res) => {
  try {
    const settings = await db.getWebhookSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching webhook settings:', error);
    res.status(500).json({ error: 'Failed to fetch webhook settings' });
  }
});

app.put('/api/webhook-settings', async (req, res) => {
  try {
    await db.saveWebhookSettings(req.body);
    const settings = await db.getWebhookSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error saving webhook settings:', error);
    res.status(500).json({ error: 'Failed to save webhook settings' });
  }
});

// API Routes for Login Logs
app.get('/api/login-logs', async (req, res) => {
  try {
    const logs = await db.getLoginLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ error: 'Failed to fetch login logs' });
  }
});

app.post('/api/login-logs', async (req, res) => {
  try {
    await db.addLoginLog(req.body);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding login log:', error);
    res.status(500).json({ error: 'Failed to add login log' });
  }
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle any routes not matched by the API for SPA support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
