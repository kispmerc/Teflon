# Teflon

Teflon is a Minecraft Bedrock Edition Behavior Pack focused on reducing unnecessary entity activity and improving world performance.

The project is based on and extends the original Teflon project by [kispmerc](https://github.com/kispmerc/Teflon).

## Features

Teflon provides several mechanisms for reducing unnecessary entity workload:

* Entity count limits
* Distance-based entity cleanup
* Mob spawn optimization
* Dropped item cleanup
* Projectile cleanup
* Per-area entity limits
* Entity protection for named entities
* Configurable cleanup intervals and limits
* Adaptive optimization based on entity workload

The exact features and behavior may vary depending on the current version of the project.

## How It Works

Minecraft Bedrock worlds can accumulate large numbers of entities over time. Entities may require simulation, AI processing, movement updates, collision checks, and other game logic.

Teflon periodically checks entities and applies configured rules to prevent unnecessary accumulation.

The general process is:

```text
Entities
   |
   v
Entity monitoring
   |
   +-- Check entity type
   +-- Check distance
   +-- Check area limits
   +-- Check protection rules
   |
   v
Apply cleanup / optimization rules
```

Teflon primarily targets entity-related workload. It does not directly optimize Minecraft's rendering pipeline, GPU performance, or chunk rendering.

## Configuration

Optimization behavior can be adjusted through the project's configuration.

Depending on the version, configurable options may include:

* Maximum entity counts
* Cleanup distance
* Cleanup interval
* Mob limits
* Item lifetime
* Projectile limits
* Per-area limits
* Protected entity types

Configuration values should be adjusted according to the requirements of each world.

## Installation

1. Download or clone this repository.
2. Import the Behavior Pack into Minecraft Bedrock Edition.
3. Activate the pack in the desired world.
4. Configure the available options if required.
5. Start the world.

Make sure the pack version is compatible with your Minecraft Bedrock version.

## Compatibility

Teflon is intended for Minecraft Bedrock Edition.

Compatibility with other Behavior Packs may depend on whether they modify the same entities, components, spawn rules, or scripts.

## Open Source

This project is open source.

Teflon is based on the original project:

**Original project:** [kispmerc/Teflon](https://github.com/kispmerc/Teflon)

Credit is given to the original author, **kispmerc**, for the original Teflon project and its implementation.

This repository contains modifications and additional development based on that work.

Please refer to the original repository for the original project's license and attribution requirements.

## Credits

* Original Teflon project: [kispmerc/Teflon](https://github.com/kispmerc/Teflon)
* Original author: kispmerc
* Modified and maintained in this repository by the respective contributors

## License

This project follows the licensing requirements of the original Teflon project.

See the original repository and included license files for the applicable license terms.
