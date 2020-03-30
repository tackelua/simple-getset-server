var test = require("tape");
var { get, set, data } = require("./");

test("simple gets", function(t) {
  var obj = {
    foo: "bar",
    bar: {
      baz: {
        beep: "boop",
      },
    },
  };
  set("/", obj);
  t.equal(get("/"), obj);
  console.log({ data: data() });

  t.equal(get("foo"), "bar");
  t.equal(get("bar/baz/beep"), "boop");
  t.equal(get("bar/baz/beep/yep/nope"), null);
  t.end();
});

test("deep deletes", function(t) {
  var obj = {
    foo: "bar",
    bar: {
      baz: {
        beep: "boop",
      },
    },
  };

  set("/", obj);
  console.log({ data: data() });

  t.equal(get("/"), obj);

  set("foo", null);
  t.equal(get("foo"), null);

  set("bar/baz", null);
  t.equal(get("bar/baz"), null);

  set("bar/baz/beep");
  t.equal(get("bar/baz/beep"), null);
  t.end();
});
