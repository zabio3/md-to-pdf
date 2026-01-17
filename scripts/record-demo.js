import { chromium } from 'playwright';

async function recordDemo() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordVideo: {
      dir: 'videos/',
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('#markdown-input');

  // Clear the editor
  await page.fill('#markdown-input', '');
  await page.waitForTimeout(500);

  // Paste markdown content with complex Mermaid diagram
  const markdown = `# Project Documentation

## Overview

This document demonstrates the **MD to PDF Converter** features including:

- Real-time Markdown preview
- Syntax highlighting for code blocks
- Mermaid diagram rendering
- Customizable PDF export options

## Architecture

\`\`\`mermaid
flowchart TB
    subgraph Client["Browser Client"]
        UI[User Interface]
        Editor[Markdown Editor]
        Preview[Live Preview]
    end

    subgraph Core["Core Engine"]
        Parser[Markdown Parser]
        Renderer[HTML Renderer]
        Mermaid[Mermaid.js]
        Highlight[Syntax Highlighter]
    end

    subgraph Export["Export Module"]
        PDF[PDF Generator]
        Print[Print API]
    end

    UI --> Editor
    Editor --> Parser
    Parser --> Renderer
    Renderer --> Preview
    Renderer --> Mermaid
    Renderer --> Highlight
    Preview --> PDF
    PDF --> Print
\`\`\`

## Code Example

\`\`\`javascript
// Initialize the application
const app = {
  init() {
    this.editor = document.getElementById('markdown-input');
    this.preview = document.getElementById('preview-content');
    this.bindEvents();
  },

  bindEvents() {
    this.editor.addEventListener('input', () => {
      this.render();
    });
  }
};
\`\`\`

## Features Table

| Feature | Status | Description |
|---------|--------|-------------|
| Live Preview | ✅ | Real-time rendering |
| PDF Export | ✅ | One-click export |
| Mermaid | ✅ | Diagram support |
| Code Highlight | ✅ | Multiple languages |
`;

  await page.fill('#markdown-input', markdown);
  await page.waitForTimeout(2500);

  // Sidebar is always visible at 1280px width
  // Change paper size to Letter
  await page.selectOption('#paper-size', 'letter');
  await page.waitForTimeout(600);

  // Change orientation to Landscape
  await page.selectOption('#orientation', 'landscape');
  await page.waitForTimeout(600);

  // Adjust font size slider (from 14 to 18)
  const fontSlider = page.locator('#font-size');
  await fontSlider.fill('18');
  await page.waitForTimeout(800);

  // Adjust font size again (to 12)
  await fontSlider.fill('12');
  await page.waitForTimeout(800);

  // Open Advanced Settings
  await page.click('#advanced-toggle');
  await page.waitForTimeout(800);

  // Click export PDF button
  await page.click('#export-btn');
  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();
  console.log('Recording saved to videos/');
}

recordDemo();
