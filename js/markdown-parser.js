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
        const pagebreakExtension = {
            name: 'pagebreak',
            level: 'block',
            start(src) {
                // Find the start of a potential pagebreak
                const match = src.match(/^(---|<!-- ?pagebreak ?-->)/m);
                return match ? match.index : undefined;
            },
            tokenizer(src) {
                // Match --- on its own line (not part of frontmatter) or <!-- pagebreak -->
                // We need to be careful not to match --- that's part of horizontal rule in context
                const rule = /^(?:<!-- ?pagebreak ?-->)\n?/;
                const hrRule = /^---\n(?!\s*\w+:)/; // --- followed by newline, not YAML

                let match = rule.exec(src);
                if (match) {
                    return {
                        type: 'pagebreak',
                        raw: match[0]
                    };
                }

                match = hrRule.exec(src);
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
            breaks: true,   // Convert \n to <br>
            headerIds: true,
            mangle: false
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
