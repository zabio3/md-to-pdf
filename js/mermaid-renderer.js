/**
 * Mermaid Renderer Module
 * Handles Mermaid diagram rendering with debouncing and error display
 */

const MermaidRenderer = (function() {
    'use strict';

    // Render ID counter for debouncing
    let currentRenderId = 0;

    /**
     * Render Mermaid diagrams in a container with error handling
     * @param {HTMLElement} container - Container with .mermaid elements
     * @param {Object} options - Rendering options
     * @param {boolean} options.showErrors - Whether to show error messages (default: true)
     * @returns {Promise<boolean>} - Whether rendering was successful
     */
    async function render(container, options = {}) {
        const { showErrors = true } = options;

        if (typeof mermaid === 'undefined') {
            return false;
        }

        const mermaidElements = container.querySelectorAll('.mermaid:not([data-processed="true"])');
        if (mermaidElements.length === 0) {
            return true;
        }

        // Increment render ID for debouncing
        const renderId = ++currentRenderId;

        try {
            await mermaid.run({
                nodes: mermaidElements
            });

            // Check if this render is still current
            if (renderId !== currentRenderId) {
                return false;
            }

            return true;
        } catch (error) {
            // Check if this render is still current
            if (renderId !== currentRenderId) {
                return false;
            }

            console.error('Mermaid rendering error:', error);

            if (showErrors) {
                displayErrors(container, error);
            }

            return false;
        }
    }

    /**
     * Display error messages for failed Mermaid diagrams
     * @param {HTMLElement} container - Container with .mermaid elements
     * @param {Error} error - The error that occurred
     */
    function displayErrors(container, error) {
        // Find mermaid elements that failed to render (no SVG inside)
        container.querySelectorAll('.mermaid-container').forEach(wrapper => {
            const mermaidEl = wrapper.querySelector('.mermaid');
            if (mermaidEl && !mermaidEl.querySelector('svg')) {
                // Check if error display already exists
                if (wrapper.querySelector('.mermaid-error')) {
                    return;
                }

                const errorDiv = document.createElement('div');
                errorDiv.className = 'mermaid-error';

                const errorMessage = extractErrorMessage(error);
                errorDiv.innerHTML = `
                    <span class="mermaid-error-icon">⚠</span>
                    <span class="mermaid-error-text">ダイアグラムの描画に失敗しました</span>
                    <span class="mermaid-error-detail">${escapeHtml(errorMessage)}</span>
                `;

                wrapper.appendChild(errorDiv);
            }
        });
    }

    /**
     * Extract a user-friendly error message
     * @param {Error} error - The error object
     * @returns {string} - User-friendly error message
     */
    function extractErrorMessage(error) {
        if (!error) return 'Unknown error';

        const message = error.message || String(error);

        // Try to extract the specific syntax error
        const syntaxMatch = message.match(/Syntax error in.*?line (\d+)/i);
        if (syntaxMatch) {
            return `Syntax error at line ${syntaxMatch[1]}`;
        }

        // Limit message length
        if (message.length > 100) {
            return message.substring(0, 100) + '...';
        }

        return message;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear any existing error displays in a container
     * @param {HTMLElement} container - Container to clear errors from
     */
    function clearErrors(container) {
        container.querySelectorAll('.mermaid-error').forEach(el => el.remove());
    }

    /**
     * Reset mermaid elements for re-rendering
     * @param {HTMLElement} container - Container with mermaid elements
     */
    function reset(container) {
        container.querySelectorAll('.mermaid').forEach(el => {
            el.removeAttribute('data-processed');
            // Remove generated SVG
            const svg = el.querySelector('svg');
            if (svg) {
                svg.remove();
            }
        });
        clearErrors(container);
    }

    // Public API
    return {
        render,
        clearErrors,
        reset
    };
})();
