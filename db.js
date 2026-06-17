const { spawn } = require("child_process");
const path = require("path");

const PYTHON = "C:\\Users\\zhuju\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const SCRIPT = path.join(__dirname, "db_bridge.py");

let proc = null;
let pendingResolve = null;
let buffer = "";

function startProc() {
  if (proc) return;
  proc = spawn(PYTHON, ["-u", SCRIPT], {
    stdio: ["pipe", "pipe", "pipe"]
  });
  proc.stderr.on("data", function(d) { console.error("py:", d.toString()); });
  proc.on("close", function() { console.log("Python bridge closed"); proc = null; });
  proc.stdout.on("data", function(data) {
    buffer += data.toString();
    var idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      var line = buffer.substring(0, idx);
      buffer = buffer.substring(idx + 1);
      if (pendingResolve) {
        var cb = pendingResolve;
        pendingResolve = null;
        try { cb(JSON.parse(line)); }
        catch(e) { cb({ ok: false, error: "Parse error: " + e.message }); }
      }
    }
  });
  console.log("Python bridge started");
}

function sendQuery(queryStr, params) {
  return new Promise(function(resolve) {
    startProc();
    pendingResolve = resolve;
    proc.stdin.write(JSON.stringify({ sql: queryStr, params: params || [] }) + "\n");
  });
}

async function query(queryStr, params) {
  var result = await sendQuery(queryStr, params || []);
  if (result.ok) {
    return { recordset: result.recordset || [], rowsAffected: result.rowsAffected || [0] };
  }
  console.error("DB Error:", result.error, queryStr.substring(0, 100));
  var dbErr = new Error(result.error || 'Database query failed');
  dbErr.sql = queryStr.substring(0, 200);
  throw dbErr;
}

module.exports = { query: query };
