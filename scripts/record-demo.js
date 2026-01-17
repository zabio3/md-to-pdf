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

  // Paste markdown content (instant fill like copy-paste)
  const markdown = `# Welcome to MD to PDF

## Features

- Real-time preview
- PDF export
- Mermaid diagrams

## Flowchart Example

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
\`\`\`
`;

  await page.fill('#markdown-input', markdown);
  await page.waitForTimeout(2000);

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
