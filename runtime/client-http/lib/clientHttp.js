"use strict";

const http = require("http");
const https = require("https");
const getRops = require("@gourmet/get-rops");
const httpModule = require("@gourmet/http-module");
const merge = require("@gourmet/merge");
const omit = require("@gourmet/omit");
const getReqArgs = require("@gourmet/get-req-args");
const ProxyHeaders = require("@gourmet/proxy-headers");
const sendContent = require("@gourmet/send-content");
const webProxy = require("@gourmet/web-proxy");

const _defaultAgent = {
  http: new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30 * 1000,
    maxSockets: 256,
    maxFreeSockets: 128
  }),
  https: new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30 * 1000,
    maxSockets: 256,
    maxFreeSockets: 128
  })
};

function clientHttp(baseArgs) {
  function _extractUrl(args) {
    args = merge.intact(baseArgs, args);
    const {
      serverUrl={
        protocol: "http:",
        hostname: "localhost",
        port: 3939,
        path: "/"
      }
    } = args;
    args = omit(args, ["serverUrl"]);

    const rops = getRops(serverUrl);
    const httpm = httpModule(rops);

    if (!rops.agent)
      rops.agent = httpm === https ? _defaultAgent.https : _defaultAgent.http;

    return {args, rops, httpm};
  }

  function invoke(args_, callback) {
    function _encodeArgs() {
      const content = JSON.stringify(args);
      return Buffer.from(content).toString("base64");
    }

    function _done(err, result) {
      if (!finished) {
        finished = true;
        callback(err, result);
      }
    }

    let finished = false;
    const {args, rops, httpm} = _extractUrl(args_);

    if (!rops.headers)
      rops.headers = {};
    rops.headers["x-gourmet-args"] = _encodeArgs();

    const clientReq = httpm.request(rops, clientRes => {
      const result = {
        statusCode: clientRes.statusCode,
        headers: new ProxyHeaders(clientRes).getHeadersCase(),
        content: clientRes
      };
      _done(null, result);
    });

    clientReq.on("error", _done);

    clientReq.end();
  }

  function render(req, res, next, args) {
    args = Object.assign(getReqArgs(req), args);
    invoke(args, (err, result) => {
      if (err) {
        next(err);
      } else {
        sendContent(res, result, err => {
          if (err)
            next(err);
        });
      }
    });
  }

  function renderer(args) {
    return function(req, res, next) {
      render(req, res, next, args);
    };
  }

  function staticServer(args) {
    const {rops} = _extractUrl(args);
    return (req, res, next) => {
      rops.path = req.originalUrl || req.url;
      webProxy(req, res, rops, {
        handleError: next
      });
    };
  }

  function context(args) {
    return clientHttp(args);
  }

  context.invoke = invoke;
  context.render = render;
  context.renderer = renderer;
  context.static = staticServer;

  return context;
}

module.exports = clientHttp();
