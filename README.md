# <img src="https://github.com/Luligu/matterbridge/blob/main/frontend/public/matterbridge%2064x64.png" alt="Matterbridge Logo" width="64px" height="64px">&nbsp;&nbsp;&nbsp;Matterbridge cat flap/door with history

[![npm version](https://img.shields.io/npm/v/matterbridge-eve-door.svg)](https://www.npmjs.com/package/matterbridge-eve-door)
[![npm downloads](https://img.shields.io/npm/dt/matterbridge-eve-door.svg)](https://www.npmjs.com/package/matterbridge-eve-door)
[![Docker Version](https://img.shields.io/docker/v/luligu/matterbridge?label=docker%20version&sort=semver)](https://hub.docker.com/r/luligu/matterbridge)
[![Docker Pulls](https://img.shields.io/docker/pulls/luligu/matterbridge.svg)](https://hub.docker.com/r/luligu/matterbridge)
![Node.js CI](https://github.com/Luligu/matterbridge-eve-door/actions/workflows/build-matterbridge-plugin.yml/badge.svg)

[![power by](https://img.shields.io/badge/powered%20by-matterbridge-blue)](https://www.npmjs.com/package/matterbridge)
[![power by](https://img.shields.io/badge/powered%20by-matter--history-blue)](https://www.npmjs.com/package/matter-history)
[![power by](https://img.shields.io/badge/powered%20by-node--ansi--logger-blue)](https://www.npmjs.com/package/node-ansi-logger)
[![power by](https://img.shields.io/badge/powered%20by-node--persist--manager-blue)](https://www.npmjs.com/package/node-persist-manager)

---

This plugin is a fork of https://github.com/Luligu/matterbridge-eve-door to monitor a MQTT topic and report the
status as a matter contact sensor.

It creates a virtual contact sensor device that subscribes to catflap/lockstatus and reflects the corresponding message.

## Prerequisites

### Matterbridge

See the guidelines on [Matterbridge](https://github.com/Luligu/matterbridge/blob/main/README.md) for more information.
