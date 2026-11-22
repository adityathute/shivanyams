# Architecture documentation

This directory is the architecture documentation entry point for ShivanyaMS.

## Start here

- [Complete system architecture](./system-architecture.md) — system overview, repository ownership, frontend/backend layers, request flows, data/security boundaries, dependency model, risks and implementation sequence.
- [Platform architecture and design principles](./platform-architecture.md) — target architecture, modular monolith boundaries and engineering rules.

## Current-state inventories

- [Frontend route and layout map](./frontend-route-map.md)
- [Backend API and data map](./backend-api-map.md)
- [Cross-repository integration map](./cross-repository-integration-map.md)
- [Dependency and lockfile audit](./dependency-audit.md)

## Configuration

- [Environment variable reference](../configuration/environment-variables.md)

## Reading guidance

The inventories describe what was observed in the repositories at the time of their audit. The platform architecture and complete system architecture also describe intended target boundaries. A target design must not be mistaken for an already implemented feature. Consult the focused API, dependency and configuration inventories before changing contracts or versions.

All implementation work follows the active 143-step plan and must preserve existing behavior unless a step explicitly authorizes a change.
