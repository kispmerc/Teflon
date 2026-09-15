import { world } from "@minecraft/server";
import { CONFIG } from "./config.js";

function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function distanceToNearestPlayer(entityLoc, players) {
  let min = Infinity;
  for (const p of players) {
    const d = distanceSq(entityLoc, p.location);
    if (d < min) min = d;
  }
  return Math.sqrt(min);
}

function isProtected(entity) {
  return !entity.isValid() || (entity.nameTag && entity.nameTag.length > 0);
}

export function runEntityManagement() {
  const players = world.getPlayers();
  if (players.length === 0) return;

  for (const dimensionId of ["overworld", "nether", "the_end"]) {
    const dimension = world.getDimension(dimensionId);

    for (const entityType of CONFIG.MANAGED_ENTITIES) {
      let entities;
      try {
        entities = dimension.getEntities({ type: entityType });
      } catch (err) {
        continue;
      }
      if (entities.length === 0) continue;

      const survivors = [];
      for (const entity of entities) {
        if (isProtected(entity)) {
          survivors.push(entity);
          continue;
        }
        const dist = distanceToNearestPlayer(entity.location, players);
        if (dist > CONFIG.FAR_DESPAWN_RADIUS) {
          entity.remove();
        } else {
          survivors.push(entity);
        }
      }

      const max = CONFIG.MAX_ENTITIES[entityType];
      if (max !== undefined && survivors.length > max) {
        const sorted = survivors
          .filter((e) => !isProtected(e))
          .map((e) => ({
            entity: e,
            dist: distanceToNearestPlayer(e.location, players),
          }))
          .sort((a, b) => b.dist - a.dist);

        const excess = survivors.length - max;
        for (let i = 0; i < excess && i < sorted.length; i++) {
          sorted[i].entity.remove();
        }
      }
    }
  }
}
