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

    // Paper widths in mm for container sizing
    const PAPER_WIDTHS = {
        'a4': '210mm',
        'letter': '216mm',
        'legal': '216mm',
        'a3': '297mm',
        'a5': '148mm'
    };

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
                orientation: 'portrait'
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
        });

        container.querySelectorAll('.mermaid svg').forEach(el => {
            el.style.maxWidth = '100%';
            el.style.height = 'auto';
        });
    }

    /**
     * Add page numbers to all pages of a jsPDF document
     * @param {jsPDF} pdf - The jsPDF instance
     */
    function addPageNumbersToPdf(pdf) {
        const totalPages = pdf.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Set font for page numbers
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);

            // Add centered page number at bottom
            const text = `${i} / ${totalPages}`;
            const textWidth = pdf.getStringUnitWidth(text) * pdf.getFontSize() / pdf.internal.scaleFactor;
            const xPos = (pageWidth - textWidth) / 2;
            const yPos = pageHeight - 10;

            pdf.text(text, xPos, yPos);
        }
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
     * Generate PDF from HTML content
     * @param {string} htmlContent - HTML content to convert
     * @param {Object} settings - User settings
     * @returns {Promise} Promise that resolves when PDF is generated
     */
    async function generate(htmlContent, settings) {
        const options = buildOptions(settings);
        const container = createStyledContainer(htmlContent, settings);

        // Temporarily add container to DOM for rendering
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = PAPER_WIDTHS[settings.paperSize] || '210mm';
        document.body.appendChild(container);

        // Wait for container to be fully rendered
        await waitForRender(container);

        // Render Mermaid diagrams if enabled
        if (settings.renderMermaid) {
            await MermaidRenderer.render(container, { showErrors: false });
            // Wait for SVG rendering to complete
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        try {
            if (settings.showPageNumbers) {
                // Use toPdf() to get jsPDF instance, modify it, then save
                await html2pdf()
                    .set(options)
                    .from(container)
                    .toPdf()
                    .get('pdf')
                    .then(pdf => {
                        addPageNumbersToPdf(pdf);
                    })
                    .save();
            } else {
                await html2pdf()
                    .set(options)
                    .from(container)
                    .save();
            }
        } finally {
            // Clean up
            document.body.removeChild(container);
        }
    }

    // Public API
    return {
        generate,
        buildOptions
    };
})();
