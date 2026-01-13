/**
 * UI Controller Module
 * Handles UI state management, event handling, and user interactions
 */

const UIController = (function() {
    'use strict';

    // DOM Elements cache
    let elements = {};

    // Debounce timer
    let debounceTimer = null;
    const DEBOUNCE_DELAY = 300;

    /**
     * Initialize UI Controller
     */
    function initialize() {
        cacheElements();
        bindEvents();
        updateFontSizeDisplay();
    }

    /**
     * Cache DOM elements for performance
     */
    function cacheElements() {
        elements = {
            markdownInput: document.getElementById('markdown-input'),
            previewContent: document.getElementById('preview-content'),
            exportBtn: document.getElementById('export-btn'),
            exportBtnText: document.querySelector('.export-btn-text'),
            exportBtnLoading: document.querySelector('.export-btn-loading'),
            loadingOverlay: document.getElementById('loading-overlay'),
            paperSize: document.getElementById('paper-size'),
            marginTop: document.getElementById('margin-top'),
            marginRight: document.getElementById('margin-right'),
            marginBottom: document.getElementById('margin-bottom'),
            marginLeft: document.getElementById('margin-left'),
            fontSize: document.getElementById('font-size'),
            fontSizeDisplay: document.getElementById('font-size-display')
        };
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Markdown input change
        elements.markdownInput.addEventListener('input', handleMarkdownInput);

        // Font size slider change
        elements.fontSize.addEventListener('input', handleFontSizeChange);

        // Settings changes trigger preview update
        elements.paperSize.addEventListener('change', updatePreview);
        elements.marginTop.addEventListener('change', updatePreview);
        elements.marginRight.addEventListener('change', updatePreview);
        elements.marginBottom.addEventListener('change', updatePreview);
        elements.marginLeft.addEventListener('change', updatePreview);

        // Export button click
        elements.exportBtn.addEventListener('click', handleExport);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeydown);
    }

    /**
     * Handle markdown input with debouncing
     */
    function handleMarkdownInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updatePreview, DEBOUNCE_DELAY);
    }

    /**
     * Update the preview panel
     */
    function updatePreview() {
        const markdown = elements.markdownInput.value;
        const html = MarkdownParser.parse(markdown);
        const settings = getSettings();

        elements.previewContent.innerHTML = html;
        elements.previewContent.style.fontSize = `${settings.fontSize}px`;
    }

    /**
     * Handle font size slider change
     */
    function handleFontSizeChange() {
        updateFontSizeDisplay();
        updatePreview();
    }

    /**
     * Update font size display label
     */
    function updateFontSizeDisplay() {
        const value = elements.fontSize.value;
        elements.fontSizeDisplay.textContent = `${value}px`;
    }

    /**
     * Handle export button click
     */
    async function handleExport() {
        const markdown = elements.markdownInput.value;
        if (!markdown.trim()) {
            alert('Please enter some markdown content first.');
            return;
        }

        showLoading(true);

        try {
            const html = MarkdownParser.parse(markdown);
            const settings = getSettings();
            await PDFGenerator.generate(html, settings);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e
     */
    function handleKeydown(e) {
        // Ctrl/Cmd + S to export PDF
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleExport();
        }
    }

    /**
     * Get current settings
     * @returns {Object} Settings object
     */
    function getSettings() {
        return {
            paperSize: elements.paperSize.value,
            margins: {
                top: parseFloat(elements.marginTop.value) || 10,
                right: parseFloat(elements.marginRight.value) || 10,
                bottom: parseFloat(elements.marginBottom.value) || 10,
                left: parseFloat(elements.marginLeft.value) || 10
            },
            fontSize: parseInt(elements.fontSize.value) || 14
        };
    }

    /**
     * Show/hide loading overlay
     * @param {boolean} show
     */
    function showLoading(show) {
        elements.loadingOverlay.hidden = !show;
        elements.exportBtn.disabled = show;
        elements.exportBtnText.hidden = show;
        elements.exportBtnLoading.hidden = !show;
    }

    /**
     * Get the markdown input element (for external access)
     * @returns {HTMLTextAreaElement}
     */
    function getMarkdownInput() {
        return elements.markdownInput;
    }

    // Public API
    return {
        initialize,
        updatePreview,
        getSettings,
        showLoading,
        getMarkdownInput
    };
})();
