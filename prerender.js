import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  { path: '/', output: 'index.html' }, // Root route
  { path: '/about', output: 'about/index.html' },
  { path: '/simple-2d-animated-dla', output: 'simple-2d-animated-dla/index.html' },
  { path: '/svg-dla', output: 'svg-dla/index.html' },
  { path: '/distance-gradient', output: 'distance-gradient/index.html' }
];

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

  const html = await page.content();

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
