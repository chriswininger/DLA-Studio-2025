import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  { path: '/', output: 'index.html' }, // Root route
  { path: '/about', output: 'about.html' }, // Without trailing slash
  { path: '/about/', output: 'about/index.html' }, // With trailing slash
  { path: '/simple-2d-animated-dla', output: 'simple-2d-animated-dla.html' },
  { path: '/simple-2d-animated-dla/', output: 'simple-2d-animated-dla/index.html' },
  { path: '/svg-dla', output: 'svg-dla.html' },
  { path: '/svg-dla/', output: 'svg-dla/index.html' },
  { path: '/distance-gradient', output: 'distance-gradient.html' },
  { path: '/distance-gradient/', output: 'distance-gradient/index.html' }
];

// Helper function to determine canonical URL for a route
function getCanonicalUrl(routePath) {
  const baseUrl = 'https://dlastudio.org';
  
  // For routes without trailing slash, canonical should point to the version with trailing slash
  if (routePath === '/about') {
    return `${baseUrl}/about/`;
  }
  if (routePath === '/simple-2d-animated-dla') {
    return `${baseUrl}/simple-2d-animated-dla/`;
  }
  if (routePath === '/svg-dla') {
    return `${baseUrl}/svg-dla/`;
  }
  if (routePath === '/distance-gradient') {
    return `${baseUrl}/distance-gradient/`;
  }
  
  // For routes with trailing slash or root, canonical points to itself
  return `${baseUrl}${routePath}`;
}

// Helper function to add canonical tag to HTML
function addCanonicalTag(html, canonicalUrl) {
  // Check if canonical tag already exists
  if (html.includes('rel="canonical"')) {
    // Replace existing canonical tag
    const canonicalRegex = /<link[^>]*rel="canonical"[^>]*>/g;
    const canonicalTag = `    <link rel="canonical" href="${canonicalUrl}">`;
    return html.replace(canonicalRegex, canonicalTag);
  }
  
  const canonicalTag = `    <link rel="canonical" href="${canonicalUrl}">`;
  
  // Find the position after the Open Graph meta tags
  const ogUrlIndex = html.indexOf('<meta property="og:url"');
  if (ogUrlIndex === -1) {
    // Fallback: add after the last meta tag
    const lastMetaIndex = html.lastIndexOf('</meta>');
    if (lastMetaIndex !== -1) {
      return html.slice(0, lastMetaIndex + 7) + '\n' + canonicalTag + '\n    ' + html.slice(lastMetaIndex + 7);
    }
    return html;
  }
  
  // Find the end of the og:url meta tag
  const ogUrlEndIndex = html.indexOf('>', ogUrlIndex) + 1;
  
  // Insert canonical tag after the og:url meta tag
  return html.slice(0, ogUrlEndIndex) + '\n    ' + canonicalTag + '\n    ' + html.slice(ogUrlEndIndex);
}

runPrerendering();

async function runPrerendering() {
  let serverInfo;
  let browser;

  try {
    console.log('Starting Vite preview server...');
    serverInfo = await startServer();
    console.log(`Server started successfully on port ${serverInfo.port}`);

    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });

    const page = await browser.newPage();

    console.log('Starting pre-rendering...');

    for (const route of routes) {
      await prerenderRoute(page, route, serverInfo.port);
    }

    console.log('Pre-rendering completed successfully!');

  } catch (error) {
    console.error('Pre-rendering failed:', error);
    process.exit(1);
  } finally {
    console.log('Cleaning up...');

    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }

    if (serverInfo && serverInfo.server) {
      // Kill the entire process tree
      try {
        const { exec } = await import('child_process');

        // Kill the main server process
        serverInfo.server.kill('SIGTERM');
        console.log('Server termination signal sent');

        // Kill all npm preview processes to ensure cleanup
        exec('pkill -f "npm run preview"', (error) => {
          if (!error) {
            console.log('Cleaned up npm preview processes');
          }
        });

        // Force kill after a short delay
        setTimeout(() => {
          try {
            serverInfo.server.kill('SIGKILL');
            console.log('Server force killed');
          } catch (e) {
            console.log('Server already terminated');
          }
        }, 1000);

      } catch (e) {
        console.log('Error during server cleanup:', e.message);
      }
    }

    console.log('Cleanup completed');

    process.exit(0);
  }
}

async function prerenderRoute(page, route, port) {
  console.log(`Rendering ${route.path}...`);

  await page.goto(`http://localhost:${port}${route.path}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // Wait for React to render
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simple check that content is loaded
  try {
    await page.waitForFunction(() => {
      const root = document.querySelector('#root');
      return root && root.children.length > 0;
    }, { timeout: 5000 });
    console.log(`✓ Route ${route.path} rendered`);
  } catch (error) {
    console.log(`Route ${route.path} content not detected, continuing...`);
  }

  let html = await page.content();

  // Add canonical tag based on the route (this is to make google indexing happy)
  // It did not like that the index page the about page initially render the same thing
  // And was reporting Duplicate without user-selected canonical
  const canonicalUrl = getCanonicalUrl(route.path);
  if (canonicalUrl) {
    html = addCanonicalTag(html, canonicalUrl);
  }

  // Create directory if it doesn't exist
  const outputPath = path.join(__dirname, 'dist', route.output);
  const outputDir = path.dirname(outputPath);

  // Always create the directory if it's not the root
  if (outputDir !== path.join(__dirname, 'dist')) {
    const fs = await import('fs');
    await fs.promises.mkdir(outputDir, { recursive: true });
  }

  writeFileSync(outputPath, html);
  console.log(`✓ Generated: ${route.output}`);
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'preview'], {
      stdio: 'pipe',
      cwd: __dirname,
      // Ensure child processes are properly managed
      detached: false
    });

    let port = null;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server output:', output);

      // Extract port from Vite's output format: "➜  Local:   http://localhost:4188/"
      const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
      if (portMatch) {
        port = parseInt(portMatch[1], 10);
        console.log(`Server started on port: ${port}`);
        // Add a small delay to ensure server is fully ready
        resolve({ server, port });
      }
    });

    server.stderr.on('data', (data) => {
      console.log('Server stderr:', data.toString());
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 15000);
  });
}
