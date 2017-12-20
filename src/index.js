'use strict';

const app = require('./app');
const server = app.server;

(function start() {
  server.start().catch(error => console.error(error));
})();

