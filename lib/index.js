/*
 * express-mfs
 *
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */

"use strict";

var mfs = {};

mfs.metrics        = require("./metrics");
mfs.info           = require("./info");
mfs.ping           = require("./ping");
mfs.unknown        = require("./unknown");
mfs.json           = require("./json");
mfs.error          = require("./error");
mfs.auth           = require("./auth");
mfs.schema         = require("./schema");

module.exports = mfs;