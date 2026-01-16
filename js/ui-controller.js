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

    // Current view mode ('editor', 'split', 'preview')
    let currentViewMode = 'split';

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
            orientation: document.getElementById('orientation'),
            marginTop: document.getElementById('margin-top'),
            marginRight: document.getElementById('margin-right'),
            marginBottom: document.getElementById('margin-bottom'),
            marginLeft: document.getElementById('margin-left'),
            fontSize: document.getElementById('font-size'),
            fontSizeDisplay: document.getElementById('font-size-display'),
            sidebar: document.querySelector('.sidebar'),
            menuToggle: document.getElementById('menu-toggle'),
            advancedToggle: document.getElementById('advanced-toggle'),
            advancedSettings: document.getElementById('advanced-settings'),
            renderMermaid: document.getElementById('render-mermaid'),
            syntaxHighlight: document.getElementById('syntax-highlight'),
            smartypants: document.getElementById('smartypants'),
            printBackground: document.getElementById('print-background'),
            enableHeader: document.getElementById('enable-header'),
            headerTemplate: document.getElementById('header-template'),
            headerInputGroup: document.getElementById('header-input-group'),
            enableFooter: document.getElementById('enable-footer'),
            footerTemplate: document.getElementById('footer-template'),
            footerInputGroup: document.getElementById('footer-input-group'),
            viewEditBtn: document.getElementById('view-edit'),
            viewSplitBtn: document.getElementById('view-split'),
            viewPreviewBtn: document.getElementById('view-preview'),
            mainContent: document.querySelector('.main-content'),
            resizeHandles: document.querySelectorAll('.resize-handle'),
            editorPanel: document.querySelector('.editor-panel'),
            previewPanel: document.querySelector('.preview-panel')
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
        elements.marginTop.addEventListener('input', updatePreview);
        elements.marginRight.addEventListener('input', updatePreview);
        elements.marginBottom.addEventListener('input', updatePreview);
        elements.marginLeft.addEventListener('input', updatePreview);

        // Export button click
        elements.exportBtn.addEventListener('click', handleExport);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeydown);

        // Menu toggle for mobile/tablet
        if (elements.menuToggle) {
            elements.menuToggle.addEventListener('click', toggleSidebar);
        }

        // Advanced settings toggle
        if (elements.advancedToggle) {
            elements.advancedToggle.addEventListener('click', toggleAdvancedSettings);
        }

        // View mode toggle buttons
        if (elements.viewEditBtn) {
            elements.viewEditBtn.addEventListener('click', () => setViewMode('editor'));
        }
        if (elements.viewSplitBtn) {
            elements.viewSplitBtn.addEventListener('click', () => setViewMode('split'));
        }
        if (elements.viewPreviewBtn) {
            elements.viewPreviewBtn.addEventListener('click', () => setViewMode('preview'));
        }

        // Resize handles
        initResizeHandles();

        // Mermaid rendering checkbox
        if (elements.renderMermaid) {
            elements.renderMermaid.addEventListener('change', handleMermaidToggle);
        }

        // Syntax highlighting checkbox
        if (elements.syntaxHighlight) {
            elements.syntaxHighlight.addEventListener('change', handleSyntaxHighlightToggle);
        }

        // Smartypants checkbox
        if (elements.smartypants) {
            elements.smartypants.addEventListener('change', handleSmartypantsToggle);
        }

        // Orientation change
        if (elements.orientation) {
            elements.orientation.addEventListener('change', updatePreview);
        }

        // Print background change
        if (elements.printBackground) {
            elements.printBackground.addEventListener('change', updatePreview);
        }

        // Header toggle
        if (elements.enableHeader) {
            elements.enableHeader.addEventListener('change', handleHeaderToggle);
        }

        // Footer toggle
        if (elements.enableFooter) {
            elements.enableFooter.addEventListener('change', handleFooterToggle);
        }

        // Header/footer template changes
        if (elements.headerTemplate) {
            elements.headerTemplate.addEventListener('input', updatePreview);
        }
        if (elements.footerTemplate) {
            elements.footerTemplate.addEventListener('input', updatePreview);
        }
    }

    /**
     * Handle Mermaid rendering toggle
     */
    function handleMermaidToggle() {
        MarkdownParser.setMermaidEnabled(elements.renderMermaid.checked);
        updatePreview();
    }

    /**
     * Handle syntax highlighting toggle
     */
    function handleSyntaxHighlightToggle() {
        MarkdownParser.setSyntaxHighlightEnabled(elements.syntaxHighlight.checked);
        updatePreview();
    }

    /**
     * Handle Smartypants typography toggle
     */
    function handleSmartypantsToggle() {
        MarkdownParser.setSmartypantsEnabled(elements.smartypants.checked);
        updatePreview();
    }

    /**
     * Handle header toggle
     */
    function handleHeaderToggle() {
        if (elements.headerInputGroup) {
            elements.headerInputGroup.hidden = !elements.enableHeader.checked;
        }
        updatePreview();
    }

    /**
     * Handle footer toggle
     */
    function handleFooterToggle() {
        if (elements.footerInputGroup) {
            elements.footerInputGroup.hidden = !elements.enableFooter.checked;
        }
        updatePreview();
    }

    /**
     * Handle markdown input with debouncing
     */
    function handleMarkdownInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updatePreview, DEBOUNCE_DELAY);
    }

    /**
     * Paper dimensions in mm
     */
    const PAPER_DIMENSIONS = {
        'a4': { width: 210, height: 297 },
        'letter': { width: 215.9, height: 279.4 },
        'legal': { width: 215.9, height: 355.6 },
        'a3': { width: 297, height: 420 },
        'a5': { width: 148, height: 210 }
    };

    /**
     * Update the preview panel
     */
    async function updatePreview() {
        const markdown = elements.markdownInput.value;
        const html = MarkdownParser.parse(markdown);
        const settings = getSettings();

        elements.previewContent.innerHTML = html;
        elements.previewContent.style.fontSize = `${settings.fontSize}px`;

        // Render Mermaid diagrams if enabled
        if (settings.renderMermaid) {
            await MermaidRenderer.render(elements.previewContent, { showErrors: true });
        }

        // Calculate and add page break indicators after content is rendered
        requestAnimationFrame(() => {
            addPageBreakIndicators(settings);
        });
    }

    /**
     * Add visual page break indicators to the preview
     * @param {Object} settings - Current settings
     */
    function addPageBreakIndicators(settings) {
        const container = elements.previewContent;
        const paperSize = settings.paperSize || 'a4';
        const dimensions = PAPER_DIMENSIONS[paperSize];

        // Calculate content height per page (in pixels, assuming 96dpi)
        // 1mm = 3.7795275591 pixels at 96dpi
        const MM_TO_PX = 3.7795275591;
        const pageHeight = (dimensions.height - settings.margins.top - settings.margins.bottom) * MM_TO_PX;

        // Remove existing auto page breaks
        container.querySelectorAll('.auto-page-break').forEach(el => el.remove());

        // Get actual content height (not affected by CSS min-height)
        // Calculate by finding the bottom position of the last content element
        let actualContentHeight = 0;
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            // Skip page break indicators
            if (child.classList.contains('auto-page-break')) {
                continue;
            }
            const rect = child.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const childBottom = rect.bottom - containerRect.top;
            if (childBottom > actualContentHeight) {
                actualContentHeight = childBottom;
            }
        }

        const totalPages = Math.max(1, Math.ceil(actualContentHeight / pageHeight));

        // Add page break indicators if more than 1 page
        if (totalPages > 1) {
            for (let page = 1; page < totalPages; page++) {
                const breakIndicator = document.createElement('div');
                breakIndicator.className = 'auto-page-break';
                breakIndicator.setAttribute('data-page-label', `${page} / ${totalPages}`);
                breakIndicator.style.top = `${page * pageHeight}px`;
                container.appendChild(breakIndicator);
            }
        }

        // Add page count display at bottom
        const pageDisplay = document.createElement('div');
        pageDisplay.className = 'page-number-display';
        pageDisplay.textContent = `${totalPages} page${totalPages > 1 ? 's' : ''}`;
        container.appendChild(pageDisplay);
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
            orientation: elements.orientation ? elements.orientation.value : 'portrait',
            margins: {
                top: parseFloat(elements.marginTop.value) || 10,
                right: parseFloat(elements.marginRight.value) || 10,
                bottom: parseFloat(elements.marginBottom.value) || 10,
                left: parseFloat(elements.marginLeft.value) || 10
            },
            fontSize: parseInt(elements.fontSize.value) || 14,
            renderMermaid: elements.renderMermaid ? elements.renderMermaid.checked : true,
            syntaxHighlight: elements.syntaxHighlight ? elements.syntaxHighlight.checked : true,
            smartypants: elements.smartypants ? elements.smartypants.checked : true,
            printBackground: elements.printBackground ? elements.printBackground.checked : true,
            enableHeader: elements.enableHeader ? elements.enableHeader.checked : false,
            headerTemplate: elements.headerTemplate ? elements.headerTemplate.value : '',
            enableFooter: elements.enableFooter ? elements.enableFooter.checked : true,
            footerTemplate: elements.footerTemplate ? elements.footerTemplate.value : '{date}'
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
     * Toggle sidebar visibility (for mobile/tablet)
     */
    function toggleSidebar() {
        elements.sidebar.classList.toggle('open');
    }

    /**
     * Toggle advanced settings visibility
     */
    function toggleAdvancedSettings() {
        const isHidden = elements.advancedSettings.hidden;
        elements.advancedSettings.hidden = !isHidden;
        elements.advancedToggle.classList.toggle('expanded', isHidden);
    }

    /**
     * Initialize resize handles for panel resizing
     */
    function initResizeHandles() {
        let isResizing = false;
        let currentHandle = null;
        let startX = 0;
        let startWidths = {};

        elements.resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentHandle = handle;
                startX = e.clientX;
                handle.classList.add('dragging');
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';

                // Store current widths
                const mainRect = elements.mainContent.getBoundingClientRect();
                startWidths = {
                    sidebar: elements.sidebar.getBoundingClientRect().width,
                    editor: elements.editorPanel.getBoundingClientRect().width,
                    preview: elements.previewPanel.getBoundingClientRect().width,
                    total: mainRect.width
                };

                e.preventDefault();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing || !currentHandle) return;

            // Skip resize operations if not in split view mode
            if (currentViewMode !== 'split') return;

            const deltaX = e.clientX - startX;
            const resizeType = currentHandle.dataset.resize;
            const minWidth = 150;
            const handleWidth = 4;

            if (resizeType === 'sidebar') {
                // Resizing sidebar
                let newSidebarWidth = startWidths.sidebar + deltaX;

                // Max width: leave at least minWidth for both editor and preview
                const maxSidebarWidth = startWidths.total - minWidth * 2 - handleWidth * 2;
                newSidebarWidth = Math.max(minWidth, Math.min(newSidebarWidth, maxSidebarWidth));

                // Keep editor and preview proportions the same
                const remainingWidth = startWidths.total - newSidebarWidth - handleWidth * 2;
                const totalEditorPreview = startWidths.editor + startWidths.preview;
                const editorRatio = totalEditorPreview > 0 ? startWidths.editor / totalEditorPreview : 0.5;
                const newEditorWidth = Math.max(minWidth, remainingWidth * editorRatio);
                const newPreviewWidth = Math.max(minWidth, remainingWidth - newEditorWidth);

                elements.mainContent.style.gridTemplateColumns =
                    `${newSidebarWidth}px ${handleWidth}px ${newEditorWidth}px ${handleWidth}px ${newPreviewWidth}px`;
            } else if (resizeType === 'editor') {
                // Resizing editor/preview split
                const totalWidth = startWidths.editor + startWidths.preview;
                let newEditorWidth = startWidths.editor + deltaX;

                // Clamp editor width to valid range, ensuring both panels meet minimum
                newEditorWidth = Math.max(minWidth, Math.min(newEditorWidth, totalWidth - minWidth));
                const newPreviewWidth = totalWidth - newEditorWidth;

                elements.mainContent.style.gridTemplateColumns =
                    `${startWidths.sidebar}px ${handleWidth}px ${newEditorWidth}px ${handleWidth}px ${newPreviewWidth}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing && currentHandle) {
                currentHandle.classList.remove('dragging');
                isResizing = false;
                currentHandle = null;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    /**
     * Set view mode (editor, split, preview)
     */
    function setViewMode(mode) {
        // Track current view mode
        currentViewMode = mode;

        // Remove all view mode classes
        elements.mainContent.classList.remove('view-editor-only', 'view-preview-only');

        // Reset inline grid styles when changing mode
        elements.mainContent.style.gridTemplateColumns = '';

        // Remove active class from all toggle buttons
        elements.viewEditBtn.classList.remove('active');
        elements.viewSplitBtn.classList.remove('active');
        elements.viewPreviewBtn.classList.remove('active');

        // Apply selected mode
        switch (mode) {
            case 'editor':
                elements.mainContent.classList.add('view-editor-only');
                elements.viewEditBtn.classList.add('active');
                break;
            case 'preview':
                elements.mainContent.classList.add('view-preview-only');
                elements.viewPreviewBtn.classList.add('active');
                break;
            case 'split':
            default:
                currentViewMode = 'split';
                elements.viewSplitBtn.classList.add('active');
                break;
        }
    }

    // Public API
    return {
        initialize,
        updatePreview,
        getSettings,
        showLoading,
        toggleSidebar,
        setViewMode
    };
})();
