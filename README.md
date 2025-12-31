# ⚡ Syzygium

**Syzygium** is the foundational Internal Developer Platform (IDP) and monolithic repository for our engineering infrastructure. It implements a strict, schema-first architecture designed to unify disparate technology stacks (Go, Python, TypeScript) into a cohesive, high-performance computing environment.

The platform derives its name from the Greek *syzygos* (joined/yoked), symbolizing the seamless integration of frontend interfaces, backend microservices, and infrastructure orchestration.

## Architecture & Stack

Syzygium is engineered for correctness, speed, and long-term maintainability. It leverages a modern toolchain to ensure hermetic builds and strict type contracts.

| Layer                    | Technology                                             | Rationale                                                                                                                     |
| :----------------------- | :----------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Build System**         | **[Moon](https://moonrepo.dev)**                       | Rust-based build orchestration with intelligent caching, hashing, and integrated toolchain management.                        |
| **Interface Definition** | **[Protobuf](https://protobuf.dev)**                   | The Single Source of Truth for all data structures and service interfaces.                                                    |
| **Schema Management**    | **[Buf](https://buf.build)**                           | Breaking change detection, linting, and automated code generation.                                                            |
| **Transport Layer**      | **[ConnectRPC](https://connectrpc.com)**               | Dual-protocol support (gRPC + HTTP/JSON) allowing native browser clients and high-performance server-to-server communication. |
| **Gateway**              | **[GraphQL Mesh](https://the-guild.dev/graphql/mesh)** | Automated federation of gRPC services into a unified GraphQL API for the frontend.                                            |
| **Frontend**             | **React / Vite**                                       | Type-safe UI development using TanStack Query and generated Protobuf clients.                                                 |

## Monorepo Topology

The repository follows a strict separation of concerns between domain logic (`apps`) and shared contracts (`libs`).

```text
syzygium/
├── .moon/               # Toolchain configuration (Node, Go, Python versions pinned)
├── apps/                # Deployable artifacts
│   ├── platform-console/  # (React) Unified dashboard for IDP management
│   ├── orchestrator-svc/  # (Go) Infrastructure deployment and DNS management
│   ├── flag-svc/          # (Go) Low-latency feature flag evaluation engine
│   └── gateway/           # (Node) Edge gateway and protocol translation
├── libs/
│   ├── protos/          # Shared Interface Description Language (IDL) definitions
│   ├── gen/             # Auto-generated artifacts (Go structs, TS interfaces)
│   ├── ui-kit/          # Shared React component library
│   └── infra/           # Shared Infrastructure-as-Code (Terraform/Docker)
└── tools/               # Internal CLI scripts and platform utilities
```

## Engineering Standards

To maintain system integrity at scale, Syzygium enforces the following architectural invariants:

### 1. The Single Version Policy

All projects within the monorepo must utilize the exact language versions defined in `.moon/toolchain.yml`. This ensures deterministic builds across local environments and CI pipelines.

### 2. Schema-Driven Development

No API code is written manually. All service communication is defined in `.proto` files first. Client SDKs and Server stubs are machine-generated via `buf generate`.

### 3. Hermetic Inputs/Outputs

All build tasks must explicitly declare inputs (source files) and outputs (artifacts). This allows the build system to cache results aggressively. If the inputs do not change, the code is not rebuilt.

## Getting Started

Syzygium utilizes `moon` to bootstrap the development environment. Pre-requisites such as Go, Node.js, and Python are managed automatically.

### Initialization

```bash
# 1. Install the Moon binary
curl -fsSL https://moonrepo.dev/install/moon.sh | bash

# 2. Hydrate the toolchain and dependencies
moon setup
```

### Development Workflow

```bash
# Start the unified infrastructure stack (Postgres, Redis)
moon run infra:up

# Generate code from Protocol Buffers
moon run protos:generate

# Run the Platform Console and Backend Services locally
moon run :serve
```
