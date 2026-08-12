/**
 * Local development launcher for the Khety React app.
 *
 * Ensures the CRA dev server always binds to port 3000 unless the user
 * explicitly passes `--port <number>`. Some desktop terminal environments
 * (e.g. the Freebuff terminal) inject a stray `PORT` variable into the shell;
 * CRA honors that variable, which makes `npm start` try to bind an already
 * occupied port and exit immediately. This wrapper neutralizes that so
 * `npm start` just works everywhere.
 *
 * Usage:
 *   npm start
 *   npm start -- --port 4000
 */
const path = require("path");
const { createRequire } = require("module");

const flagIndex = process.argv.indexOf("--port");
const requestedPort = flagIndex !== -1 ? process.argv[flagIndex + 1] : null;
process.env.PORT = requestedPort || "3000";

const frontendRequire = createRequire(
  path.join(__dirname, "..", "khety-frontend", "package.json")
);

// Runs the CRA start script in this process so stdin/stdout stay attached,
// exactly like a plain `react-scripts start`.
frontendRequire("react-scripts/scripts/start");
