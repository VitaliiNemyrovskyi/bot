# Multi-Agent Workflow: Crypto Arbitrage Trading Platform MVP

> A step-by-step workflow to coordinate multiple agents from current TypeScript MVP to production-ready platform with C++ low-latency execution core.

## The Scenario

You're building a full-stack automated crypto trading platform that identifies and executes funding rate arbitrage opportunities across multiple exchanges. The current MVP is a TypeScript monorepo (Next.js + Angular + PostgreSQL + Redis). The next phase is hardening execution, collecting settlement timing data, and transitioning the critical execution path to a C++ core with millisecond-precision settlement-window alignment.

**Timeline:** 8 weeks to production-hardened platform with C++ execution proof-of-concept.
**Constraints:** Solo/small team, 13 exchange connectors already built, real money at stake.

## Agent Team

| Agent | Role in this workflow |
|-------|---------------------|
| Sprint Prioritizer | Break the transition into phased sprints with clear deliverables |
| UX Researcher | Competitive analysis against Coinglass, FundingView, and emerging tools |
| Backend Architect | Design the C++/TypeScript boundary, IPC protocol, and state machine |
| Software Architect | System-level architecture for process separation and dual-runtime |
| Frontend Developer | Execution metrics dashboard and position management UI |
| Security Engineer | Audit encrypted credential storage, API key handling, and execution safety |
| Performance Benchmarker | Measure and validate latency improvements at each phase |
| Reality Checker | Gate each milestone before moving to the next phase |

## The Workflow

### Phase 1 (Weeks 1-2): Measure + Harden

**Step 1 — Activate Sprint Prioritizer**

```
Activate Sprint Prioritizer.

Project: A full-stack automated crypto trading platform that identifies and executes
arbitrage opportunities across multiple exchanges.

The core is being transitioned to C++ for deterministic, low-latency behavior.
Execution is aligned to funding-settlement windows measured in milliseconds.
Position state is tracked explicitly to avoid race conditions near settlement.

Current state: TypeScript MVP with 13 exchange connectors, funding/price/triangular
arbitrage strategies, WebSocket streams, encrypted API keys, billing via NOWPayments.

Timeline: 8 weeks to hardened execution + C++ proof-of-concept.
Constraints: Solo/small team, real capital at risk, no open-source.

Break this into phased sprints with clear deliverables and acceptance criteria.
```

**Step 2 — Activate UX Researcher (in parallel)**

```
Activate UX Researcher.

Project: A full-stack automated crypto trading platform focused on funding rate
arbitrage across multiple exchanges.

Competitors: fundingview.app, coinglass.com

Run a quick competitive analysis and identify:
1. What features are table stakes
2. Where competitors fall short
3. One differentiator we could own

Output a 1-page research brief.
```

**Step 3 — Activate Performance Benchmarker**

```
Activate Performance Benchmarker.

I need a latency benchmarking harness for a crypto arbitrage trading platform.
The system executes trades on multiple exchanges during funding settlement windows.

Measure and report:
1. End-to-end latency from trade decision to order acknowledgment (per exchange connector)
2. WebSocket message latency (subscription to callback) for Bybit, Binance, OKX, Gate.io
3. Time sync accuracy per exchange (exchange clock vs local clock offset)
4. Jitter distribution during the 30-second window around funding settlement
5. Database write latency for position state updates (Prisma through PostgreSQL)

Deliver a benchmarking harness that logs timestamped events for every step of
order execution. This data informs what the C++ core must prioritize.
```

**Step 4 — Hand off to Backend Architect**

```
Activate Backend Architect.

Here's our sprint plan: [paste Sprint Prioritizer output]
Here's our latency baseline: [paste Performance Benchmarker output]

The current system runs all execution services inside the Next.js runtime
(initialized in instrumentation.ts). This causes jitter from shared event loop
with HTTP handling, and hot reload can kill execution mid-trade.

Design:
1. Process separation — execution services as standalone Node.js process
2. IPC protocol between execution process and Next.js API layer
3. Position state machine with write-ahead logging and crash recovery
4. Exchange connector interface that both TypeScript and C++ can implement
5. Failure hierarchy: protect capital > log everything > alert operator > recover

Stack: Next.js 15, Prisma/PostgreSQL, Redis, future C++ core via IPC.
```

### Phase 2 (Weeks 3-4): Architecture + Data Collection

**Step 5 — Activate Software Architect**

```
Activate Software Architect.

Here's the backend architecture: [paste Backend Architect output]
Here's the latency data: [paste Performance Benchmarker output]

Design the C++/TypeScript boundary contract:
1. IPC mechanism: shared memory ring buffers (market data) + Unix domain sockets (commands)
2. Message format: FlatBuffers or Cap'n Proto (zero-copy, not protobuf)
3. What C++ owns: time sync, order submission, position state, settlement window detection,
   fill confirmation, slippage guard, safe abort
4. What TypeScript keeps: strategy selection, risk config, UI, analytics, billing, auth
5. Connector mode discriminator: 'typescript' | 'native' routing in the factory

Deliver a protocol specification with message types, state machine transitions,
and error codes. This is the contract both sides build against.
```

**Step 6 — Activate Security Engineer (in parallel)**

