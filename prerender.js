import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  { path: '/', output: 'index.html' },
  { path: '/about', output: 'about/index.html' },
  { path: '/simple-2d-animated-dla', output: 'simple-2d-animated-dla/index.html' },
  { path: '/svg-dla', output: 'svg-dla/index.html' },
  { path: '/distance-gradient', output: 'distance-gradient/index.html' }
];

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'preview'], {
      stdio: 'pipe',
      cwd: __dirname
    });
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('http://localhost')) {
        resolve(server);
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

async function prerenderRoute(page, route) {
  console.log(`Rendering ${route.path}...`);
  
  await page.goto(`http://localhost:4173${route.path}`, {
    waitUntil: 'networkidle0',
    timeout: 10000
  });
  
  // Wait for React to render
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Wait for the app-ready event if it exists
  try {
    await page.waitForFunction(() => {
      return document.querySelector('#root') && 
             document.querySelector('#root').children.length > 0;
    }, { timeout: 5000 });
  } catch (error) {
    console.log('App ready event not detected, continuing...');
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

async function runPrerendering() {
  let server;
  let browser;
  
  try {
    console.log('Starting Vite preview server...');
    server = await startServer();
    console.log('Server started successfully');
    
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    console.log('Starting pre-rendering...');
    
    for (const route of routes) {
      await prerenderRoute(page, route);
    }
    
    console.log('Pre-rendering completed successfully!');
    
  } catch (error) {
    console.error('Pre-rendering failed:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.kill();
    }
  }
}

runPrerendering();
