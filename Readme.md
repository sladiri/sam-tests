[![Build Status](https://travis-ci.org/sladiri/sam-tests.svg?branch=master)](https://travis-ci.org/sladiri/sam-tests)

## Purpose
- Implement a prototype for a collaborative web application.
- Implement "Shim" layer to an eventually consistent database according to the Bolt-on protocol.
- Try out SAM pattern and decouple components via message queues.
- Experiment with ES7 syntax.

### Components
According to SAM there are Model, State, State-Representation and Actions. All of these may be either on the client or on the server,
they are isomorphic relative to the host. Currently, RabbitMQ relays messages between all components directly. A more realistic
approach would be an HTTP-interface between browser and server.

## NPM Scripts
The start scripts start a development-webserver (with mock routes) at `http://localhost:8000`.

### RabbitMQ setup
- `npm run rabbit` sets up user and queue.

### Regular start
1. `npm run build`
2. `npm start` starts State and Model on the server. The State-Representation loads in the browser.

### Development start
- `npm start:dev` runs all components inside the browser for easy debugging.

### Test
- `npm test` runs tests both in node and in a headless browser. The test-runner for browser tests used does not support babel-register, so it loads the tests individually.
