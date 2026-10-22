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
  for (const player of players) {
    const distance = distanceSq(entityLoc, player.location);
    if (distance < min) min = distance;
  }
  return Math.sqrt(min);
}

function isProtected(entity) {
  return Boolean(entity.nameTag && entity.nameTag.length > 0) || entity.hasTag("teflon:protected");
}

function getDimensionSettings(dimensionId) {
  return CONFIG.DIMENSION_SETTINGS[dimensionId] ?? { radiusMultiplier: 1, capMultiplier: 1 };
}

function getDimensionPlayers(players, dimensionId) {
  return players.filter((player) => player.dimension.id === `minecraft:${dimensionId}`);
}

function* trimEntityType(dimension, entityType, maxCap, despawnRadius, players) {
  let entities;
  try {
    entities = dimension.getEntities({ type: entityType });
  } catch {
    return;
  }

  const survivors = [];
  for (const entity of entities) {
    if (!entity.isValid()) continue;
    if (isProtected(entity)) {
      survivors.push({ entity, distance: 0 });
    } else {
      const distance = distanceToNearestPlayer(entity.location, players);
      if (distance > despawnRadius) entity.remove();
      else survivors.push({ entity, distance });
    }
    yield;
  }

  if (maxCap !== undefined && survivors.length > maxCap) {
    const removable = survivors
      .filter((item) => !isProtected(item.entity))
      .map((item) => ({
        entity: item.entity,
        distance: item.distance ?? distanceToNearestPlayer(item.entity.location, players),
      }))
      .sort((a, b) => b.distance - a.distance);

    const excess = survivors.length - maxCap;
    for (let i = 0; i < excess && i < removable.length; i++) {
      if (removable[i].entity.isValid()) removable[i].entity.remove();
      yield;
    }
  }
}

function* runItemControl(players, dimensionIds) {
  for (const dimensionId of dimensionIds) {
    const dimension = world.getDimension(dimensionId);
    const dimensionPlayers = getDimensionPlayers(players, dimensionId);
    let items;
    try {
      items = dimension.getEntities({ type: CONFIG.ITEM_ENTITY.TYPE });
    } catch {
      yield;
      continue;
    }

    const settings = getDimensionSettings(dimensionId);
    const radius = CONFIG.ITEM_ENTITY.DESPAWN_RADIUS * settings.radiusMultiplier;
    const cap = Math.max(1, Math.round(CONFIG.ITEM_ENTITY.MAX_PER_DIMENSION * settings.capMultiplier));
    const survivors = [];

    for (const item of items) {
      if (item.isValid()) {
        const distance = distanceToNearestPlayer(item.location, dimensionPlayers);
        if (distance > radius) item.remove();
        else survivors.push({ entity: item, distance });
      }
      yield;
    }

    survivors.sort((a, b) => b.distance - a.distance);
    const excess = Math.max(0, survivors.length - cap);
    for (let i = 0; i < excess; i++) {
      if (survivors[i].entity.isValid()) survivors[i].entity.remove();
      yield;
    }
    yield;
  }
}

function* runProjectileControl(players, dimensionIds) {
  for (const dimensionId of dimensionIds) {
    const dimension = world.getDimension(dimensionId);
    const dimensionPlayers = getDimensionPlayers(players, dimensionId);
    const projectiles = [];

    for (const type of CONFIG.PROJECTILE_TYPES) {
      let entities;
      try {
        entities = dimension.getEntities({ type });
      } catch {
        continue;
      }
      for (const entity of entities) {
        if (entity.isValid()) {
          projectiles.push({ entity, distance: distanceToNearestPlayer(entity.location, dimensionPlayers) });
        }
      }
      yield;
    }

    projectiles.sort((a, b) => b.distance - a.distance);
    const excess = Math.max(0, projectiles.length - CONFIG.MAX_PROJECTILES);
    for (let i = 0; i < excess; i++) {
      if (projectiles[i].entity.isValid()) projectiles[i].entity.remove();
      if (i % 20 === 19) yield;
    }
    yield;
  }
}

export function* runEntityManagement() {
  const players = world.getPlayers();
  if (players.length === 0) return;

  cycleCount++;
  const dimensionIds = ["overworld", "nether", "the_end"];
  const allTypes = [...new Set([
    ...CONFIG.MANAGED_ENTITIES,
    ...Object.keys(CONFIG.HEAVY_ENTITIES),
    ...Object.keys(CONFIG.PASSIVE_ENTITIES),
  ])];
  const allCaps = { ...CONFIG.MAX_ENTITIES, ...CONFIG.HEAVY_ENTITIES, ...CONFIG.PASSIVE_ENTITIES };

  for (const dimensionId of dimensionIds) {
    const dimension = world.getDimension(dimensionId);
    const dimensionPlayers = getDimensionPlayers(players, dimensionId);
    const settings = getDimensionSettings(dimensionId);
    const radius = CONFIG.FAR_DESPAWN_RADIUS * settings.radiusMultiplier;

    for (const entityType of allTypes) {
      const baseCap = allCaps[entityType];
      const cap = baseCap === undefined ? undefined : Math.max(1, Math.round(baseCap * settings.capMultiplier));
      yield* trimEntityType(dimension, entityType, cap, radius, dimensionPlayers);
      yield;
    }
  }

  if (cycleCount % CONFIG.CYCLE_MULTIPLIERS.projectiles === 0) {
    yield* runProjectileControl(players, dimensionIds);
  }
  if (cycleCount % CONFIG.CYCLE_MULTIPLIERS.items === 0) {
    yield* runItemControl(players, dimensionIds);
  }
}
