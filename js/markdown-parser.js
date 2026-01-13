/**
 * Markdown Parser Module
 * Handles markdown parsing with custom pagebreak extension
 */

const MarkdownParser = (function() {
    'use strict';

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

        // Register the extension
        marked.use({ extensions: [pagebreakExtension] });

        // Configure Marked.js options
        marked.setOptions({
            gfm: true,      // GitHub Flavored Markdown
            breaks: true    // Convert \n to <br>
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
        parse
    };
})();
