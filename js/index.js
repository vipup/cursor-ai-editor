// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // CodeMirror initialization wrapper
    function createEditor(element, config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-wrapper';
        element.appendChild(wrapper);
        
        return CodeMirror(wrapper, config);
    }

    // Initialize editors
    const htmlEditor = createEditor(document.getElementById('html-editor'), {
        mode: 'xml',
        theme: 'monokai',
        lineNumbers: true,
        value: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Preview</title>\n</head>\n<body>\n    <h1>Welcome to Live Code Editor</h1>\n    <p class="rainbow-text">This text will change colors!</p>\n</body>\n</html>'
    });

    const cssEditor = createEditor(document.getElementById('css-editor'), {
        mode: 'css',
        theme: 'monokai',
        lineNumbers: true,
        value: 'body {\n    font-family: Arial, sans-serif;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n}\n\n.rainbow-text {\n    font-size: 18px;\n    transition: color 0.5s;\n}'
    });

    const jsEditor = createEditor(document.getElementById('js-editor'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        value: 'function getRandomColor() {\n    const letters = "0123456789ABCDEF";\n    let color = "#";\n    for (let i = 0; i < 6; i++) {\n        color += letters[Math.floor(Math.random() * 16)];\n    }\n    return color;\n}\n\nsetInterval(() => {\n    const rainbowText = document.querySelector(".rainbow-text");\n    if (rainbowText) {\n        const newColor = getRandomColor();\n        console.log("Changing color to:", newColor);\n        rainbowText.style.color = newColor;\n    }\n}, 1000);'
    });

    // Update preview function
    function updatePreview() {
        const preview = document.getElementById('preview');
        const previewDoc = preview.contentDocument;
        
        // Create preview content
        const content = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>${cssEditor.getValue()}</style>
                </head>
                <body>
                    ${htmlEditor.getValue()}
                    <script>
                        window.console.log = function() {
                            window.parent.customConsole.apply(null, arguments);
                        };
                        ${jsEditor.getValue()}
                    </script>
                </body>
            </html>
        `;

        // Update preview safely
        try {
            previewDoc.open();
            previewDoc.write(content);
            previewDoc.close();
        } catch (error) {
            console.error('Error updating preview:', error);
        }
    }

    // Add editor change listeners
    [htmlEditor, cssEditor, jsEditor].forEach(editor => {
        editor.on('change', () => {
            requestAnimationFrame(updatePreview);
        });
    });

    // Initialize preview
    updatePreview();

    // Handle minimize buttons with passive event listener
    document.querySelectorAll('.minimize-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.editor-container, .console-container');
            container.classList.toggle('minimized');
            this.textContent = container.classList.contains('minimized') ? '+' : '−';
        }, { passive: true });
    });

    // Save/Load project functionality
    document.getElementById('save-project').addEventListener('click', async function(e) {
        e.preventDefault();
        const zip = new JSZip();
        
        zip.file("index.html", htmlEditor.getValue());
        zip.file("styles.css", cssEditor.getValue());
        zip.file("script.js", jsEditor.getValue());
        
        const content = await zip.generateAsync({type: "blob"});
        saveAs(content, "code-editor-project.zip");
    }, { passive: false });

    document.getElementById('load-project-btn').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('load-project').click();
    }, { passive: false });

    document.getElementById('load-project').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const zip = await JSZip.loadAsync(e.target.result);
                    
                    const html = await zip.file("index.html")?.async("text") || '';
                    const css = await zip.file("styles.css")?.async("text") || '';
                    const js = await zip.file("script.js")?.async("text") || '';
                    
                    htmlEditor.setValue(html);
                    cssEditor.setValue(css);
                    jsEditor.setValue(js);
                    
                    console.log("Project loaded successfully!");
                } catch (error) {
                    console.error("Error loading project:", error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    }, { passive: true });

    // Make editors globally accessible
    window.htmlEditor = htmlEditor;
    window.cssEditor = cssEditor;
    window.jsEditor = jsEditor;
}); 