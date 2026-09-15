# Performance Optimizer BP

A Minecraft Bedrock Behavior Pack that reduces server load by managing mob entities and spawn density. It runs silently in the background with no logging, chat messages, or ui.

## What it does

**Entity limiting** — caps the number of zombies, skeletons, creepers, and spiders per dimension. When a mob type exceeds its configured limit, the entities farthest from any player are removed first.

**Distance-based despawn** — mobs that are farther than a configured radius from every online player are removed, preventing entity buildup in unloaded or abandoned areas.

**Spawn density reduction** — `spawn_rules` overrides for zombie, skeleton, and creeper lower their weight, herd size, and surface density compared to vanilla, so fewer of them spawn in the first place.

Entities with a name tag are never touched, so tamed or player-named mobs are safe.

## How it works

- `manifest.json` — pack metadata, declares the `data` and `script` modules and the `@minecraft/server` dependency.
- `scripts/main.js` — entry point. Registers the entity management task on world load.
- `scripts/modules/config.js` — all tunable values (check interval, per-type entity caps, despawn radius, managed entity list).
- `scripts/modules/tickThrottle.js` — thin wrapper around `system.runInterval` with error isolation, so one failing task can't stop others.
- `scripts/modules/entityManager.js` — core logic- scans each dimension, despawns far mobs, then trims any type still over its cap.
- `spawn_rules/*.json` — vanilla spawn rule overrides for zombie, skeleton, and creeper.

## Configuration :))

Edit `scripts/modules/config.js`:

```js
ENTITY_CHECK_INTERVAL   // how often (in ticks) the check runs, 20 ticks = 1s
MAX_ENTITIES            // per type cap, per dimension
FAR_DESPAWN_RADIUS      // distance (blocks) from all players beyond which mobs despawn
MANAGED_ENTITIES        // which entity types this pack manages
```

## Installation

that easy, i think u already know

## Requirements

- Minecraft Bedrock 1.21.1+++
- `@minecraft/server` API version 1.14.0

## Limitations

This is a scripting-layer add-on, not a native engine mod. It cannot change core rendering, chunk generation, or lighting performance - only what the Scripting API and spawn rules expose.
