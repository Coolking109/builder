document.addEventListener('DOMContentLoaded', function() {
    // Get the form and notification elements
    const applicationForm = document.getElementById('applicationForm');
    const notification = document.getElementById('notification');
    
    // Add submit event listener to the form
    applicationForm.addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();
        
        // Validate required checkboxes (availability)
        const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]');
        let availabilityChecked = false;
        availabilityCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                availabilityChecked = true;
            }
        });
        
        if (!availabilityChecked) {
            alert('Please select at least one day for availability.');
            return;
        }
        
        // Form is valid, collect the data
        const formData = new FormData(applicationForm);
        const applicationData = {
            id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), // Add unique ID
            timestamp: new Date().getTime(),
            status: 'pending'
        };
        
        // Convert FormData to a regular object
        for (const [key, value] of formData.entries()) {
            if (key === 'availability') {
                if (!applicationData[key]) {
                    applicationData[key] = [];
                }
                applicationData[key].push(value);
            } else {
                applicationData[key] = value;
            }
        }
        
        // Store application in localStorage
        saveApplication(applicationData);
        
        // Show success notification
        notification.classList.add('show-notification');
        
        // Reset the form after submission
        setTimeout(() => {
            applicationForm.reset();
            notification.classList.remove('show-notification');
        }, 3000);
    });
    
    // Function to save application to localStorage
    function saveApplication(applicationData) {
        // Get existing applications or initialize empty array
        const existingApplications = JSON.parse(localStorage.getItem('applications')) || [];
        
        // Add new application
        existingApplications.push(applicationData);
        
        // Save back to localStorage
        localStorage.setItem('applications', JSON.stringify(existingApplications));
    }
    
    // Add input validation
    const ageInput = document.getElementById('age');
    if (ageInput) {
        ageInput.addEventListener('input', function() {
            if (this.value < 13) {
                this.setCustomValidity('You must be at least 13 years old.');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Auto-detect and set user's timezone
    const timezoneSelect = document.getElementById('timezone');
    if (timezoneSelect) {
        try {
            // Get user's timezone using Intl API
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log("Detected timezone:", timeZone);
            
            // Get offset in minutes
            const userTimezoneOffset = new Date().getTimezoneOffset();
            const userTimezoneHours = -userTimezoneOffset / 60;
            
            // Map common timezone hours to standard abbreviations
            const timezoneMap = {
                '-8': 'PST',  // Pacific
                '-7': 'MST',  // Mountain
                '-6': 'CST',  // Central
                '-5': 'EST',  // Eastern
                '-4': 'AST',  // Atlantic
                '0': 'GMT',   // Greenwich
                '1': 'CET',   // Central European
                '2': 'EET',   // Eastern European
                '3': 'MSK',   // Moscow
                '5.5': 'IST', // India
                '8': 'CST',   // China
                '9': 'JST',   // Japan
                '10': 'AEST', // Australian Eastern
                '12': 'NZST'  // New Zealand
            };
            
            // Try to find the timezone by abbreviation first
            let found = false;
            const hourKey = userTimezoneHours.toString().replace('.5', '.5'); // Handle fractional hours
            
            if (hourKey in timezoneMap) {
                const abbr = timezoneMap[hourKey];
                for (let i = 0; i < timezoneSelect.options.length; i++) {
                    if (timezoneSelect.options[i].value === abbr) {
                        timezoneSelect.selectedIndex = i;
                        console.log(`Selected timezone by abbreviation: ${abbr}`);
                        found = true;
                        break;
                    }
                }
            }
            
            // If not found, fall back to searching by offset in text
            if (!found) {
                const offsetString = userTimezoneHours >= 0 ? 
                    `UTC+${Math.floor(userTimezoneHours)}` : 
                    `UTC${Math.floor(userTimezoneHours)}`;
                    
                for (let i = 0; i < timezoneSelect.options.length; i++) {
                    if (timezoneSelect.options[i].text.includes(offsetString)) {
                        timezoneSelect.selectedIndex = i;
                        console.log(`Selected timezone by offset: ${offsetString}`);
                        found = true;
                        break;
                    }
                }
            }
            
            // Last resort: try to match by hour offset directly
            if (!found) {
                for (let i = 0; i < timezoneSelect.options.length; i++) {
                    const optValue = timezoneSelect.options[i].value;
                    if (optValue === userTimezoneHours.toString()) {
                        timezoneSelect.selectedIndex = i;
                        console.log(`Selected timezone by hour: ${userTimezoneHours}`);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error auto-detecting timezone:', error);
        }
    }
    
    // Enhance textarea inputs
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        // Auto-resize textareas based on content
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
    
    // Add progress tracking for the form
    const form = document.getElementById('applicationForm');
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    const progressBar = document.getElementById('formProgress');
    const progressText = document.getElementById('progressPercent');
    let filledInputs = 0;
    
    // Initial calculation of filled inputs
    requiredInputs.forEach(input => {
        if (isInputFilled(input)) {
            filledInputs++;
        }
        
        // Listen for changes
        input.addEventListener('change', updateProgress);
        input.addEventListener('input', updateProgress);
    });
    
    updateProgress();
    
    function updateProgress() {
        // Reset and recount
        filledInputs = 0;
        requiredInputs.forEach(input => {
            if (isInputFilled(input)) {
                filledInputs++;
            }
        });
        
        const totalRequired = requiredInputs.length;
        const progressPercent = Math.round((filledInputs / totalRequired) * 100);
        
        progressBar.style.setProperty('--progress', progressPercent + '%');
        progressText.textContent = progressPercent + '%';
        progressBar.setAttribute('data-progress', progressPercent);
        progressBar.style.width = progressPercent + '%';
    }
    
    function isInputFilled(input) {
        if (input.type === 'radio') {
            const name = input.name;
            return form.querySelector(`input[name="${name}"]:checked`) !== null;
        } else if (input.type === 'checkbox') {
            const name = input.name;
            return form.querySelector(`input[name="${name}"]:checked`) !== null;
        } else {
            return input.value.trim() !== '';
        }
    }
});
