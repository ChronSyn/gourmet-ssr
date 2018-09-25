"use strict";

const fs = require("fs");
const npath = require("path");
const test = require("tape");

test("Only module-b should be compiled as a source module for `local` stage", t => {
  const client = fs.readFileSync(npath.join(__dirname, "../.gourmet/local/client/main.js"), "utf8");
  const server = fs.readFileSync(npath.join(__dirname, "../.gourmet/local/server/main.js"), "utf8");

  // Default `builder.runtime.server` is set to `8` which is high enough
  // not to transform `class` syntax in `module-b`.
  t.ok(/module\.exports = class ModuleA \{\};/.test(client), "client 'module-a' must be intact");
  t.ok(/module\.exports = function ModuleB\(\) \{\s+_classCallCheck\(this, ModuleB\);\s+\};/.test(client), "client 'module-b' must be compiled");
  t.ok(/module\.exports = class ModuleA \{\};/.test(server), "server 'module-a' must be intact");
  t.ok(/module\.exports = class ModuleB \{\};/.test(server), "server 'module-b' must be intact");

  t.end();
});

test("Both module-a & module-b should be compiled as source modules for `test` stage", t => {
  const client = fs.readFileSync(npath.join(__dirname, "../.gourmet/test/client/main.js"), "utf8");
  const server = fs.readFileSync(npath.join(__dirname, "../.gourmet/test/server/main.js"), "utf8");

  t.ok(/module\.exports = function ModuleA\(\) \{\s+_classCallCheck\(this, ModuleA\);\s+\};/.test(client), "client 'module-a' must be compiled");
  t.ok(/module\.exports = function ModuleB\(\) \{\s+_classCallCheck\(this, ModuleB\);\s+\};/.test(client), "client 'module-b' must be compiled");
  t.ok(/module\.exports = function ModuleA\(\) \{\s+_classCallCheck\(this, ModuleA\);\s+\};/.test(server), "server 'module-a' must be compiled");
  t.ok(/module\.exports = function ModuleB\(\) \{\s+_classCallCheck\(this, ModuleB\);\s+\};/.test(server), "server 'module-b' must be compiled");

  t.end();
});