```
Activate Security Engineer.

Audit the security posture of a crypto trading platform that handles:
- Encrypted exchange API keys (AES-256 at rest)
- JWT authentication with Google OAuth
- Real money order execution across 13 exchanges
- IPC between TypeScript orchestrator and future C++ execution engine

Evaluate:
1. Credential storage and rotation — is AES-256 implementation correct?
2. API key exposure surface — who can read decrypted keys and when?
3. IPC security — can the C++/TS boundary be exploited?
4. Position state integrity — can a crash or race condition cause capital loss?
5. Rate limiting and abuse prevention on the API layer

Deliver a threat model and prioritized remediation list.
```

**Step 7 — Reality Check at midpoint**

```
Activate Reality Checker.

We're at week 4 of an 8-week hardening + C++ transition for a crypto arb platform.

Here's what we have so far:
- Latency benchmarks: [paste]
- Process separation architecture: [paste]
- IPC protocol spec: [paste]
- Security audit: [paste]
- Settlement timing data (2 weeks collected): [paste summary]

Evaluate:
1. Is the IPC protocol spec complete enough to start C++ implementation?
2. Is the position state machine crash-safe with real capital?
3. Do we have enough settlement timing data to calibrate the C++ core?
4. Any technical debt that will bite us during C++ integration?
5. What should we cut to stay on timeline?
```

### Phase 3 (Weeks 5-6): C++ Core + Execution Dashboard

**Step 8 — Activate Software Architect (C++ skeleton)**

```
Activate Software Architect.

Here's the IPC spec: [paste]
Here's the latency baseline from TypeScript: [paste]

Build the C++ core skeleton — Bybit only (cleanest API, primary exchange):
1. Connect to Bybit WebSocket, maintain local order book
2. Sync time with exchange, maintain continuous clock offset calibration
3. Submit a single market order, confirm fill
4. Report back via IPC (Unix domain socket)
5. CMake build system, vcpkg/conan for deps, Docker multi-stage build

The goal is to prove the toolchain and validate that latency measurably improves
over the TypeScript BybitConnector. Do NOT attempt multi-exchange or strategy logic yet.
```

**Step 9 — Activate Frontend Developer (in parallel)**

```
Activate Frontend Developer.

Here's the latency data we're collecting: [paste Performance Benchmarker output]
Here's the settlement timing data: [paste summary]

Build an execution metrics dashboard (Angular 18 + Angular Material):
1. Real-time latency display per exchange connector (TypeScript vs C++ when available)
2. Settlement timing visualization — predicted vs actual settlement, per exchange
3. Position state timeline — show state machine transitions with timestamps
4. Slippage tracking — expected vs actual execution price per trade
5. System health — WebSocket connection status, IPC status, process uptime

This dashboard is for the operator, not retail users. Prioritize data density
over aesthetics. Use lightweight-charts for time-series data.
```

### Phase 4 (Weeks 7-8): Validate + Production Readiness

**Step 10 — Activate Performance Benchmarker**

```
Activate Performance Benchmarker.

We now have both TypeScript and C++ (Bybit only) execution paths.

Run a comparative benchmark:
1. Order submission latency: TypeScript connector vs C++ connector (Bybit)
2. Settlement window capture rate: % of funding settlements successfully executed
3. Position state update latency: write-ahead log performance
4. IPC overhead: message round-trip time between TypeScript and C++ processes
5. Jitter comparison: standard deviation of execution times under load

Deliver a comparison report with statistical significance. The C++ core must
demonstrate measurable improvement to justify the complexity.
```

**Step 11 — Final Reality Check**

```
Activate Reality Checker.

The crypto arbitrage platform is ready for production deployment. Evaluate:

- Process separation: execution engine runs independently from API layer
- C++ core: Bybit connector operational with IPC to TypeScript orchestrator
- Position state machine: write-ahead logging, crash recovery tested
- Latency improvement: [paste benchmark comparison]
- Settlement data: [X weeks] of observed timing data collected
- Security audit: all critical items remediated
- Monitoring: execution metrics dashboard operational

Run through production readiness checklist. GO / NO-GO decision.
Require evidence for each criterion. Safe failure modes are non-negotiable.
```

## Key Patterns

1. **Sequential handoffs**: Each agent's output becomes the next agent's input — sprint plan informs architecture, architecture informs C++ implementation
2. **Parallel work**: UX Researcher + Performance Benchmarker in Phase 1; Security Engineer + Architecture in Phase 2; C++ core + Frontend dashboard in Phase 3
3. **Quality gates**: Reality Checker at midpoint (week 4) and before production (week 8) — real capital demands evidence-based GO/NO-GO
4. **Data-driven decisions**: Latency benchmarks before AND after C++ transition — never assume improvement, measure it
5. **Context passing**: Always paste previous agent outputs into the next prompt — agents don't share memory
6. **Capital safety first**: Every phase prioritizes safe failure modes over performance gains

## Tips

- Copy-paste agent outputs between steps — don't summarize, use the full output
- If a Reality Checker flags an issue, loop back to the relevant specialist to fix it
- Start settlement timing data collection in Phase 1 — it needs weeks of data before the C++ core can be calibrated
- Do NOT start writing C++ until the IPC protocol spec passes Reality Check
- The execution process must be independently restartable without affecting the API layer or open positions
- Keep the Agents Orchestrator in mind for automating this flow once you're comfortable with the manual version
