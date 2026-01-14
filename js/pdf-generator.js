/**
 * PDF Generator Module
 * Handles PDF generation using html2pdf.js
 */

const PDFGenerator = (function() {
    'use strict';

    // Paper size configurations for jsPDF
    const PAPER_SIZES = {
        'a4': 'a4',
        'letter': 'letter',
        'legal': 'legal',
        'a3': 'a3',
        'a5': 'a5'
    };

    // Paper dimensions in mm for container sizing
    const PAPER_DIMENSIONS = {
        'a4': { width: 210, height: 297 },
        'letter': { width: 216, height: 279 },
        'legal': { width: 216, height: 356 },
        'a3': { width: 297, height: 420 },
        'a5': { width: 148, height: 210 }
    };

    /**
     * Get paper width based on size and orientation
     * @param {string} paperSize - Paper size key
     * @param {string} orientation - 'portrait' or 'landscape'
     * @returns {string} Width in mm
     */
    function getPaperWidth(paperSize, orientation) {
        const dims = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS['a4'];
        const width = orientation === 'landscape' ? dims.height : dims.width;
        return `${width}mm`;
    }

    /**
     * Build html2pdf options from user settings
     * @param {Object} settings - User settings
     * @returns {Object} html2pdf options
     */
    function buildOptions(settings) {
        return {
            margin: [
                settings.margins.top,
                settings.margins.left,
                settings.margins.bottom,
                settings.margins.right
            ],
            filename: 'markdown-document.pdf',
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: PAPER_SIZES[settings.paperSize] || 'a4',
                orientation: settings.orientation || 'portrait'
            },
            pagebreak: {
                mode: ['css', 'avoid-all'],
                before: '.page-break'
            }
        };
    }

    /**
     * Create a styled container for PDF generation
     * @param {string} htmlContent - HTML content
     * @param {Object} settings - User settings
     * @returns {HTMLElement} Styled container
     */
    function createStyledContainer(htmlContent, settings) {
        const container = document.createElement('div');
        container.innerHTML = htmlContent;

        // Apply font size
        container.style.fontSize = `${settings.fontSize}px`;
        container.style.lineHeight = '1.8';
        container.style.color = '#333333';
        container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

        // Apply styles to elements for consistent PDF output
        applyPdfStyles(container);

        // Apply syntax highlighting inline styles for PDF
        if (settings.syntaxHighlight) {
            applyHighlightStyles(container, 'github');
        }

        return container;
    }

    /**
     * Apply PDF-specific styles to container elements
     * @param {HTMLElement} container
     */
    function applyPdfStyles(container) {
        // Style headings
        container.querySelectorAll('h1').forEach(el => {
            el.style.fontSize = '2em';
            el.style.marginBottom = '0.5em';
            el.style.paddingBottom = '0.3em';
            el.style.borderBottom = '1px solid #e0e0e0';
        });

        container.querySelectorAll('h2').forEach(el => {
            el.style.fontSize = '1.5em';
            el.style.marginTop = '1em';
            el.style.marginBottom = '0.5em';
        });

        container.querySelectorAll('h3').forEach(el => {
            el.style.fontSize = '1.25em';
            el.style.marginTop = '1em';
            el.style.marginBottom = '0.5em';
        });

        // Style paragraphs
        container.querySelectorAll('p').forEach(el => {
            el.style.marginBottom = '1em';
        });

        // Style lists
        container.querySelectorAll('ul, ol').forEach(el => {
            el.style.marginBottom = '1em';
            el.style.paddingLeft = '2em';
        });

        // Style code blocks
        container.querySelectorAll('pre').forEach(el => {
            el.style.backgroundColor = '#f5f5f5';
            el.style.padding = '16px';
            el.style.borderRadius = '4px';
            el.style.overflowX = 'auto';
            el.style.marginBottom = '1em';
        });

        container.querySelectorAll('code').forEach(el => {
            el.style.fontFamily = "'Menlo', 'Monaco', 'Courier New', monospace";
            el.style.fontSize = '0.9em';
            if (!el.parentElement || el.parentElement.tagName !== 'PRE') {
                el.style.backgroundColor = '#f5f5f5';
                el.style.padding = '2px 6px';
                el.style.borderRadius = '3px';
            }
        });

        // Style blockquotes
        container.querySelectorAll('blockquote').forEach(el => {
            el.style.borderLeft = '4px solid #2563eb';
            el.style.paddingLeft = '16px';
            el.style.margin = '1em 0';
            el.style.color = '#666666';
        });

        // Style tables
        container.querySelectorAll('table').forEach(el => {
            el.style.width = '100%';
            el.style.borderCollapse = 'collapse';
            el.style.marginBottom = '1em';
            el.style.breakInside = 'avoid';
            el.style.pageBreakInside = 'avoid';
        });

        container.querySelectorAll('th, td').forEach(el => {
            el.style.border = '1px solid #e0e0e0';
            el.style.padding = '8px 12px';
            el.style.textAlign = 'left';
        });

        container.querySelectorAll('th').forEach(el => {
            el.style.backgroundColor = '#f5f5f5';
            el.style.fontWeight = '600';
        });

        // Style links
        container.querySelectorAll('a').forEach(el => {
            el.style.color = '#2563eb';
            el.style.textDecoration = 'none';
        });

        // Style page breaks for PDF
        container.querySelectorAll('.page-break').forEach(el => {
            el.style.pageBreakBefore = 'always';
            el.style.breakBefore = 'page';
            el.style.border = 'none';
            el.style.margin = '0';
            el.style.padding = '0';
            el.style.height = '0';
        });

        // Style Mermaid diagrams
        container.querySelectorAll('.mermaid-container').forEach(el => {
            el.style.margin = '1em 0';
            el.style.textAlign = 'center';
            el.style.breakInside = 'avoid';
            el.style.pageBreakInside = 'avoid';
        });

        container.querySelectorAll('.mermaid svg').forEach(el => {
            el.style.maxWidth = '100%';
            el.style.height = 'auto';
        });
    }

    /**
     * Apply syntax highlighting inline styles for PDF
     * highlight.js applies styles via CSS classes, but html2canvas needs inline styles
     * @param {HTMLElement} container
     * @param {string} theme - The highlight.js theme name
     */
    function applyHighlightStyles(container, theme) {
        // Theme-based color schemes (GitHub theme as default)
        const themeStyles = {
            'github': {
                background: '#f6f8fa',
                text: '#24292e',
                keyword: '#d73a49',
                string: '#032f62',
                number: '#005cc5',
                comment: '#6a737d',
                function: '#6f42c1',
                title: '#6f42c1',
                built_in: '#005cc5',
                type: '#d73a49',
                variable: '#e36209',
                tag: '#22863a',
                attr: '#005cc5',
                meta: '#005cc5',
                addition: '#22863a',
                deletion: '#b31d28'
            },
            'github-dark': {
                background: '#0d1117',
                text: '#c9d1d9',
                keyword: '#ff7b72',
                string: '#a5d6ff',
                number: '#79c0ff',
                comment: '#8b949e',
                function: '#d2a8ff',
                title: '#d2a8ff',
                built_in: '#79c0ff',
                type: '#ff7b72',
                variable: '#ffa657',
                tag: '#7ee787',
                attr: '#79c0ff',
                meta: '#79c0ff',
                addition: '#7ee787',
                deletion: '#ffa198'
            },
            'monokai': {
                background: '#272822',
                text: '#f8f8f2',
                keyword: '#f92672',
                string: '#e6db74',
                number: '#ae81ff',
                comment: '#75715e',
                function: '#a6e22e',
                title: '#a6e22e',
                built_in: '#66d9ef',
                type: '#66d9ef',
                variable: '#f8f8f2',
                tag: '#f92672',
                attr: '#a6e22e',
                meta: '#f92672',
                addition: '#a6e22e',
                deletion: '#f92672'
            }
        };

        // Get theme colors or default to github
        const colors = themeStyles[theme] || themeStyles['github'];

        // Style highlighted code blocks
        container.querySelectorAll('code.hljs').forEach(codeBlock => {
            codeBlock.style.display = 'block';
            codeBlock.style.padding = '16px';
            codeBlock.style.backgroundColor = colors.background;
            codeBlock.style.color = colors.text;
            codeBlock.style.borderRadius = '4px';
            codeBlock.style.overflowX = 'auto';
            codeBlock.style.fontFamily = "'Menlo', 'Monaco', 'Courier New', monospace";
            codeBlock.style.fontSize = '0.875em';
            codeBlock.style.lineHeight = '1.45';

            // Apply styles to highlighted spans
            const styleMap = {
                'hljs-keyword': { color: colors.keyword, fontWeight: '600' },
                'hljs-string': { color: colors.string },
                'hljs-number': { color: colors.number },
                'hljs-literal': { color: colors.number },
                'hljs-comment': { color: colors.comment, fontStyle: 'italic' },
                'hljs-function': { color: colors.function },
                'hljs-title': { color: colors.title },
                'hljs-class': { color: colors.title },
                'hljs-params': { color: colors.text },
                'hljs-built_in': { color: colors.built_in },
                'hljs-attr': { color: colors.attr },
                'hljs-attribute': { color: colors.attr },
                'hljs-selector-class': { color: colors.title },
                'hljs-selector-id': { color: colors.number },
                'hljs-selector-tag': { color: colors.tag },
                'hljs-tag': { color: colors.tag },
                'hljs-name': { color: colors.tag },
                'hljs-type': { color: colors.type },
                'hljs-variable': { color: colors.variable },
                'hljs-template-variable': { color: colors.variable },
                'hljs-regexp': { color: colors.string },
                'hljs-link': { color: colors.string, textDecoration: 'underline' },
                'hljs-meta': { color: colors.meta },
                'hljs-meta-keyword': { color: colors.keyword },
                'hljs-meta-string': { color: colors.string },
                'hljs-symbol': { color: colors.number },
                'hljs-bullet': { color: colors.number },
                'hljs-addition': { color: colors.addition, backgroundColor: 'rgba(46, 160, 67, 0.15)' },
                'hljs-deletion': { color: colors.deletion, backgroundColor: 'rgba(248, 81, 73, 0.15)' },
                'hljs-emphasis': { fontStyle: 'italic' },
                'hljs-strong': { fontWeight: '700' }
            };

            Object.keys(styleMap).forEach(className => {
                codeBlock.querySelectorAll(`.${className}`).forEach(el => {
                    const styles = styleMap[className];
                    Object.keys(styles).forEach(prop => {
                        el.style[prop] = styles[prop];
                    });
                });
            });
        });

        // Ensure pre elements containing hljs code don't add extra padding
        container.querySelectorAll('pre').forEach(pre => {
            if (pre.querySelector('code.hljs')) {
                pre.style.padding = '0';
                pre.style.margin = '0 0 1em 0';
                pre.style.backgroundColor = 'transparent';
            }
        });
    }

    /**
     * Extract title from HTML content (first H1)
     * @param {HTMLElement} container - HTML container
     * @returns {string} Title text
     */
    function extractTitle(container) {
        const h1 = container.querySelector('h1');
        return h1 ? h1.textContent.trim() : '';
    }

    /**
     * Wait for Mermaid SVGs to be fully rendered
     * @param {HTMLElement} container - Container with Mermaid elements
     * @param {number} maxWait - Maximum wait time in ms
     * @returns {Promise} Promise that resolves when SVGs are ready
     */
    async function waitForMermaidSvgs(container, maxWait = 5000) {
        const mermaidContainers = container.querySelectorAll('.mermaid-container');
        if (mermaidContainers.length === 0) {
            return;
        }

        const startTime = Date.now();

        // Wait until all mermaid containers have SVG children with dimensions
        while (Date.now() - startTime < maxWait) {
            await new Promise(resolve => requestAnimationFrame(resolve));

            let allReady = true;
            for (const mc of mermaidContainers) {
                const svg = mc.querySelector('svg');
                if (!svg) {
                    allReady = false;
                    break;
                }
                // Check if SVG has valid dimensions
                const bbox = svg.getBoundingClientRect();
                if (bbox.width === 0 || bbox.height === 0) {
                    allReady = false;
                    break;
                }
            }

            if (allReady) {
                // Additional frame to ensure rendering is complete
                await new Promise(resolve => requestAnimationFrame(resolve));
                return;
            }
        }
        console.warn('waitForMermaidSvgs: timeout reached, some SVGs may not be fully rendered');
    }

    /**
     * Wait for container to be fully rendered
     * @param {HTMLElement} container - The container to check
     * @param {number} maxWait - Maximum wait time in ms
     * @returns {Promise} Promise that resolves when container is rendered
     */
    async function waitForRender(container, maxWait = 3000) {
        // Wait for fonts to be ready
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        // Poll until container has dimensions or max wait reached
        const startTime = Date.now();
        while (Date.now() - startTime < maxWait) {
            await new Promise(resolve => requestAnimationFrame(resolve));
            if (container.offsetHeight > 0 && container.offsetWidth > 0) {
                // Additional frame to ensure paint is complete
                await new Promise(resolve => requestAnimationFrame(resolve));
                return;
            }
        }
        console.warn('waitForRender: timeout reached, container may not be fully rendered');
    }

    /**
     * Build print CSS styles
     * @param {Object} settings - User settings
     * @returns {string} CSS string for print
     */
    function buildPrintStyles(settings) {
        const dims = PAPER_DIMENSIONS[settings.paperSize] || PAPER_DIMENSIONS['a4'];
        const width = settings.orientation === 'landscape' ? dims.height : dims.width;
        const height = settings.orientation === 'landscape' ? dims.width : dims.height;

        // Calculate margins - add space for header/footer if enabled
        const headerMargin = settings.enableHeader ? Math.max(settings.margins.top, 15) : settings.margins.top;
        const footerMargin = settings.enableFooter ? Math.max(settings.margins.bottom, 15) : settings.margins.bottom;

        return `
            @page {
                size: ${width}mm ${height}mm;
                margin: ${headerMargin}mm ${settings.margins.right}mm ${footerMargin}mm ${settings.margins.left}mm;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-size: ${settings.fontSize}px;
                    line-height: 1.8;
                    color: #333333;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .page-break {
                    page-break-before: always;
                    break-before: page;
                }
                .print-header, .print-footer {
                    position: fixed;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 10px;
                    color: #808080;
                }
                .print-header {
                    top: 0;
                }
                .print-footer {
                    bottom: 0;
                }
            }
        `;
    }

    /**
     * Build header/footer HTML for print
     * Since CSS @page margin boxes have limited browser support,
     * we use fixed position elements that appear on each printed page.
     * Note: {pageNumber} and {totalPages} are not supported with this approach
     * as JavaScript cannot determine print pagination.
     * @param {Object} settings - User settings
     * @param {string} title - Document title
     * @returns {string} HTML string for header/footer
     */
    function buildHeaderFooterHtml(settings, title) {
        const today = new Date().toLocaleDateString('ja-JP');
        let html = '';

        if (settings.enableHeader && settings.headerTemplate) {
            const headerText = settings.headerTemplate
                .replace(/\{date\}/g, today)
                .replace(/\{title\}/g, title)
                .replace(/\{pageNumber\}/g, '')
                .replace(/\{totalPages\}/g, '');
            if (headerText.trim()) {
                html += `<div class="print-header">${escapeHtml(headerText)}</div>`;
            }
        }

        if (settings.enableFooter && settings.footerTemplate) {
            const footerText = settings.footerTemplate
                .replace(/\{date\}/g, today)
                .replace(/\{title\}/g, title)
                .replace(/\{pageNumber\}/g, '')
                .replace(/\{totalPages\}/g, '');
            if (footerText.trim()) {
                html += `<div class="print-footer">${escapeHtml(footerText)}</div>`;
            }
        }

        return html;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Generate PDF using browser print dialog
     * @param {string} htmlContent - HTML content to convert
     * @param {Object} settings - User settings
     * @returns {Promise} Promise that resolves when print dialog opens
     */
    async function generate(htmlContent, settings) {
        const container = createStyledContainer(htmlContent, settings);
        const title = extractTitle(container);

        // Temporarily add container to DOM for Mermaid rendering
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.visibility = 'hidden';
        container.style.zIndex = '-1';
        container.style.width = getPaperWidth(settings.paperSize, settings.orientation);
        container.style.backgroundColor = '#ffffff';
        document.body.appendChild(container);

        // Wait for container to be fully rendered
        await waitForRender(container);

        // Render Mermaid diagrams if enabled
        if (settings.renderMermaid) {
            await MermaidRenderer.render(container, { showErrors: false });
            await waitForMermaidSvgs(container, 5000);
        }

        // Get the final HTML content
        const finalContent = container.innerHTML;

        // Clean up temporary container
        document.body.removeChild(container);

        // Build print CSS and header/footer HTML
        const printStyles = buildPrintStyles(settings);
        const headerFooterHtml = buildHeaderFooterHtml(settings, title);

        // Create hidden iframe for printing (same tab, no new window)
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Write content to iframe
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title || 'Markdown Document'}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
                <style>
                    ${printStyles}
                    body {
                        margin: 0;
                        padding: 20px;
                        font-size: ${settings.fontSize}px;
                        line-height: 1.8;
                        color: #333333;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    h1 { font-size: 2em; margin-bottom: 0.5em; padding-bottom: 0.3em; border-bottom: 1px solid #e0e0e0; }
                    h2 { font-size: 1.5em; margin-top: 1em; margin-bottom: 0.5em; }
                    h3 { font-size: 1.25em; margin-top: 1em; margin-bottom: 0.5em; }
                    p { margin-bottom: 1em; }
                    ul, ol { margin-bottom: 1em; padding-left: 2em; }
                    pre { background-color: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; margin-bottom: 1em; }
                    code { font-family: 'Menlo', 'Monaco', 'Courier New', monospace; font-size: 0.9em; }
                    code:not(pre code) { background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
                    blockquote { border-left: 4px solid #2563eb; padding-left: 16px; margin: 1em 0; color: #666666; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
                    th, td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: 600; }
                    a { color: #2563eb; text-decoration: none; }
                    .page-break { page-break-before: always; break-before: page; border: none; margin: 0; padding: 0; height: 0; }
                    .mermaid-container { margin: 1em 0; text-align: center; }
                    .mermaid-container svg { max-width: 100%; height: auto; }
                </style>
            </head>
            <body>
                ${headerFooterHtml}
                ${finalContent}
            </body>
            </html>
        `);
        iframeDoc.close();

        // Wait for iframe content to load
        await new Promise((resolve) => {
            iframe.onload = resolve;
            setTimeout(resolve, 500);
        });

        // Print from iframe
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Remove iframe after print dialog closes
        const cleanup = () => {
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        };

        // Use afterprint event if supported
        if ('onafterprint' in iframe.contentWindow) {
            iframe.contentWindow.onafterprint = cleanup;
        } else {
            // Fallback: remove after a delay
            setTimeout(cleanup, 1000);
        }
    }

    // Public API
    return {
        generate,
        buildOptions
    };
})();
