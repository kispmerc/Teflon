import { world } from "@minecraft/server";
import { CONFIG } from "./config.js";

let cycleCount = 0;

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
  return Boolean(entity.nameTag && entity.nameTag.length > 0);
}

function getDimensionSettings(dimensionId) {
  return CONFIG.DIMENSION_SETTINGS[dimensionId] ?? { radiusMultiplier: 1, capMultiplier: 1 };
}

function trimEntityType(dimension, entityType, maxCap, despawnRadius, players) {
  let entities;
  try {
    entities = dimension.getEntities({ type: entityType });
  } catch (err) {
    return;
  }
  if (entities.length === 0) return;

  const survivors = [];
  for (const entity of entities) {
    if (!entity.isValid()) continue;

    if (isProtected(entity)) {
      survivors.push(entity);
      continue;
    }
    const dist = distanceToNearestPlayer(entity.location, players);
    if (dist > despawnRadius) {
      entity.remove();
    } else {
      survivors.push(entity);
    }
  }

  if (maxCap !== undefined && survivors.length > maxCap) {
    const sorted = survivors
      .filter((e) => !isProtected(e))
      .map((e) => ({
        entity: e,
        dist: distanceToNearestPlayer(e.location, players),
      }))
      .sort((a, b) => b.dist - a.dist);

    const excess = survivors.length - maxCap;
    for (let i = 0; i < excess && i < sorted.length; i++) {
      sorted[i].entity.remove();
    }
  }
}

function* runItemControl(players, dimensionIds) {
  for (const dimensionId of dimensionIds) {
    const dimension = world.getDimension(dimensionId);
    let items;
    try {
      items = dimension.getEntities({ type: CONFIG.ITEM_ENTITY.TYPE });
    } catch (err) {
      yield;
      continue;
    }

    if (items.length === 0) {
      yield;
      continue;
    }

    const settings = getDimensionSettings(dimensionId);
    const radius = CONFIG.ITEM_ENTITY.DESPAWN_RADIUS * settings.radiusMultiplier;
    const cap = Math.max(1, Math.round(CONFIG.ITEM_ENTITY.MAX_PER_DIMENSION * settings.capMultiplier));

    const survivors = [];
    for (const item of items) {
      if (!item.isValid()) continue;
      const dist = distanceToNearestPlayer(item.location, players);
      if (dist > radius) {
        item.remove();
      } else {
        survivors.push({ entity: item, dist });
      }
    }

    if (survivors.length > cap) {
      survivors.sort((a, b) => b.dist - a.dist);
      const excess = survivors.length - cap;
      for (let i = 0; i < excess; i++) {
        survivors[i].entity.remove();
      }
    }

    yield;
  }
}

function* runProjectileControl(players, dimensionIds) {
  const all = [];
  for (const dimensionId of dimensionIds) {
    const dimension = world.getDimension(dimensionId);
    for (const type of CONFIG.PROJECTILE_TYPES) {
      let entities;
      try {
        entities = dimension.getEntities({ type });
      } catch (err) {
        continue;
      }
      for (const e of entities) all.push(e);
    }
    yield;
  }

  if (all.length <= CONFIG.MAX_PROJECTILES) return;

  const sorted = all
    .filter((e) => e.isValid())
    .map((e) => ({
      entity: e,
      dist: distanceToNearestPlayer(e.location, players),
    }))
    .sort((a, b) => b.dist - a.dist);

  const excess = all.length - CONFIG.MAX_PROJECTILES;
  for (let i = 0; i < excess && i < sorted.length; i++) {
    sorted[i].entity.remove();
    if (i % 20 === 19) yield;
  }
}

export function* runEntityManagement() {
  const players = world.getPlayers();
  if (players.length === 0) return;

  cycleCount++;

  const dimensionIds = ["overworld", "nether", "the_end"];
  const allTypes = [
    ...new Set([
      ...CONFIG.MANAGED_ENTITIES,
      ...Object.keys(CONFIG.HEAVY_ENTITIES),
      ...Object.keys(CONFIG.PASSIVE_ENTITIES),
    ]),
  ];
  const allCaps = {
    ...CONFIG.MAX_ENTITIES,
    ...CONFIG.HEAVY_ENTITIES,
    ...CONFIG.PASSIVE_ENTITIES,
  };

  for (const dimensionId of dimensionIds) {
    const dimension = world.getDimension(dimensionId);
    const settings = getDimensionSettings(dimensionId);
    const radius = CONFIG.FAR_DESPAWN_RADIUS * settings.radiusMultiplier;

    for (const entityType of allTypes) {
      const baseCap = allCaps[entityType];
      const cap =
        baseCap !== undefined
          ? Math.max(1, Math.round(baseCap * settings.capMultiplier))
          : undefined;
      trimEntityType(dimension, entityType, cap, radius, players);
      yield; // one yield per (dimension, entityType) pair - this is the bulk of the work
    }
  }

  if (cycleCount % CONFIG.CYCLE_MULTIPLIERS.projectiles === 0) {
    yield* runProjectileControl(players, dimensionIds);
  }

  if (cycleCount % CONFIG.CYCLE_MULTIPLIERS.items === 0) {
    yield* runItemControl(players, dimensionIds);
  }
}
