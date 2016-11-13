[![Build Status](https://travis-ci.org/sladiri/sam-tests.svg?branch=master)](https://travis-ci.org/sladiri/sam-tests)

## Purpose
Some tests, messing with SAM pattern and syntax.

### Components
According to SAM there are Model, State, State-Representation and Actions. Any of these may be either on the client or the server. They are isomorphic in relation to the host. RabbitMQ relays messages between the components.

## NPM Scripts
The start scripts run a development-webserver (with mock routes).
- `npm start` runs State and Model on the server. The State-Representation runs in the browser.
- `npm start:dev:all` as `start` but also has live reload and watchers for source and tests.
- `npm start:dev` as `start:dev:al` but runs all components inside the browser for easy debugging.
- `test` runs tests both in node and in a headless browser

### Browser Tests
The test-runner used does not support babel-register, so it loads the tests individually.
