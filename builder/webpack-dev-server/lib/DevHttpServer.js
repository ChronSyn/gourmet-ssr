"use strict";

const GourmetHttpServer = require("@gourmet/http-server");

class DevHttpServer extends GourmetHttpServer {
  installWatcher() {
    const watch = require("@gourmet/watch-middleware")({
      watch: this.options.watch,
      argv: this.options.argv
    }, this.gourmet);
    this.app.use(watch);
  }

  installInitialMiddleware() {
    this.installLogger();
    this.installWatcher();
  }
}

module.exports = DevHttpServer;