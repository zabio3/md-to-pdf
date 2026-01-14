/**
 * PDF Generator Module
 * Handles PDF generation using browser's native print functionality.
 * The preview content is already rendered, so we just trigger the print dialog.
 * Print styles in CSS (@media print) handle hiding UI and formatting.
 */

const PDFGenerator = (function() {
    'use strict';

    /**
     * Generate PDF using browser's print dialog
     * @returns {void}
     */
    function generate() {
        window.print();
    }

    // Public API
    return {
        generate
    };
})();
