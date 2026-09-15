import { world } from "@minecraft/server";
import { CONFIG } from "./modules/config.js";
import { registerThrottledTask } from "./modules/tickThrottle.js";
import { runEntityManagement } from "./modules/entityManager.js";

world.afterEvents.worldInitialize.subscribe(() => {
  registerThrottledTask(
    "entityManagement",
    runEntityManagement,
    CONFIG.ENTITY_CHECK_INTERVAL
  );
});
