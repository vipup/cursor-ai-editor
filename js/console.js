// Create custom console functionality
function createCustomConsole() {
    const consoleOutput = document.getElementById('console-output');
    const maxLinesInput = document.getElementById('max-lines');
    
    function formatTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3 
        });
    }

    return function(...args) {
        const maxLines = parseInt(maxLinesInput.value) || 50;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const timestamp = document.createElement('span');
        timestamp.className = 'log-timestamp';
        timestamp.textContent = formatTimestamp();
        
        const content = document.createElement('span');
        content.textContent = Array.from(args).join(' ');
        
        entry.appendChild(timestamp);
        entry.appendChild(content);
        
        consoleOutput.insertBefore(entry, consoleOutput.firstChild);
        
        while (consoleOutput.children.length > maxLines) {
            consoleOutput.removeChild(consoleOutput.lastChild);
        }
    };
}

// Initialize custom console when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.customConsole = createCustomConsole();
}); 