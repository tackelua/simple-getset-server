const process = require("process");
const fs = require("fs");
const express = require("express");
const app = express();

const PORT = 4000;

let Data = {};

function onExit() {
  process.stdin.resume(); //so the program will not close instantly

  function exitHandler(options, exitCode) {
    fs.writeFileSync("Data.json", JSON.stringify(Data));
    if (options.cleanup) console.log("clean");
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
  }

  //do something when app is closing
  process.on("exit", exitHandler.bind(null, { cleanup: true }));

  //catches ctrl+c event
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
  process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

  //catches uncaught exceptions
  process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
}
onExit();

async function onStartup() {
  try {
    Data = JSON.parse(fs.readFileSync("Data.json"));
  } catch (e) {}
}
onStartup();

app.use(function(req, res, next) {
  req.rawBody = "";
  req.setEncoding("utf8");

  req.on("data", function(chunk) {
    req.rawBody += chunk;
  });

  req.on("end", function() {
    try {
      if (req.rawBody !== '"undefined"') {
        req.body = JSON.parse(req.rawBody);
      }
    } catch (e) {}
    next();
  });
});

function get(pathArray) {
  console.log(`${new Date().toISOString()} GET /${pathArray.join("/")}`);

  let d = Data;
  try {
    for (const i of pathArray) {
      d = d[i];
    }
    return d ? d : null;
  } catch (e) {
    return null;
  }
}

function set(pathArray, value) {
  console.log(`${new Date().toISOString()} SET /${pathArray.join("/")}`);

  if (pathArray.length === 1 && Data === "null") {
    Data = {};
  }

  let d = Data;
  for (let i = 0; i < pathArray.length - 1; i++) {
    d[pathArray[i]] =
      typeof d[pathArray[i]] === "object" && d[pathArray[i]] !== "null"
        ? d[pathArray[i]]
        : {};
    d = d[pathArray[i]];
  }
  if (pathArray.length) {
    d[pathArray[pathArray.length - 1]] = value;
  } else {
    Data = value;
  }
  return d;
}

app.get("*", (req, res) => {
  let params = req.params["0"].split("/").filter(p => p != "");
  let data = get(params);
  if (typeof data === "object") {
    res.json(data);
  } else {
    res.end(data);
  }
});

app.post("*", (req, res) => {
  let params = req.params["0"].split("/").filter(p => p != "");
  let data = req.body ? req.body : req.rawBody;
  set(params, data);
  if (req.body) {
    res.json(data);
  } else {
    res.end(data);
  }
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
