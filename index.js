const express = require("express");
const app = express();
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

const port = 4000;

let Data = {};

function get(pathArray) {
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
  let d = Data;
  for (let i = 0; i < pathArray.length - 1; i++) {
    d[pathArray[i]] =
      typeof d[pathArray[i]] === "object" ? d[pathArray[i]] : {};
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
