// Initialize IndexedDB
let db;
const dbName = "CodeEditorDB";
const dbVersion = 1;

const initDB = () => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("IndexedDB initialized successfully");
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('projects')) {
            const store = db.createObjectStore('projects', { keyPath: 'timestamp' });
            store.createIndex('name', 'name', { unique: false });
        }
    };
};

// Save to IndexedDB
const saveToIndexedDB = () => {
    if (!db) return;

    const project = {
        timestamp: new Date().toISOString(),
        name: document.getElementById('project-name').value || 'Untitled Project',
        html: htmlEditor.getValue(),
        css: cssEditor.getValue(),
        js: jsEditor.getValue()
    };

    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    store.add(project).onsuccess = () => {
        console.log('Project saved:', project.name);
    };
};

// Initialize database and event listeners
const init = () => {
    console.log('Init called');
    initDB();
    
    // Add Ctrl+S handler
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveToIndexedDB();
        }
    });

    // Add search button click handler
    const searchButton = document.getElementById('search-stored');
    console.log('Search button found:', searchButton);
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            console.log('Search button clicked');
            showSearchDialog().then(() => {
                console.log('Dialog should be visible now');
                checkDialog();
            });
        });
    }
};

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', init);
} else {
    console.log('DOM already loaded, calling init directly');
    init();
}

let searchDialog = null;
let projectList = [];

// Show search dialog
const showSearchDialog = async () => {
    console.log('showSearchDialog called');
    
    // First remove any existing dialog
    let existingDialog = document.getElementById('search-dialog');
    if (existingDialog) {
        console.log('Removing existing dialog');
        existingDialog.remove();
    }

    // Create new dialog with visible styles
    const dialogHTML = `
        <div id="search-dialog" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;">
            <div class="dialog-content" style="
                background: #2d2d2d;
                padding: 20px;
                border-radius: 8px;
                width: 80%;
                max-width: 600px;
                color: white;">
                <div class="dialog-header">
                    <h2>Stored Projects</h2>
                    <input type="text" id="search-input" placeholder="Search projects...">
                </div>
                <div class="project-list" style="max-height: 50vh; overflow-y: auto;">
                    <!-- Projects will be listed here -->
                </div>
                <div class="dialog-footer">
                    <button id="delete-selected" class="control-btn">Delete Selected</button>
                    <button id="close-dialog" class="control-btn">Close</button>
                </div>
            </div>
        </div>`;
    
    console.log('Inserting new dialog');
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    let dialog = document.getElementById('search-dialog');
    console.log('New dialog element:', dialog);
    
    // Setup event listeners
    setupDialogEventListeners(dialog);
    
    await loadProjects();
    renderProjects();
};

// Setup dialog event listeners
const setupDialogEventListeners = (dialog) => {
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        renderProjects(e.target.value);
    });

    document.getElementById('delete-selected')?.addEventListener('click', deleteSelectedProjects);

    document.getElementById('close-dialog')?.addEventListener('click', () => {
        dialog.style.display = 'none';
    });

    dialog.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            e.target.style.display = 'none';
        }
    });
};

// Load projects from IndexedDB
const loadProjects = () => {
    console.log('loadProjects called');
    return new Promise((resolve, reject) => {
        if (!db) {
            console.error('Database not initialized');
            reject('Database not initialized');
            return;
        }

        const transaction = db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        const request = store.getAll();

        request.onsuccess = () => {
            projectList = request.result;
            console.log('Projects loaded:', projectList);
            resolve(projectList);
        };

        request.onerror = () => {
            console.error('Error loading projects:', request.error);
            reject(request.error);
        };
    });
};

// Render projects in dialog
const renderProjects = (searchTerm = '') => {
    const projectListElement = document.querySelector('.project-list');
    const filteredProjects = projectList.filter(project => 
        project.name.toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    projectListElement.innerHTML = filteredProjects.map(project => `
        <div class="project-item" style="
            display: flex;
            align-items: center;
            padding: 8px;
            border-bottom: 1px solid #444;
            gap: 10px;">
            <input type="checkbox" data-timestamp="${project.timestamp}">
            <span>${project.name}</span>
            <span style="margin-left: auto; color: #888;">
                ${new Date(project.timestamp).toLocaleString()}
            </span>
            <button 
                class="load-btn control-btn" 
                data-timestamp="${project.timestamp}"
                style="padding: 4px 8px; margin-left: 10px;">
                Load
            </button>
        </div>
    `).join('');

    // Add click handlers for load buttons
    projectListElement.querySelectorAll('.load-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const timestamp = button.dataset.timestamp;
            loadProject(timestamp);
        });
    });
};

// Delete selected projects
const deleteSelectedProjects = () => {
    const selectedCheckboxes = document.querySelectorAll('.project-item input[type="checkbox"]:checked');
    const timestamps = Array.from(selectedCheckboxes).map(cb => cb.dataset.timestamp);

    if (!timestamps.length) return;

    if (!confirm(`Delete ${timestamps.length} selected project(s)?`)) return;

    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');

    timestamps.forEach(timestamp => {
        store.delete(timestamp);
    });

    transaction.oncomplete = () => {
        loadProjects().then(() => renderProjects());
    };
};

// Add this debug function
const checkDialog = () => {
    const dialog = document.getElementById('search-dialog');
    console.log('Dialog element:', dialog);
    if (dialog) {
        console.log('Dialog styles:', window.getComputedStyle(dialog));
        console.log('Dialog dimensions:', dialog.getBoundingClientRect());
    }
};

// Add this function to your storage.js file
const loadProject = async (timestamp) => {
    if (!db) {
        console.error('Database not initialized');
        return;
    }

    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.get(timestamp);

    request.onsuccess = () => {
        const project = request.result;
        if (project) {
            // Update project name
            document.getElementById('project-name').value = project.name;
            
            // Update editors
            htmlEditor.setValue(project.html || '');
            cssEditor.setValue(project.css || '');
            jsEditor.setValue(project.js || '');
            
            // Close dialog
            const dialog = document.getElementById('search-dialog');
            if (dialog) dialog.remove();
            
            console.log('Project loaded:', project.name);
        }
    };

    request.onerror = (event) => {
        console.error('Error loading project:', event.target.error);
    };
};