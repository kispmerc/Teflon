export const CONFIG = {
  ENTITY_CHECK_INTERVAL: 40,[

  MAX_ENTITIES: {
    "minecraft:zombie": 20,
    "minecraft:skeleton": 20,
    "minecraft:creeper": 15,
  },

  HEAVY_ENTITIES: {
    "minecraft:villager": 10,
    "minecraft:iron_golem": 4,
    "minecraft:wolf": 8,
    "minecraft:cat": 6,
    "minecraft:parrot": 4,
    "minecraft:bee": 10,
    "minecraft:fox": 6,
    "minecraft:allay": 4,
    "minecraft:ravager": 2,
    "minecraft:piglin_brute": 4,
    "minecraft:warden": 1,
  },

  PASSIVE_ENTITIES: {
    "minecraft:chicken": 40,
    "minecraft:cow": 30,
    "minecraft:pig": 30,
    "minecraft:sheep": 30,
    "minecraft:rabbit": 25,
    "minecraft:horse": 15,
    "minecraft:llama": 15,
    "minecraft:turtle": 15,
  },

  FAR_DESPAWN_RADIUS: 96,
  MANAGED_ENTITIES: [
    "minecraft:zombie",
    "minecraft:skeleton",
    "minecraft:creeper",
    "minecraft:spider",
  ],

  ITEM_ENTITY: {
    TYPE: "minecraft:item",
    MAX_PER_DIMENSION: 150,
    DESPAWN_RADIUS: 96,
  },

  MAX_PROJECTILES: 100,

  PROJECTILE_TYPES: [
    "minecraft:arrow",
    "minecraft:snowball",
    "minecraft:ender_pearl",
    "minecraft:egg",
    "minecraft:fireball",
    "minecraft:small_fireball",
    "minecraft:trident",
    "minecraft:splash_potion",
    "minecraft:lingering_potion",
    "minecraft:wither_skull",
    "minecraft:llama_spit",
    "minecraft:shulker_bullet",
  ],

  DIMENSION_SETTINGS: {
    overworld: { radiusMultiplier: 1.0, capMultiplier: 1.0 },
    nether: { radiusMultiplier: 0.75, capMultiplier: 0.7 },
    the_end: { radiusMultiplier: 0.6, capMultiplier: 0.5 },
  },

CYCLE_MULTIPLIERS: {
    projectiles: 2,
    items: 2,
  },
};
