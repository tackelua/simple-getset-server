let _Data = {};

function get(path) {
  let pathArray = path.split("/").filter(p => p != "");
  let d = _Data;
  try {
    for (const i of pathArray) {
      d = d[i];
    }
    d = d ? d : null;
  } catch (e) {
    d = null;
  }

  return d;
}

function set(path, value) {
  let pathArray = path.split("/").filter(p => p != "");
  if (pathArray.length === 1 && _Data === "null") {
    _Data = {};
  }

  let d = _Data;
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
    _Data = value;
  }

  return d;
}

module.exports = { get, set, data: () => _Data };
