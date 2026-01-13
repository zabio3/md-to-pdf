/**
 * Main Application Entry Point
 * Initializes all modules and starts the application
 */

(function() {
    'use strict';

    /**
     * Initialize the application
     */
    function init() {
        // Initialize Markdown Parser
        MarkdownParser.initialize();

        // Initialize UI Controller
        UIController.initialize();

        // Trigger initial preview if there's placeholder content
        UIController.updatePreview();

        console.log('MD to PDF Converter initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
