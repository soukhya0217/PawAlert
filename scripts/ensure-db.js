const net = require("net");
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORT = 27017;
const HOST = "127.0.0.1";
const DATA_DIR = path.resolve(process.cwd(), ".mongo-data");

function checkPort(host, port, timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once("connect", () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.once("error", () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

function cleanStaleLocks(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }

  const lockFiles = ["mongod.lock", "WiredTiger.lock"];
  for (const file of lockFiles) {
    const fullPath = path.join(dir, file);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[MongoDB] Cleared stale lock: ${file}`);
      } catch (e) {
        // file might be legitimately locked by an active process
      }
    }
  }
}

function findMongodExe() {
  const possiblePaths = [
    "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }

  // Check PATH
  try {
    const stdout = execSync("where mongod", { stdio: ["ignore", "pipe", "ignore"] }).toString();
    const firstLine = stdout.split(/\r?\n/)[0].trim();
    if (firstLine && fs.existsSync(firstLine)) return firstLine;
  } catch {}

  return null;
}

async function ensureMongoDB() {
  const isRunning = await checkPort(HOST, PORT);
  if (isRunning) {
    console.log(`[MongoDB] Database engine is active and listening on ${HOST}:${PORT}`);
    return;
  }

  console.log(`[MongoDB] Port ${PORT} is not responding. Initializing local database daemon...`);

  cleanStaleLocks(DATA_DIR);

  const mongodPath = findMongodExe();
  if (mongodPath) {
    console.log(`[MongoDB] Launching installed engine: ${mongodPath}`);
    const child = spawn(mongodPath, ["--dbpath", DATA_DIR, "--port", String(PORT), "--bind_ip", HOST], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    // Poll until port is open (up to 10 seconds)
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await checkPort(HOST, PORT)) {
        console.log(`[MongoDB] Engine ready on ${HOST}:${PORT}! (PID: ${child.pid})`);
        return;
      }
    }
  }

  console.log("[MongoDB] Installed mongod not available or failed to bind. Next.js will use persistent in-memory fallback.");
}

ensureMongoDB().catch((err) => {
  console.warn("[MongoDB] Database check warning:", err.message);
});
