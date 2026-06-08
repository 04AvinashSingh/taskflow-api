# Scalability Guide — TaskFlow API

This document outlines the architectural evolution path for scaling TaskFlow from a single-server monolith to a distributed, production-grade system.

---

## 1. Horizontal Scaling with Load Balancers

The current Express.js monolith is stateless (JWT-based auth, no server-side sessions), making it inherently ready for horizontal scaling. Deploy multiple identical backend instances behind **NGINX** (self-managed) or **AWS Application Load Balancer** (managed). NGINX's `upstream` directive distributes traffic round-robin across instances. Health checks at `/health` let the load balancer automatically remove unhealthy nodes. Since JWTs are verified cryptographically without server state, any instance can handle any request — no sticky sessions required.

## 2. Redis Caching Layer

Frequent `GET /tasks` queries can be accelerated with **Redis** as a read-through cache. Cache task lists per user with keys like `tasks:userId:status` and a 60-second TTL. Invalidate on write operations (POST/PUT/DELETE) using targeted key deletion. For admin endpoints listing all users, cache with a short TTL (30s) keyed on `admin:users`. Redis also enables rate limiting across multiple backend instances using `express-rate-limit`'s Redis store, ensuring consistent limits regardless of which instance handles the request.

## 3. PostgreSQL Read Replicas

As read traffic grows, configure PostgreSQL **streaming replication** with one primary (writes) and one or more read replicas. At the Prisma level, use the `$extends` API or a custom middleware to route `findMany`/`findUnique` queries to replicas and mutations to the primary. AWS RDS and Cloud SQL offer managed read replicas with automatic failover. Connection pooling via **PgBouncer** (or Prisma's built-in connection pooling) prevents connection exhaustion under high concurrency.

## 4. Microservices Migration

Split the monolith into domain-bounded services: **auth-service** (registration, login, token issuance), **task-service** (CRUD operations), and **user-service** (admin user management). Each service owns its database schema and communicates via REST or an event bus (Redis Pub/Sub, NATS, or AWS SQS). API Gateway (NGINX, Kong, or AWS API Gateway) handles routing, authentication, and rate limiting at the edge. This separation enables independent scaling — task-service can scale to 10 instances during peak load while auth-service runs on 2.

## 5. Dockerization with Docker Compose

Containerize each service with multi-stage Dockerfiles (build stage with `npm ci`, production stage with `node:alpine`). A `docker-compose.yml` orchestrates the full stack locally: PostgreSQL, Redis, backend service(s), and the Vite-built frontend served by NGINX. Environment variables are injected via `.env` files. For production, migrate to **Kubernetes** (EKS/GKE) with Helm charts defining deployments, services, HPA (Horizontal Pod Autoscaler), and ingress rules.

## 6. CI/CD Pipeline with GitHub Actions

Automate the build-test-deploy cycle with GitHub Actions. On every pull request: lint (ESLint), run unit tests (Jest/Vitest), and validate Prisma migrations. On merge to `main`: build Docker images, push to a container registry (ECR/GCR), run integration tests against a ephemeral PostgreSQL instance, and deploy to staging via `kubectl apply` or `docker compose up`. Production deploys trigger on tagged releases with manual approval gates. Add Dependabot for dependency updates and CodeQL for security scanning.

---

**Summary**: TaskFlow's stateless architecture and relational schema provide a solid foundation for scaling. The progression — load balancer → Redis cache → read replicas → microservices → Kubernetes — follows industry-standard patterns and can be adopted incrementally as traffic demands grow.
