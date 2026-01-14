/**
 * Markdown Parser Module
 * Handles markdown parsing with custom pagebreak extension
 */

const MarkdownParser = (function() {
    'use strict';

    // Flag to control Mermaid diagram rendering
    let mermaidEnabled = true;

    // Flag to control Smartypants typography
    let smartypantsEnabled = true;

    // Flag to control syntax highlighting
    let syntaxHighlightEnabled = true;

    /**
     * Set Mermaid rendering enabled/disabled
     * @param {boolean} enabled - Whether to render Mermaid diagrams
     */
    function setMermaidEnabled(enabled) {
        mermaidEnabled = enabled;
    }

    /**
     * Set Smartypants typography enabled/disabled
     * @param {boolean} enabled - Whether to apply typography improvements
     */
    function setSmartypantsEnabled(enabled) {
        smartypantsEnabled = enabled;
        updateMarkedOptions();
    }

    /**
     * Set syntax highlighting enabled/disabled
     * @param {boolean} enabled - Whether to apply syntax highlighting
     */
    function setSyntaxHighlightEnabled(enabled) {
        syntaxHighlightEnabled = enabled;
    }

    /**
     * Initialize Marked.js with custom configuration and extensions
     */
    function initialize() {
        // Pagebreak extension for Marked.js
        // Note: Only <!-- pagebreak --> is used for page breaks.
        // --- is kept as standard Markdown horizontal rule.
        const pagebreakExtension = {
            name: 'pagebreak',
            level: 'block',
            start(src) {
                // Find the start of a potential pagebreak (only HTML comment syntax)
                const match = src.match(/^<!-- ?pagebreak ?-->/m);
                return match ? match.index : undefined;
            },
            tokenizer(src) {
                // Match only <!-- pagebreak --> for explicit page breaks
                const rule = /^<!-- ?pagebreak ?-->\n?/;

                const match = rule.exec(src);
                if (match) {
                    return {
                        type: 'pagebreak',
                        raw: match[0]
                    };
                }

                return undefined;
            },
            renderer() {
                return '<div class="page-break"></div>\n';
            }
        };

        // Custom renderer for code blocks to handle Mermaid and syntax highlighting
        const renderer = {
            code(code, language) {
                // Handle code object format (marked v9+)
                if (typeof code === 'object' && code !== null) {
                    language = code.lang;
                    code = code.text;
                }

                // Check if this is a mermaid block and rendering is enabled
                if (language === 'mermaid' && mermaidEnabled) {
                    // Return a container that Mermaid.js will process
                    return `<div class="mermaid-container"><pre class="mermaid">${code}</pre></div>`;
                }

                // Apply syntax highlighting if highlight.js is available and enabled
                if (syntaxHighlightEnabled && typeof hljs !== 'undefined') {
                    try {
                        let highlighted;
                        if (language && hljs.getLanguage(language)) {
                            highlighted = hljs.highlight(code, { language: language }).value;
                        } else {
                            highlighted = hljs.highlightAuto(code).value;
                        }
                        const langClass = language ? ` language-${language}` : '';
                        return `<pre><code class="hljs${langClass}">${highlighted}</code></pre>`;
                    } catch (error) {
                        console.warn('Highlight.js error:', error);
                    }
                }

                // Fallback: escape HTML and return without highlighting
                const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                if (language) {
                    return `<pre><code class="language-${language}">${escaped}</code></pre>`;
                }
                return `<pre><code>${escaped}</code></pre>`;
            }
        };

        // Register the extension and renderer
        marked.use({
            extensions: [pagebreakExtension],
            renderer: renderer
        });

        // Configure Marked.js options
        marked.setOptions({
            gfm: true,      // GitHub Flavored Markdown
            breaks: true,   // Convert \n to <br>
            smartypants: smartypantsEnabled  // Typography improvements
        });
    }

    /**
     * Re-apply marked options (call after changing settings)
     */
    function updateMarkedOptions() {
        marked.setOptions({
            gfm: true,
            breaks: true,
            smartypants: smartypantsEnabled
        });
    }

    /**
     * Parse markdown text to HTML
     * @param {string} text - Markdown text
     * @returns {string} - HTML string
     */
    function parse(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        try {
            return marked.parse(text);
        } catch (error) {
            console.error('Markdown parsing error:', error);
            return '<p style="color: red;">Error parsing markdown</p>';
        }
    }

    // Public API
    return {
        initialize,
        parse,
        setMermaidEnabled,
        setSmartypantsEnabled,
        setSyntaxHighlightEnabled
    };
})();
