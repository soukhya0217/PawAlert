/* eslint-disable @typescript-eslint/no-var-requires */
const http = require('http');
const net = require('net');
const path = require('path');
const { spawn, exec } = require('child_process');

// Determine candidate ports (try 3000 first; automatically failover if occupied)
const CANDIDATE_PORTS = [3000, 3001, 3002, 3003, 3004, 3005, 8080];

function checkSocketBinding(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    try {
      server.listen(port, host);
    } catch {
      resolve(false);
    }
  });
}

function probeHttpPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}`, () => {
      // Something responded! Port is occupied.
      resolve(false);
    });
    req.once('error', () => {
      // Nothing responded, port is free to bind
      resolve(true);
    });
    req.setTimeout(250, () => {
      req.destroy();
      resolve(true);
    });
  });
}

async function isPortFree(port) {
  // Test both IPv4 localhost and IPv6 all-interfaces
  const free127 = await checkSocketBinding(port, '127.0.0.1');
  if (!free127) return false;

  const free0 = await checkSocketBinding(port, '0.0.0.0');
  if (!free0) return false;

  const freeHttp = await probeHttpPort(port);
  if (!freeHttp) return false;

  return true;
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
      console.log(`[INFO] Please open this URL in your browser: ${url}`);
    }
  });
}

let activeChild = null;

function killChild(child) {
  if (!child || child.killed) return;
  try {
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${child.pid} /T /F`, () => {});
    } else {
      child.kill('SIGINT');
    }
  } catch {
    // ignore
  }
}

async function launchOnPortIndex(portIndex) {
  if (portIndex >= CANDIDATE_PORTS.length) {
    console.error('\n[FATAL ERROR] All candidate ports (3000-3005, 8080) are occupied or restricted.');
    process.exit(1);
  }

  const port = CANDIDATE_PORTS[portIndex];
  const url = `http://localhost:${port}`;

  // Pre-check port availability
  const available = await isPortFree(port);
  if (!available) {
    console.log(`[INFO] Port ${port} is currently busy or reserved. Checking port ${CANDIDATE_PORTS[portIndex + 1]}...`);
    return launchOnPortIndex(portIndex + 1);
  }

  console.log(`[2/3] Starting Next.js server at ${url} (port ${port}) ...`);

  const nextBin = require.resolve('next/dist/bin/next');
  const projectRoot = path.resolve(__dirname, '..');

  // Explicitly specify -H 127.0.0.1 to avoid Windows IPv6 :::3000 collision bugs
  const child = spawn(process.execPath, [nextBin, 'dev', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  activeChild = child;
  let hasTriggeredBrowser = false;
  let hasEncounteredEaddrinuse = false;
  let isServerReady = false;

  const triggerBrowser = () => {
    if (hasTriggeredBrowser || hasEncounteredEaddrinuse) return;
    hasTriggeredBrowser = true;

    console.log('\n==============================================================');
    console.log('>>> SUCCESS: PAWALERT is now LIVE and READY!');
    console.log(`>>> Active URL: ${url}`);
    console.log('>>> Opening in your default web browser...');
    console.log('==============================================================');
    console.log('Keep this window open while using PAWALERT.');
    console.log('To stop the platform safely, press Ctrl+C in this window.');
    console.log('==============================================================\n');

    openBrowser(url);
  };

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);

    // Only trigger once Next.js signals ready
    if (text.includes('Ready in') || text.includes('ready in') || text.includes('Compiled')) {
      isServerReady = true;
      setTimeout(triggerBrowser, 300);
    }
  });

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    process.stderr.write(text);

    if (text.includes('EADDRINUSE') || text.includes('address already in use')) {
      hasEncounteredEaddrinuse = true;
    }
  });

  // Background health check polling as a secondary trigger only after 1.5s
  const pollInterval = setInterval(() => {
    if (hasTriggeredBrowser || hasEncounteredEaddrinuse) {
      clearInterval(pollInterval);
      return;
    }

    const req = http.get(`http://127.0.0.1:${port}`, (res) => {
      // Only trigger if server responded and is ready
      if (res.statusCode && res.statusCode < 500) {
        clearInterval(pollInterval);
        isServerReady = true;
        triggerBrowser();
      }
    });

    req.once('error', () => {
      // Still spinning up
    });
    req.setTimeout(500, () => {
      req.destroy();
    });
  }, 1000);

  child.on('exit', (code) => {
    clearInterval(pollInterval);
    activeChild = null;

    if (hasEncounteredEaddrinuse || (!isServerReady && code !== 0)) {
      console.log(`\n[WARN] Port ${port} encountered a conflict (code ${code}). Auto-switching to next port...`);
      killChild(child);
      return launchOnPortIndex(portIndex + 1);
    }

    if (code !== 0 && code !== null) {
      console.error(`\n[ERROR] Next.js exited with code ${code}.`);
    } else {
      console.log('\n[INFO] Next.js server has stopped.');
    }
    process.exit(code || 0);
  });
}

async function main() {
  console.log('==============================================================');
  console.log('  PAWALERT: Animal Rescue Platform');
  console.log('  "Because Every Paw Matters. Every Alert Counts."');
  console.log('==============================================================\n');

  console.log('[1/3] Detecting available network port...');
  await launchOnPortIndex(0);
}

process.on('SIGINT', () => {
  console.log('\n[INFO] Shutting down POWER ALERT...');
  killChild(activeChild);
  process.exit(0);
});

process.on('SIGTERM', () => {
  killChild(activeChild);
  process.exit(0);
});

main().catch((err) => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
