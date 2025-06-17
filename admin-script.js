document.addEventListener('DOMContentLoaded', function() {
    // Define shared variables at the top level of the script
    // so they're accessible to all functions
    let currentApplicationId = null;
    let isEditingUser = false;
    
    // Define UI elements that are used across multiple functions
    let applicationModal = null;
    let settingsModal = null;
    let usersModal = null;
    let applicationsList = null;
    let sortSelect = null;
    let statusFilter = null;
    let approveBtn = null;
    let denyBtn = null;
    
    // User form elements
    let userIdInput = null;
    let userFullNameInput = null;
    let userDiscordIdInput = null;
    let userUsername = null;
    let userPassword = null;
    let cancelEditBtn = null;
    let userForm = null;
    
    // Webhook settings elements
    let webhookUrlInput = null;
    let enableWebhookCheckbox = null;
    let saveSettingsBtn = null;
    let testWebhookBtn = null;
    
    // Check if we're on the login page or dashboard
    const isLoginPage = document.querySelector('.login-form') !== null;
    
    if (isLoginPage) {
        handleLoginPage();
    } else {
        // Check if user is logged in
        if (!isLoggedIn()) {
            window.location.href = 'admin.html';
            return;
        }
        initializeDashboard();
        handleDashboardPage();
    }
    
    // Initialize all UI elements needed across the dashboard
    function initializeDashboard() {
        // Get all modal references
        applicationModal = document.getElementById('applicationModal');
        settingsModal = document.getElementById('settingsModal');
        usersModal = document.getElementById('usersModal');
        
        // Get list and filter elements
        applicationsList = document.getElementById('applicationsList');
        sortSelect = document.getElementById('sortApplications');
        statusFilter = document.getElementById('statusFilter');
        
        // Get action buttons
        approveBtn = document.getElementById('approveBtn');
        denyBtn = document.getElementById('denyBtn');
        
        // Initialize user form elements
        userIdInput = document.getElementById('userId');
        userFullNameInput = document.getElementById('userFullName');
        userDiscordIdInput = document.getElementById('userDiscordId');
        userUsername = document.getElementById('userUsername');
        userPassword = document.getElementById('userPassword');
        cancelEditBtn = document.getElementById('cancelEditBtn');
        userForm = document.getElementById('userForm');
        
        // Initialize webhook elements
        webhookUrlInput = document.getElementById('webhookUrl');
        enableWebhookCheckbox = document.getElementById('enableWebhook');
        saveSettingsBtn = document.getElementById('saveSettingsBtn');
        testWebhookBtn = document.getElementById('testWebhookBtn');
        
        // Log which elements were found
        console.log('Dashboard elements initialized:', {
            applicationModal: !!applicationModal,
            settingsModal: !!settingsModal,
            usersModal: !!usersModal,
            applicationsList: !!applicationsList,
            sortSelect: !!sortSelect,
            statusFilter: !!statusFilter,
            approveBtn: !!approveBtn,
            denyBtn: !!denyBtn,
            userForm: !!userForm
        });
        
        console.log('Webhook elements initialized:', {
            webhookUrlInput: !!webhookUrlInput,
            enableWebhookCheckbox: !!enableWebhookCheckbox,
            saveSettingsBtn: !!saveSettingsBtn,
            testWebhookBtn: !!testWebhookBtn
        });
    }
    
    // Function to handle login page
    function handleLoginPage() {
        const loginBtn = document.getElementById('loginBtn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginError = document.getElementById('loginError');
        
        loginBtn.addEventListener('click', function() {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (username === '' || password === '') {
                showError('Please enter both username and password.');
                return;
            }
            
            // Check against stored users first
            const users = JSON.parse(localStorage.getItem('adminUsers')) || [];
            const matchedUser = users.find(user => user.username === username && user.password === password);
            
            // If user is found in stored users, use their role
            if (matchedUser) {
                logLoginActivity(username);
                
                localStorage.setItem('adminAuth', JSON.stringify({
                    token: 'mock-jwt-token',
                    username: username,
                    role: matchedUser.role || 'user', // Use defined role or default to 'user'
                    timestamp: new Date().getTime()
                }));
                
                window.location.href = 'admin-dashboard.html';
            } 
            // If it's the default admin, give full admin privileges
            else if (username === 'admin' && password === 'weed123') {
                logLoginActivity(username);
                
                localStorage.setItem('adminAuth', JSON.stringify({
                    token: 'mock-jwt-token',
                    username: username,
                    role: 'admin', // Default admin gets full privileges
                    timestamp: new Date().getTime()
                }));
                
                window.location.href = 'admin-dashboard.html';
            } 
            else {
                showError('Invalid username or password.');
            }
        });
        
        function showError(message) {
            loginError.textContent = message;
            loginError.style.display = 'block';
            
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    }
    
    // Function to log login activity
    function logLoginActivity(username) {
        const now = new Date();
        const loginLog = {
            username: username,
            timestamp: now.getTime(),
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            userAgent: navigator.userAgent
        };
        
        // Get existing logs
        const logs = JSON.parse(localStorage.getItem('loginLogs')) || [];
        
        // Add new log entry (keep only the most recent 100 entries)
        logs.unshift(loginLog);
        if (logs.length > 100) {
            logs.length = 100;
        }
        
        // Save logs back to localStorage
        localStorage.setItem('loginLogs', JSON.stringify(logs));
        
        console.log(`Login recorded: ${username} at ${now.toLocaleString()}`);
    }

    // Function to handle dashboard page
    function handleDashboardPage() {
        // Get all the UI elements with null checks
        const logoutBtn = document.getElementById('logoutBtn');
        const settingsBtn = document.getElementById('settingsNavBtn') || document.getElementById('settingsBtn');
        const usersBtn = document.getElementById('usersNavBtn') || document.getElementById('usersBtn');
        applicationsListElement = document.getElementById('applicationsList');
        sortSelectElement = document.getElementById('sortApplications');
        statusFilterElement = document.getElementById('statusFilter');
        const modal = document.getElementById('applicationModal');
        const settingsModal = document.getElementById('settingsModal');
        const usersModal = document.getElementById('usersModal');
        const closeModal = document.querySelector('.close-modal');
        const closeSettings = document.querySelector('.close-settings');
        const closeUsers = document.querySelector('.close-users');
        const approveBtn = document.getElementById('approveBtn');
        const denyBtn = document.getElementById('denyBtn');
        
        // Initialize user management form elements
        userIdInput = document.getElementById('userId');
        userFullNameInput = document.getElementById('userFullName');
        userDiscordIdInput = document.getElementById('userDiscordId');
        userUsername = document.getElementById('userUsername');
        userPassword = document.getElementById('userPassword');
        cancelEditBtn = document.getElementById('cancelEditBtn');
        userForm = document.getElementById('userForm');
        
        // Debug element existence
        console.log('User form elements found:', {
            userIdInput: !!userIdInput,
            userFullNameInput: !!userFullNameInput,
            userDiscordIdInput: !!userDiscordIdInput,
            userUsername: !!userUsername,
            userPassword: !!userPassword,
            cancelEditBtn: !!cancelEditBtn,
            userForm: !!userForm
        });
        
        // Debug which elements are null
        console.log('Element check:', {
            logoutBtn: !!logoutBtn,
            settingsBtn: !!settingsBtn,
            usersBtn: !!usersBtn,
            applicationsList: !!applicationsListElement,
            modal: !!modal,
            settingsModal: !!settingsModal,
            usersModal: !!usersModal,
            closeModal: !!closeModal,
            closeSettings: !!closeSettings,
            closeUsers: !!closeUsers,
            sortSelect: !!sortSelectElement,
            statusFilter: !!statusFilterElement,
            approveBtn: !!approveBtn,
            denyBtn: !!denyBtn
        });
        
        // Add event listeners with null checks
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('adminAuth');
                window.location.href = 'admin.html';
            });
        }
        
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', function() {
                settingsModal.style.display = 'block';
                // Load settings if the function exists
                if (typeof loadWebhookSettings === 'function') {
                    loadWebhookSettings();
                }
            });
        }
        
        if (usersBtn && usersModal) {
            usersBtn.addEventListener('click', function() {
                usersModal.style.display = 'block';
                // Load users if the function exists
                if (typeof loadUsers === 'function') {
                    loadUsers();
                }
                // Load login logs if the function exists
                if (typeof viewLoginLogs === 'function') {
                    viewLoginLogs();
                }
            });
        }
        
        if (closeSettings && settingsModal) {
            closeSettings.addEventListener('click', function() {
                settingsModal.style.display = 'none';
            });
        }
        
        if (closeUsers && usersModal) {
            closeUsers.addEventListener('click', function() {
                usersModal.style.display = 'none';
                if (typeof resetUserForm === 'function') {
                    resetUserForm();
                }
            });
        }
        
        if (sortSelectElement) {
            sortSelectElement.addEventListener('change', function() {
                loadApplications();
            });
        }
        
        if (statusFilterElement) {
            statusFilterElement.addEventListener('change', function() {
                loadApplications();
            });
        }
        
        if (closeModal && modal) {
            closeModal.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }
        
        if (approveBtn) {
            approveBtn.addEventListener('click', function() {
                if (typeof currentApplicationId !== 'undefined' && currentApplicationId !== null) {
                    if (typeof updateApplicationStatus === 'function') {
                        updateApplicationStatus(currentApplicationId, 'approved');
                    }
                    if (typeof loadApplications === 'function') {
                        loadApplications();
                    }
                    if (modal) {
                        modal.style.display = 'none';
                    }
                }
            });
        }
        
        if (denyBtn) {
            denyBtn.addEventListener('click', function() {
                if (typeof currentApplicationId !== 'undefined' && currentApplicationId !== null) {
                    if (typeof updateApplicationStatus === 'function') {
                        updateApplicationStatus(currentApplicationId, 'denied');
                    }
                    if (typeof loadApplications === 'function') {
                        loadApplications();
                    }
                    if (modal) {
                        modal.style.display = 'none';
                    }
                }
            });
        }
        
        // Initialize menu toggle for mobile if it exists
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                document.body.classList.toggle('sidebar-active');
            });
        }
        
        // Run initial functions if they exist
        loadApplications();
        updateDashboardStats();
        
        // Add click outside handler to close modals
        window.addEventListener('click', function(event) {
            if (modal && event.target === modal) {
                modal.style.display = 'none';
            }
            if (settingsModal && event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
            if (usersModal && event.target === usersModal) {
                usersModal.style.display = 'none';
                if (typeof resetUserForm === 'function') {
                    resetUserForm();
                }
            }
        });
    }
    
    // Function to log login activity
    function logLoginActivity(username) {
        const now = new Date();
        const loginLog = {
            username: username,
            timestamp: now.getTime(),
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            userAgent: navigator.userAgent
        };
        
        // Get existing logs
        const logs = JSON.parse(localStorage.getItem('loginLogs')) || [];
        
        // Add new log entry (keep only the most recent 100 entries)
        logs.unshift(loginLog);
        if (logs.length > 100) {
            logs.length = 100;
        }
        
        // Save logs back to localStorage
        localStorage.setItem('loginLogs', JSON.stringify(logs));
        
        console.log(`Login recorded: ${username} at ${now.toLocaleString()}`);
    }

    // Function to handle login page
    function handleLoginPage() {
        const loginBtn = document.getElementById('loginBtn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginError = document.getElementById('loginError');
        
        loginBtn.addEventListener('click', function() {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (username === '' || password === '') {
                showError('Please enter both username and password.');
                return;
            }
            
            // Check against stored users first
            const users = JSON.parse(localStorage.getItem('adminUsers')) || [];
            const matchedUser = users.find(user => user.username === username && user.password === password);
            
            // If user is found in stored users, use their role
            if (matchedUser) {
                logLoginActivity(username);
                
                localStorage.setItem('adminAuth', JSON.stringify({
                    token: 'mock-jwt-token',
                    username: username,
                    role: matchedUser.role || 'user', // Use defined role or default to 'user'
                    timestamp: new Date().getTime()
                }));
                
                window.location.href = 'admin-dashboard.html';
            } 
            // If it's the default admin, give full admin privileges
            else if (username === 'admin' && password === 'weed123') {
                logLoginActivity(username);
                
                localStorage.setItem('adminAuth', JSON.stringify({
                    token: 'mock-jwt-token',
                    username: username,
                    role: 'admin', // Default admin gets full privileges
                    timestamp: new Date().getTime()
                }));
                
                window.location.href = 'admin-dashboard.html';
            } 
            else {
                showError('Invalid username or password.');
            }
        });
        
        function showError(message) {
            loginError.textContent = message;
            loginError.style.display = 'block';
            
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    }
    
    // Function to load webhook settings
    function loadWebhookSettings() {
        console.log('Loading webhook settings');
        
        // Return early if elements don't exist
        if (!webhookUrlInput || !enableWebhookCheckbox) {
            console.error('Webhook settings elements not found');
            return;
        }
        
        const webhookSettings = JSON.parse(localStorage.getItem('webhookSettings')) || {};
        webhookUrlInput.value = webhookSettings.url || '';
        enableWebhookCheckbox.checked = webhookSettings.enabled || false;
        
        console.log('Webhook settings loaded:', webhookSettings);
    }
    
    // Function to save webhook settings
    function saveWebhookSettings() {
        // Return early if elements don't exist
        if (!webhookUrlInput || !enableWebhookCheckbox) {
            console.error('Webhook settings elements not found');
            return;
        }
        
        const webhookSettings = {
            url: webhookUrlInput.value.trim(),
            enabled: enableWebhookCheckbox.checked
        };
        
        localStorage.setItem('webhookSettings', JSON.stringify(webhookSettings));
        alert('Settings saved successfully!');
        
        console.log('Webhook settings saved:', webhookSettings);
    }
    
    // Function to test webhook
    function testWebhook() {
        console.log("Test webhook function called");
        const webhookUrlInput = document.getElementById('webhookUrl');
        
        if (!webhookUrlInput) {
            console.error("Webhook URL input element not found");
            alert("Error: Could not find webhook URL input field");
            return;
        }
        
        const webhookUrl = webhookUrlInput.value.trim();
        const testBtn = document.getElementById('testWebhookBtn');
        
        if (testBtn) {
            // Disable button during test
            testBtn.disabled = true;
            testBtn.textContent = "Sending...";
        }
        
        if (!webhookUrl) {
            alert('Please enter a webhook URL first.');
            
            // Re-enable button
            if (testBtn) {
                testBtn.disabled = false;
                testBtn.textContent = "Test Webhook";
            }
            return;
        }
        
        console.log("Testing webhook:", webhookUrl);
        
        const testMessage = {
            content: null,
            embeds: [
                {
                    title: "Webhook Test",
                    description: "Your webhook is working correctly! You will receive notifications when application statuses change.",
                    color: 3066993, // Green color
                    timestamp: new Date().toISOString()
                }
            ],
            username: "Management Applications",
            avatar_url: "https://www.svgrepo.com/show/308968/cannabis-marijuana-weed-hemp-drug.svg"
        };
        
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testMessage)
        })
        .then(response => {
            console.log("Webhook test response:", response);
            
            // Re-enable button
            if (testBtn) {
                testBtn.disabled = false;
                testBtn.textContent = "Test Webhook";
            }
            
            if (response.ok) {
                alert('Test message sent successfully!');
            } else {
                alert(`Error: ${response.status} ${response.statusText}\n\nCheck your webhook URL and make sure it's correct.`);
            }
        })
        .catch(error => {
            console.error("Webhook test error:", error);
            
            // Re-enable button
            if (testBtn) {
                testBtn.disabled = false;
                testBtn.textContent = "Test Webhook";
            }
            
            alert('Error sending test message: ' + error.message);
        });
    }
    
    // Function to send webhook notification
    function sendApplicationWebhook(application, status, adminUser) {
        const webhookSettings = JSON.parse(localStorage.getItem('webhookSettings')) || {};
        
        if (!webhookSettings.enabled || !webhookSettings.url) {
            return; // Webhook not enabled or URL not set
        }
        
        const discordId = application.discordId || 'Unknown User';
        let color, title, content;
        
        // Get the membership length - ensure it's not empty
        const memberSince = application.membershipLength || "Not specified";
        
        if (status === 'approved') {
            color = 5763719; // Green
            title = "Management Application Approved"; // Removed admin name from title
            content = `<@${discordId}> Your management application for TWD has been accepted! Please make a general support ticket in the <#1311552003926786112> channel to get setup.`;
        } else {
            color = 15548997; // Red
            title = "Management Application Denied"; // Removed admin name from title
            content = `<@${discordId}> Your management application has been denied.`;
        }
        
        const message = {
            content: content,
            embeds: [
                {
                    title: title,
                    description: status === 'approved' ? 
                        "Congratulations! Your application has been reviewed and approved by our team. Follow the instructions above to complete the next steps." : 
                        "Thank you for your interest. Unfortunately, your application was not approved at this time.",
                    color: color,
                    fields: [
                        {
                            name: "Discord ID",
                            value: discordId,
                            inline: true
                        },
                        {
                            name: "Member Since",
                            value: memberSince,
                            inline: true
                        },
                        {
                            name: "Available Days",
                            value: Array.isArray(application.availability) ? 
                                application.availability.join(', ') : "Not specified",
                            inline: false
                        }
                        // Removed "Processed By" field
                    ],
                    // Removed footer that showed admin name
                    timestamp: new Date().toISOString()
                }
            ],
            username: "Management Applications",
            avatar_url: "https://www.svgrepo.com/show/308968/cannabis-marijuana-weed-hemp-drug.svg",
            allowed_mentions: {
                users: [discordId.replace(/[^0-9]/g, '')] // Only allow pinging the specific user
            }
        };
        
        // Still log the admin info for internal tracking
        console.log(`Application processed by admin: ${adminUser} at ${new Date().toLocaleString()}`);
        console.log("Full application data:", application);
        
        sendWebhookMessage(webhookSettings.url, message);
    }
    
    // Function to send webhook message
    function sendWebhookMessage(webhookUrl, message) {
        return fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });
    }
    
    // Function to load applications with current filters
    function loadApplications() {
        try {
            if (!applicationsListElement) {
                console.warn("Applications list element not found");
                return;
            }
            
            // Get applications from localStorage
            let applications = JSON.parse(localStorage.getItem('applications')) || [];
            
            // Apply filters if filter element exists
            if (statusFilterElement) {
                const filterValue = statusFilterElement.value;
                if (filterValue !== 'all') {
                    applications = applications.filter(app => {
                        // Handle both explicit status and implicit pending (no status)
                        if (filterValue === 'pending') {
                            return !app.status || app.status === 'pending';
                        }
                        return app.status === filterValue;
                    });
                }
            }
            
            // Apply sorting if sort element exists
            if (sortSelectElement) {
                const sortOrder = sortSelectElement.value;
                applications = applications.sort((a, b) => {
                    return sortOrder === 'newest' ? 
                        b.timestamp - a.timestamp : 
                        a.timestamp - b.timestamp;
                });
            } else {
                // Default sorting (newest first) if element doesn't exist
                applications = applications.sort((a, b) => b.timestamp - a.timestamp);
            }
            
            // Clear the container
            applicationsListElement.innerHTML = '';
            
            // Check if we have applications
            if (applications.length === 0) {
                applicationsListElement.innerHTML = '<div class="empty-state"><p>No applications match your criteria.</p></div>';
                return;
            }
            
            // Create application cards
            applications.forEach((application) => {
                try {
                    const card = createApplicationCard(application);
                    applicationsListElement.appendChild(card);
                } catch (cardError) {
                    console.error("Error creating card:", cardError, application);
                }
            });
            
            // Update dashboard stats after loading applications
            if (typeof updateDashboardStats === 'function') {
                updateDashboardStats();
            }
        } catch (error) {
            console.error("Error loading applications:", error);
            if (applicationsListElement) {
                applicationsListElement.innerHTML = '<div class="empty-state"><p>Error loading applications. Please try refreshing the page.</p></div>';
            }
        }
    }
    
    // Function to create application card
    function createApplicationCard(application) {
        if (!application) return document.createElement('div'); // Safeguard against null/undefined
        
        const card = document.createElement('div');
        card.className = 'application-card';
        card.dataset.id = application.id || 'legacy_' + (application.timestamp || Date.now()); // More robust ID handling
        
        // Format date safely
        const date = new Date(application.timestamp || Date.now());
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Get status (default to pending if not set)
        const status = application.status || 'pending';
        const statusClass = status.toLowerCase().replace(/\s+/g, '-'); // Ensure valid CSS class
        const statusBadge = `<span class="status-badge status-${statusClass}">${status}</span>`;
        
        // Safely get values with fallbacks
        const discordId = application.discordId || 'Unknown';
        const age = application.age || 'Not specified';
        const timezone = application.timezone || 'Not specified';
        const memberSince = application.membershipLength || 'Not specified';
        
        // Create card HTML
        card.innerHTML = `
            <div class="card-status">
                ${statusBadge}
            </div>
            <div class="card-header">
                <h3>Applicant: ${discordId}</h3>
                <span class="card-timestamp">${formattedDate}</span>
            </div>
            <div class="card-content">
                <p><span class="label">Age:</span> <span class="value">${age}</span></p>
                <p><span class="label">Timezone:</span> <span class="value">${timezone}</span></p>
                <p><span class="label">Member Since:</span> <span class="value">${memberSince}</span></p>
            </div>
            <div class="card-actions">
                <button class="view-btn">View Details</button>
                ${status === 'pending' ? `
                    <button class="approve-btn">Approve</button>
                    <button class="deny-btn">Deny</button>
                ` : ''}
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showApplicationDetails(application);
        });
        
        // Add approval/denial event listeners if applicable
        const approveCardBtn = card.querySelector('.approve-btn');
        const denyCardBtn = card.querySelector('.deny-btn');
        
        if (approveCardBtn) {
            approveCardBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const appId = card.dataset.id;
                updateApplicationStatus(appId, 'approved');
                loadApplications();
            });
        }
        
        if (denyCardBtn) {
            denyCardBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const appId = card.dataset.id;
                updateApplicationStatus(appId, 'denied');
                loadApplications();
            });
        }
        
        // Add click event for the entire card
        card.addEventListener('click', () => {
            showApplicationDetails(application);
        });
        
        return card;
    }
    
    // Function to display application details in modal
    function showApplicationDetails(application) {
        if (!application) return; // Safeguard against null/undefined
        
        if (!applicationModal) {
            console.error('Application modal not found');
            return;
        }
        
        const detailsContainer = document.getElementById('applicationDetails');
        if (!detailsContainer) {
            console.error('Application details container not found');
            return;
        }
        
        const date = new Date(application.timestamp || Date.now());
        currentApplicationId = application.id || 'legacy_' + (application.timestamp || Date.now());
        
        // Get application status
        const status = application.status || 'pending';
        const statusClass = `status-${status}`;
        const statusBadge = `<span class="status-badge ${statusClass}">${status}</span>`;
        
        // Safely display all fields with fallbacks
        function safeValue(value, defaultText = 'Not provided') {
            if (value === undefined || value === null || value === '') return defaultText;
            return value;
        }
        
        // Build details HTML
        let detailsHTML = `
            <div class="application-status">
                <span class="status-label">Status:</span>
                ${statusBadge}
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Discord ID</div>
                <div class="detail-value">${safeValue(application.discordId)}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Submission Date</div>
                <div class="detail-value">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Age</div>
                <div class="detail-value">${safeValue(application.age)}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Previous Friend Tag Owner</div>
                <div class="detail-value">${application.previousOwner === 'yes' ? 'Yes' : 'No'}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Timezone</div>
                <div class="detail-value">${safeValue(application.timezone)}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">What makes you better than other applicants?</div>
                <div class="detail-value">${safeValue(application.betterThan)}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Why should we choose you?</div>
                <div class="detail-value">${safeValue(application.whyChooseYou)}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Potential Contributions</div>
                <div class="detail-value">${safeValue(application.contribution)}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Membership Length</div>
                <div class="detail-value">${safeValue(application.membershipLength)}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Available Days</div>
                <div class="detail-value">${Array.isArray(application.availability) ? 
                    application.availability.join(', ') : 
                    safeValue(application.availability, 'None selected')}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">What do you have to offer?</div>
                <div class="detail-value">${safeValue(application.offering)}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">Understands application policy</div>
                <div class="detail-value">${application.understandDenial === 'yes' ? 'Yes' : 'No'}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">In California Roleplay Discord</div>
                <div class="detail-value">${application.mainDiscord === 'yes' ? 'Yes' : 'No'}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">In Friend Tag Discord</div>
                <div class="detail-value">${application.friendTagDiscord === 'yes' ? 'Yes' : 'No'}</div>
            </div>`;

        // Add status change history if available
        if (status !== 'pending' && application.lastUpdatedBy) {
            detailsHTML += `
            <div class="detail-group status-history">
                <div class="detail-label">Status Changed By</div>
                <div class="detail-value">${safeValue(application.lastUpdatedBy)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Status Changed On</div>
                <div class="detail-value">${new Date(application.statusTimestamp || Date.now()).toLocaleString()}</div>
            </div>`;
            
            // Add status change log if available
            if (Array.isArray(application.statusChangeLog) && application.statusChangeLog.length > 0) {
                detailsHTML += `
                <div class="detail-group">
                    <div class="detail-label">Status History</div>
                    <div class="detail-value status-log">
                        <ul class="status-log-list">`;
                
                application.statusChangeLog.forEach(log => {
                    detailsHTML += `
                            <li>
                                <span class="status-badge status-${log.status}">${log.status}</span>
                                by <strong>${log.adminUser || 'Unknown'}</strong> 
                                on ${log.date || new Date(log.timestamp).toLocaleString()}
                            </li>`;
                });
                
                detailsHTML += `
                        </ul>
                    </div>
                </div>`;
            }
        }
        
        // Update modal content
        detailsContainer.innerHTML = detailsHTML;
        
        // Show/hide action buttons based on status
        if (status === 'pending') {
            if (approveBtn) {
                approveBtn.disabled = false;
                approveBtn.style.display = 'block';
            }
            if (denyBtn) {
                denyBtn.disabled = false;
                denyBtn.style.display = 'block';
            }
        } else {
            if (approveBtn) approveBtn.style.display = 'none';
            if (denyBtn) denyBtn.style.display = 'none';
        }
        
        // Display the modal
        applicationModal.style.display = 'block';
    }
    
    // Function to update application status by ID 
    function updateApplicationStatus(applicationId, status) {
        // Get applications from localStorage
        let applications = JSON.parse(localStorage.getItem('applications')) || [];
        
        // Find the application by ID
        const applicationIndex = applications.findIndex(app => 
            (app.id && app.id === applicationId) || 
            (!app.id && 'legacy_' + app.timestamp === applicationId)
        );
        
        // Update status if found
        if (applicationIndex !== -1) {
            // Get current admin info
            const auth = JSON.parse(localStorage.getItem('adminAuth')) || {};
            const adminUser = auth.username || 'Unknown Admin';
            
            applications[applicationIndex].status = status;
            applications[applicationIndex].statusTimestamp = new Date().getTime();
            applications[applicationIndex].lastUpdatedBy = adminUser;
            applications[applicationIndex].statusChangeLog = applications[applicationIndex].statusChangeLog || [];
            
            // Add entry to status change log
            applications[applicationIndex].statusChangeLog.push({
                status: status,
                adminUser: adminUser,
                timestamp: new Date().getTime(),
                date: new Date().toLocaleString()
            });
            
            console.log(`Application ${applicationId} ${status} by admin: ${adminUser} at ${new Date().toLocaleString()}`);
            
            // Send webhook notification with admin info
            sendApplicationWebhook(applications[applicationIndex], status, adminUser);
            
            // Save back to localStorage
            localStorage.setItem('applications', JSON.stringify(applications));
        }
    }
    
    // Dedicated function to handle user management
    function initializeUserManagement() {
        console.log('Setting up user management functionality');
        
        // Get all required elements
        const userForm = document.getElementById('userForm');
        const userFullNameInput = document.getElementById('userFullName');
        const userDiscordIdInput = document.getElementById('userDiscordId');
        const userUsername = document.getElementById('userUsername');
        const userPassword = document.getElementById('userPassword');
        const userIdInput = document.getElementById('userId');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const usersList = document.getElementById('usersList');
        
        // Verify elements exist
        console.log('User management elements found:', {
            userForm: !!userForm,
            userFullNameInput: !!userFullNameInput,
            userDiscordIdInput: !!userDiscordIdInput,
            userUsername: !!userUsername,
            userPassword: !!userPassword,
            userIdInput: !!userIdInput,
            cancelEditBtn: !!cancelEditBtn,
            usersList: !!usersList
        });
        
        if (!userForm) {
            console.error('User form not found - cannot set up user management');
            return;
        }
        
        // Set up form submission handler
        userForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('User form submitted');
            
            // Validate inputs
            if (!userFullNameInput || !userDiscordIdInput || !userUsername || !userPassword) {
                console.error('Form fields not found');
                alert('Error: Required form fields are missing');
                return;
            }
            
            // Get form values
            const fullName = userFullNameInput.value.trim();
            const discordId = userDiscordIdInput.value.trim();
            const username = userUsername.value.trim();
            const password = userPassword.value.trim();
            
            // Validate required fields
            if (!fullName || !discordId || !username || !password) {
                alert('Please fill in all required fields');
                return;
            }
            
            console.log('Processing user data:', { fullName, discordId, username, password: '****' });
            
            // Get existing users
            let users = [];
            try {
                const storedUsers = localStorage.getItem('adminUsers');
                users = storedUsers ? JSON.parse(storedUsers) : [];
                console.log(`Retrieved ${users.length} existing users`);
            } catch (error) {
                console.error('Error loading users:', error);
                users = [];
            }
            
            // Check if we're editing or adding
            const isEditing = userIdInput && userIdInput.value;
            
            if (isEditing) {
                // Update existing user
                const userId = userIdInput.value;
                const index = users.findIndex(user => user.id === userId);
                
                if (index !== -1) {
                    // Update user properties
                    users[index].fullName = fullName;
                    users[index].discordId = discordId;
                    users[index].username = username;
                    users[index].password = password;
                    users[index].lastUpdated = new Date().getTime();
                    
                    console.log(`Updated user: ${username} (ID: ${userId})`);
                } else {
                    console.error(`User not found for editing: ${userId}`);
                    alert('Error: User not found');
                    return;
                }
            } else {
                // Check for duplicate username
                if (users.some(user => user.username === username)) {
                    alert('Username already exists. Please choose a different one.');
                    return;
                }
                
                // Add new user
                const newUser = {
                    id: 'user_' + Date.now(),
                    fullName: fullName,
                    discordId: discordId,
                    username: username,
                    password: password,
                    role: 'user',  // Default role for new users
                    created: new Date().getTime()
                };
                
                users.push(newUser);
                console.log(`Created new user: ${username} (ID: ${newUser.id})`);
            }
            
            // Save to localStorage
            try {
                localStorage.setItem('adminUsers', JSON.stringify(users));
                
                // Success message
                const message = isEditing ? 'User updated successfully!' : 'New user created successfully!';
                alert(message);
                
                // Reset form
                userForm.reset();
                if (userIdInput) userIdInput.value = '';
                if (cancelEditBtn) cancelEditBtn.style.display = 'none';
                
                // Reload users list
                loadUsers();
            } catch (error) {
                console.error('Error saving users:', error);
                alert('Failed to save user data. Error: ' + error.message);
            }
        });
        
        // Add handler for cancel button
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function() {
                userForm.reset();
                if (userIdInput) userIdInput.value = '';
                cancelEditBtn.style.display = 'none';
                console.log('Edit cancelled');
            });
        }
        
        // Initial load of users
        loadUsers();
    }
    
    // Function to load and display users
    function loadUsers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) {
            console.error('Users list container not found');
            return;
        }
        
        console.log('Loading users list');
        usersList.innerHTML = '';
        
        // Get users from localStorage
        let users = [];
        try {
            const storedUsers = localStorage.getItem('adminUsers');
            users = storedUsers ? JSON.parse(storedUsers) : [];
            console.log(`Loaded ${users.length} users from storage`);
        } catch (error) {
            console.error('Error parsing users:', error);
            users = [];
        }
        
        // Display empty message if no users
        if (users.length === 0) {
            usersList.innerHTML = '<p class="empty-message">No users found. Add your first user above.</p>';
            return;
        }
        
        // Create user list items
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-info">
                    <strong>${user.username}</strong> <span class="user-role">(${user.role || 'user'})</span>
                    <div class="user-details">${user.fullName || ''} ${user.discordId ? `(${user.discordId})` : ''}</div>
                </div>
                <div class="user-actions">
                    <button class="edit-user-btn" data-id="${user.id}">Edit</button>
                    <button class="delete-user-btn" data-id="${user.id}">Delete</button>
                </div>
            `;
            
            usersList.appendChild(userElement);
        });
        
        // Add event listeners for buttons
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editUser(this.dataset.id);
            });
        });
        
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteUser(this.dataset.id);
            });
        });
    }
    
    // Function to edit user
    function editUser(userId) {
        // Get form elements
        const userIdInput = document.getElementById('userId');
        const userFullNameInput = document.getElementById('userFullName');
        const userDiscordIdInput = document.getElementById('userDiscordId');
        const userUsername = document.getElementById('userUsername');
        const userPassword = document.getElementById('userPassword');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const userForm = document.getElementById('userForm');
        
        if (!userIdInput || !userFullNameInput || !userDiscordIdInput || 
            !userUsername || !userPassword || !cancelEditBtn) {
            console.error('Required form elements not found');
            return;
        }
        
        // Get users from localStorage
        let users = [];
        try {
            const storedUsers = localStorage.getItem('adminUsers');
            users = storedUsers ? JSON.parse(storedUsers) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return;
        }
        
        // Find the user
        const user = users.find(u => u.id === userId);
        if (!user) {
            console.error(`User not found: ${userId}`);
            return;
        }
        
        console.log(`Editing user: ${user.username}`);
        
        // Populate form fields
        userIdInput.value = user.id;
        userFullNameInput.value = user.fullName || '';
        userDiscordIdInput.value = user.discordId || '';
        userUsername.value = user.username || '';
        userPassword.value = user.password || '';
        
        // Show the cancel button
        cancelEditBtn.style.display = 'inline-block';
        
        // Change submit button text
        const submitBtn = userForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update User';
        }
        
        // Scroll to form
        userForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to delete user
    function deleteUser(userId) {
        // Get users from localStorage
        let users = [];
        try {
            const storedUsers = localStorage.getItem('adminUsers');
            users = storedUsers ? JSON.parse(storedUsers) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return;
        }
        
        // Find user to delete
        const userToDelete = users.find(user => user.id === userId);
        if (!userToDelete) {
            alert('User not found.');
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete user "${userToDelete.username}"?`)) {
            return;
        }
        
        console.log(`Deleting user: ${userToDelete.username}`);
        
        // Remove user
        const updatedUsers = users.filter(user => user.id !== userId);
        
        // Save updated list
        try {
            localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
            alert('User deleted successfully!');
            loadUsers(); // Refresh list
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Error: ' + error.message);
        }
    }

    // Function to update dashboard stats
    function updateDashboardStats() {
        const pendingCount = document.getElementById('pendingCount');
        const approvedCount = document.getElementById('approvedCount');
        const deniedCount = document.getElementById('deniedCount');
        const totalCount = document.getElementById('totalCount');
        
        // Get applications from localStorage
        const applications = JSON.parse(localStorage.getItem('applications')) || [];
        
        // Calculate counts
        let pending = 0, approved = 0, denied = 0;
        applications.forEach(app => {
            if (!app.status || app.status === 'pending') pending++;
            else if (app.status === 'approved') approved++;
            else if (app.status === 'denied') denied++;
        });
        
        // Update display
        if (pendingCount) pendingCount.textContent = pending;
        if (approvedCount) approvedCount.textContent = approved;
        if (deniedCount) deniedCount.textContent = denied;
        if (totalCount) totalCount.textContent = applications.length;
    }
    
    // Function to initialize dashboard UI and apply role-based access controls
    function initializeDashboardUI() {
        // Get current user role from auth data
        const auth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
        const userRole = auth.role || 'user';
        const isAdmin = userRole === 'admin';
        
        console.log(`User logged in with role: ${userRole}`);
        
        // Hide admin-only UI elements for regular users
        if (!isAdmin) {
            // Hide settings navigation button
            const settingsBtn = document.getElementById('settingsNavBtn') || document.getElementById('settingsBtn');
            if (settingsBtn) settingsBtn.style.display = 'none';
            
            // Hide users navigation button
            const usersBtn = document.getElementById('usersNavBtn') || document.getElementById('usersBtn');
            if (usersBtn) usersBtn.style.display = 'none';
            
            // Hide any other admin-only UI elements
            const adminOnlyElements = document.querySelectorAll('.admin-only');
            adminOnlyElements.forEach(el => el.style.display = 'none');
            
            console.log('Applied user-level restrictions: hidden admin features');
        }
        
        // Show welcome message with username
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
            usernameDisplay.textContent = auth.username || 'User';
        }
    }
    
    // Helper function to check if user is logged in
    function isLoggedIn() {
        const auth = localStorage.getItem('adminAuth');
        if (!auth) return false;
        
        const authData = JSON.parse(auth);
        const now = new Date().getTime();
        const oneHourInMs = 60 * 60 * 1000;
        
        // Check if token is expired (more than an hour old)
        if (now - authData.timestamp > oneHourInMs) {
            localStorage.removeItem('adminAuth');
            return false;
        }
        
        return true;
    }
});
