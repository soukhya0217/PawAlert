/* eslint-disable @typescript-eslint/no-var-requires */
const http = require('http');
const net = require('net');
const path = require('path');
const { spawn, exec } = require('child_process');

// Determine candidate ports (try 3000 first; fallback to 3001-3005)
const CANDIDATE_PORTS = [3000, 3001, 3002, 3003, 3004, 3005, 8080];

function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    // Specifically test IPv4 127.0.0.1
    server.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort() {
  for (const port of CANDIDATE_PORTS) {
    const isAvail = await checkPortAvailable(port);
    if (isAvail) {
      return port;
    }
  }
  return 3001; // Default fallback
}

function openBrowser(url) {
  const platform = process.platform;
  let command = '';
  if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  exec(command, (err) => {
    if (err) {
      console.warn(`[WARN] Could not auto-launch browser: ${err.message}`);
      console.log(`[INFO] Please open this URL manually in your browser: ${url}`);
    }
  });
}

function waitForServer(port, maxWaitMs = 45000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (Date.now() - startTime > maxWaitMs) {
        clearInterval(interval);
        reject(new Error(`Server startup timed out after ${maxWaitMs / 1000} seconds.`));
        return;
      }

      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        clearInterval(interval);
        resolve(true);
      });

      req.on('error', () => {
        // Still starting, wait for next tick
      });
      req.setTimeout(800, () => {
        req.destroy();
      });
    }, 300);
  });
}

async function main() {
  console.log('==============================================================');
  console.log('  POWER ALERT: Animal Rescue Platform');
  console.log('  "Every Life Matters. Every Alert Counts."');
  console.log('==============================================================\n');

  console.log('[1/3] Detecting available network port...');
  const port = await findAvailablePort();
  const url = `http://localhost:${port}`;
  console.log(`[INFO] Selected Port: ${port}`);
  if (port !== 3000) {
    console.log(`[NOTE] Port 3000 was busy or reserved by Windows. Using port ${port}.`);
  }

  const nextBin = require.resolve('next/dist/bin/next');
  const projectRoot = path.resolve(__dirname, '..');

  console.log(`\n[2/3] Starting Next.js server at ${url} ...`);

  const child = spawn(process.execPath, [nextBin, 'dev', '-p', String(port)], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  let browserOpened = false;

  const triggerBrowser = () => {
    if (browserOpened) return;
    browserOpened = true;

    console.log('\n==============================================================');
    console.log('>>> SUCCESS: POWER ALERT is now LIVE and READY!');
    console.log(`>>> Active URL: ${url}`);
    console.log('>>> Opening in your default web browser...');
    console.log('==============================================================');
    console.log('Keep this window open while using POWER ALERT.');
    console.log('To stop the platform safely, press Ctrl+C in this window.');
    console.log('==============================================================\n');

    openBrowser(url);
  };

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);

    // Only trigger once Next.js signals it is ready or compiled
    if (text.includes('Ready in') || text.includes('ready in') || text.includes('Compiled')) {
      setTimeout(triggerBrowser, 300);
    }
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(chunk.toString());
  });

  // Background HTTP health check polling ensures browser opens even if stdout parsing misses
  waitForServer(port)
    .then(() => {
      triggerBrowser();
    })
    .catch((err) => {
      if (!browserOpened) {
        console.warn(`[WARN] Polling notice: ${err.message}`);
      }
    });

  const cleanup = () => {
    if (child && !child.killed) {
      try {
        if (process.platform === 'win32') {
          exec(`taskkill /pid ${child.pid} /T /F`, () => {});
        } else {
          child.kill('SIGINT');
        }
      } catch (e) {
        // ignore
      }
    }
  };

  process.on('SIGINT', () => {
    console.log('\n[INFO] Shutting down POWER ALERT...');
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n[ERROR] Next.js exited unexpectedly with code ${code}.`);
    } else {
      console.log('\n[INFO] Next.js server has stopped.');
    }
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
