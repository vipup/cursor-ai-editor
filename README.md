# Live Code Editor

A web-based code editor with real-time preview and project management capabilities.

## Core Features

### Editor Interface
1. Three-Panel Layout
   - HTML Editor
   - CSS Editor
   - JavaScript Editor
   - Each panel with independent minimize/maximize
   - Syntax highlighting via CodeMirror
   - Line numbers
   - Auto-closing brackets

2. Live Preview
   - Real-time updates
   - Isolated iframe environment
   - Console output redirection
   - Responsive layout

3. Console Panel
   - Real-time logging
   - Timestamps for entries
   - Configurable max lines
   - Clear functionality
   - Minimizable panel

### Project Management

1. Basic Operations
   - Save/Load project files
   - Auto-save to IndexedDB
   - Export to ZIP
   - Import from ZIP

2. Project Storage
   - IndexedDB backend
   - Version history
   - Project naming
   - Automatic timestamps

3. Search Functionality
   - Search stored projects
   - Filter by name
   - Version history view
   - Multi-select capability
   - Bulk operations

### Search Dialog Features

1. Interface
   - Search input field (sticky header)
   - Selection counter
   - Action buttons (Delete All, Delete Selected)
   - Scrollable results area

2. Selection Features
   - Checkbox for each version
   - Ctrl+Click for multiple selection
   - Shift+Click for range selection
   - Select All functionality
   - Visual selection feedback

3. Project Display
   - Group by project name
   - Sort by timestamp
   - Show version count
   - Load any version
   - Delete operations

4. Keyboard Support
   - Esc to close
   - Ctrl+A to select all
   - Delete key for selected items
   - Arrow keys navigation

### Technical Features

1. Storage
   - IndexedDB for project storage
   - ZIP file import/export
   - Version control
   - Auto-save capability

2. Performance
   - Debounced updates
   - Efficient DOM manipulation
   - Lazy loading where appropriate
   - Optimized event handling

3. Error Handling
   - Load/Save error recovery
   - Invalid file handling
   - Storage quota management
   - User feedback for errors

## Planned Features

1. Enhanced Editor
   - Multiple themes
   - Custom key bindings
   - Split view capability
   - Code folding

2. Advanced Search
   - Full text search
   - Regular expressions
   - Search in code content
   - Advanced filtering

3. Project Management
   - Project categories
   - Tags and metadata
   - Project templates
   - Share functionality

## Usage

1. Basic Operations
   - Edit code in any panel
   - See live preview updates
   - Monitor console output
   - Save/Load projects

2. Search and Manage
   - Use search dialog to find projects
   - Select multiple versions
   - Perform bulk operations
   - Manage project history

3. Keyboard Shortcuts
   - Ctrl+S: Save project
   - Esc: Close dialogs
   - Ctrl+A: Select all in search
   - Delete: Remove selected items