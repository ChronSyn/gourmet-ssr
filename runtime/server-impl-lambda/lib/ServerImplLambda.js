"use strict";

const parseArgs = require("@gourmet/parse-args");
const ServerImplBase = require("@gourmet/server-impl-base");
const express = require("express");

class ServerImplLambda extends ServerImplBase {
  constructor(args) {
    super(args, express);
    this.functionName = parseArgs.string([this.argv.functionName, this.args.functionName], parseArgs.undef);
    this.qualifier = parseArgs.string([this.argv.qualifier, this.args.qualifier], parseArgs.undef);
  }

  createClient() {
    const argv = this.argv;
    this.gourmet = require("@gourmet/client-lambda")({
      functionName: this.functionName,
      qualifier: this.qualifier,
      entrypoint: parseArgs.string(argv.entrypoint, "main"),
      siloed: parseArgs.bool(argv.siloed),
      params: argv.params || {}
    });
  }
}

module.exports = ServerImplLambda;