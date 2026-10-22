import { system, world } from "@minecraft/server";
import { CONFIG } from "./modules/config.js";
import { registerThrottledTask } from "./modules/tickThrottle.js";
import { runEntityManagement } from "./modules/entityManager.js";

world.afterEvents.worldInitialize.subscribe(() => {
  registerThrottledTask(
    "entityManagement",
    () => {
      if (entityManagementRunning) return;
      entityManagementRunning = true;
      try {
        system.runJob(manageEntities());
      } catch (error) {
        entityManagementRunning = false;
        throw error;
      }
    },
    CONFIG.ENTITY_CHECK_INTERVAL
  );
});

let entityManagementRunning = false;

function* manageEntities() {
  try {
    yield* runEntityManagement();
  } finally {
    entityManagementRunning = false;
  }
}
