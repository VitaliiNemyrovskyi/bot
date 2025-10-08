# Agent Instructions

**Version**: 1.0.0
**Last Updated**: 2025-10-01

## Purpose

This file contains custom instructions, guidelines, and context that ALL specialized agents should follow when working on this project. These instructions augment the base agent capabilities and ensure consistency across all agent interactions.

## How This File Is Used

- All agents (chief-architect, angular-architect, ui-component-master, nextjs-api-architect, crypto-exchange-integrator, trading-backtest-engine, project-scribe, qa-testing-specialist) read these instructions before performing any task
- Instructions here override general best practices when there's a conflict
- Agents prioritize project-specific conventions defined here over common industry standards
- This file should be updated whenever new patterns or conventions are established

## When to Update This File

- When you establish a new coding pattern or convention
- After making architectural decisions that should be followed consistently
- When you discover anti-patterns or approaches to avoid
- When integrating new libraries or tools with specific usage guidelines
- After code reviews that reveal needed standards

---

## Table of Contents

1. [General Project Guidelines](#general-project-guidelines)
2. [Agent-Specific Instructions](#agent-specific-instructions)
3. [Technology-Specific Rules](#technology-specific-rules)
4. [Common Patterns and Anti-Patterns](#common-patterns-and-anti-patterns)
5. [Code Quality Standards](#code-quality-standards)
6. [Testing Requirements](#testing-requirements)
7. [Documentation Expectations](#documentation-expectations)
8. [References](#references)

---

## General Project Guidelines

### Project Overview

<!-- Add your project description here -->
**Example:**
```
This is a cryptocurrency trading bot platform with:
- Angular frontend for user interface
- Next.js API backend for server-side logic
- Integration with multiple crypto exchanges
- Real-time trading and backtesting capabilities
```

### Architecture Principles

<!-- Add your architectural principles here -->
**Example:**
```
- Maintain clear separation between frontend and backend
- Use reactive patterns (RxJS) for data streams
- Implement proper error boundaries and fallback mechanisms
- Design for testability and modularity
- Follow microservices-like structure where appropriate
```

### Coding Philosophy

<!-- Add your coding philosophy here -->
**Example:**
```
- Code should be self-documenting, but complex logic requires comments
- Prefer composition over inheritance
- Write code for readability first, optimization second
- Use TypeScript's type system fully - avoid 'any' types
- Fail fast and provide clear error messages
```

---

## Agent-Specific Instructions

### Chief Architect (System Design & Integration)

<!-- Add custom instructions for the chief-architect agent -->
**Responsibilities:**
- System-wide architecture decisions
- Cross-cutting concerns
- Integration patterns

**Custom Instructions:**
```
- Always check data synchronization between frontend and backend
- Ensure security best practices are followed across services
- Validate that all services adhere to defined API contracts
- Monitor performance implications of architectural choices

Examples:
- Always consider scalability to 100,000+ concurrent users
- Ensure all services can be deployed independently
- Document all cross-service communication patterns
- Consider security implications in all architectural decisions
```

### Angular Architect (Frontend Architecture)


- Always use separate files for HTML template and styles in Angular components
- Prioritize readability and maintainability over cleverness
- After changes always ask QA Testing Specialist agent to create or update tests
- After changes always ask Project Scribe agent to update documentation
- All requests if user has logged in should include JWT token in Authorization header as Bearer token
  
  **Responsibilities:**
- Angular application structure
- State management patterns
- Frontend architecture

**Custom Instructions:**
```
[Add your instructions here]

Examples:
- Use standalone components by default
- Implement lazy loading for all feature modules
- Use signals for reactive state management
- Follow Angular style guide strictly
```

### UI Component Master (Component Development)

**Responsibilities:**
- Component creation and styling
- UI/UX implementation
- Accessibility compliance

**Custom Instructions:**
```
- Always use separate files for HTML template and styles in Angular components
- Prioritize readability and maintainability over cleverness
- After changes always ask QA Testing Specialist agent to create or update tests
- After changes always ask Project Scribe agent to update documentation
- All requests if user has logged in should include JWT token in Authorization header as Bearer token
- Use TDD approach for all components and features
- Support both light and dark themes
- Implement responsive design for mobile-first approach


### Next.js API Architect (Backend API)

<!-- Add custom instructions for the nextjs-api-architect agent -->
**Responsibilities:**
- API route structure
- Backend business logic
- Database interactions

**Custom Instructions:**
```
- Follow REST principles for API design
- Use TDD approach for all endpoints and features
- Implement proper logging for all API requests and errors
- Ensure all endpoints are secured and validate JWT tokens
- Use environment variables for all configuration settings

Examples:
- Use API route handlers with proper HTTP status codes
- Implement rate limiting on all public endpoints
- Use Zod for request/response validation

```

### Crypto Exchange Integrator (Exchange APIs)

<!-- Add custom instructions for the crypto-exchange-integrator agent -->
**Responsibilities:**
- Exchange API integration
- Trading functionality
- Market data handling

**Custom Instructions:**
```
[Add your instructions here]

Examples:
- Always implement retry logic with exponential backoff
- Handle rate limits gracefully for each exchange
- Normalize data structures across different exchanges
- Log all API calls for debugging and auditing
```

### Trading Backtest Engine (Backtesting Logic)

<!-- Add custom instructions for the trading-backtest-engine agent -->
**Responsibilities:**
- Backtesting functionality
- Performance analysis
- Strategy simulation

**Custom Instructions:**
```
[Add your instructions here]

Examples:
- Always account for transaction fees in backtest results
- Use realistic slippage models
- Support both historical and real-time data sources
- Generate comprehensive performance metrics
```

### Project Scribe (Documentation)

<!-- Add custom instructions for the project-scribe agent -->
**Responsibilities:**
- Code documentation
- Architecture diagrams
- Knowledge base management

**Custom Instructions:**
```
[Add your instructions here]

Examples:
- Use Mermaid for all diagrams
- Follow JSDoc conventions for TypeScript
- Maintain architecture decision records (ADRs) for major decisions
- Update README.md after significant changes
```

### 🧪 QA Testing Specialist (Testing & Quality Assurance)

<!-- Add custom instructions for the qa-testing-specialist agent -->
**Responsibilities:**
- Unit test creation and maintenance
- Integration test development
- E2E test implementation
- Test infrastructure setup and configuration
- CI/CD pipeline testing configuration
- Test coverage analysis and reporting
- Investigating and fixing test failures
- Establishing testing standards and best practices

**Custom Instructions:**
```
[Add your instructions here]

Examples:

Test Coverage Requirements:
- Maintain minimum 80% code coverage for all business logic
- Aim for 90%+ coverage on critical paths (authentication, payment flows)
- Services and utilities must have 100% coverage
- Components should have at least 70% coverage

Testing Frameworks and Tools:
- Unit Tests: Jest (Backend), Karma + Jasmine (Angular)
- E2E Tests: Cypress or Playwright
- Test Utilities: Testing Library, Angular Testing Library
- Coverage: Istanbul/nyc
- Mocking: Jest mocks, ng-mocks for Angular

Naming Conventions:
- Test files: [name].spec.ts (unit/integration), [name].e2e.ts (E2E)
- Test suites: describe('ComponentName', ...) or describe('ServiceName', ...)
- Test cases: it('should [expected behavior] when [condition]', ...)
- Use descriptive names that explain what is being tested

Test Organization:
- Co-locate unit tests with source files (e.g., user.service.ts + user.service.spec.ts)
- Place integration tests in tests/integration/
- Place E2E tests in e2e/ or cypress/ directory
- Group related tests using nested describe blocks
- Use beforeEach/afterEach for common setup/teardown

When to Write Each Test Type:
- Unit Tests: For isolated components, services, pipes, directives, utilities
- Integration Tests: For API endpoints, database operations, service interactions
- E2E Tests: For critical user workflows, authentication flows, purchase flows
- Visual Regression: For UI components with complex styling

CI/CD Testing Requirements:
- All tests must pass before merging to main branch
- Run unit tests on every commit
- Run integration tests on PR creation
- Run E2E tests nightly and before releases
- Generate and upload coverage reports
- Fail builds if coverage drops below threshold

Mock/Stub Patterns:
- Use Jest mocks for external dependencies
- Use ng-mocks for Angular dependencies
- Stub HTTP calls with HttpTestingController (Angular)
- Mock time-dependent functions (setTimeout, Date.now)
- Create test fixtures/factories for complex data structures
- Use spy functions to verify method calls

Test Data Management:
- Use factories or builders for test data creation
- Keep test data isolated and independent
- Reset database state between integration tests
- Use fixtures for consistent test scenarios
- Avoid hardcoded IDs, use factories to generate unique values
- Seed minimal data required for each test

Testing Best Practices:
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests focused on a single concern
- Make tests independent and isolated
- Use meaningful assertions with clear error messages
- Test error cases and edge conditions
- Avoid testing implementation details
- Mock external services (APIs, databases) in unit tests
- Use real services in integration tests where appropriate
```

---

## Technology-Specific Rules

### Angular-Specific Conventions

<!-- Add Angular-specific rules -->
**File Structure:**
```
[Add your conventions here]

Examples:
- Feature modules should be organized by business domain
- Shared components go in src/app/shared
- Core services go in src/app/core
- Use index.ts barrel exports for public APIs
```

**Component Guidelines:**
```
[Add your guidelines here]

Examples:
- Use OnPush change detection strategy by default
- Unsubscribe from observables in ngOnDestroy
- Keep component logic minimal, delegate to services
- Use smart/presentational component pattern
```

**State Management:**
```
[Add your state management approach here]

Examples:
- Use NgRx for global application state
- Use component state for local UI state
- Use services with BehaviorSubject for shared state between components
- Avoid nested subscriptions, use operators like switchMap instead
```

### Next.js Backend Patterns

<!-- Add Next.js backend patterns -->
**API Routes:**
```
[Add your API patterns here]

Examples:
- Use /api/v1 prefix for all API routes
- Implement middleware for authentication and logging
- Return consistent error response format
- Use environment variables for all configuration
```

**Database Access:**
```
[Add your database patterns here]

Examples:
- Use connection pooling for all database connections
- Implement repository pattern for data access
- Use transactions for multi-step operations
- Cache frequently accessed data with Redis
```

### TypeScript Standards

<!-- Add TypeScript-specific rules -->
**Type Definitions:**
```
[Add your TypeScript standards here]

Examples:
- Define interfaces for all API responses
- Use type guards for runtime type checking
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values
- Enable strict mode in tsconfig.json
```

**Naming Conventions:**
```
[Add your naming conventions here]

Examples:
- Interfaces: PascalCase (e.g., UserProfile)
- Types: PascalCase (e.g., StatusType)
- Enums: PascalCase (e.g., OrderStatus)
- Constants: UPPER_SNAKE_CASE (e.g., MAX_RETRY_COUNT)
- Functions/variables: camelCase (e.g., getUserData)
```

### RxJS Patterns

<!-- Add RxJS-specific patterns -->
**Observable Usage:**
```
[Add your RxJS patterns here]

Examples:
- Use shareReplay() for expensive operations
- Implement proper error handling with catchError
- Use takeUntil pattern for cleanup
- Prefer declarative observable chains over imperative subscriptions
- Use appropriate operators: switchMap for cancellable requests, mergeMap for parallel
```

---

## Common Patterns and Anti-Patterns

### Preferred Approaches

<!-- Add preferred patterns -->
**Error Handling:**
```
[Add your error handling patterns here]

Examples:
- ✓ Use custom error classes for different error types
- ✓ Implement global error handler for unhandled errors
- ✓ Log errors with context information
- ✓ Provide user-friendly error messages
```

**API Communication:**
```
[Add your API communication patterns here]

Examples:
- ✓ Use HttpClient interceptors for common headers
- ✓ Implement retry logic for transient failures
- ✓ Use loading states for async operations
- ✓ Cache API responses when appropriate
```

**Code Organization:**
```
[Add your code organization patterns here]

Examples:
- ✓ Group related functionality together
- ✓ Keep files under 300 lines
- ✓ Use barrel exports for clean imports
- ✓ Follow single responsibility principle
```

### Anti-Patterns to Avoid

<!-- Add anti-patterns to avoid -->
**What NOT to do:**
```
[Add your anti-patterns here]

Examples:
- ✗ Don't use 'any' type unless absolutely necessary
- ✗ Don't subscribe to observables in templates
- ✗ Don't mutate state directly, use immutable updates
- ✗ Don't put business logic in components
- ✗ Don't hardcode configuration values
- ✗ Don't ignore TypeScript compiler warnings
- ✗ Don't commit commented-out code
- ✗ Don't create circular dependencies between modules
```

---

## Code Quality Standards

### Code Reviews

<!-- Add code review guidelines -->
```
[Add your code review standards here]

Examples:
- All code must be reviewed before merging
- Check for proper error handling
- Verify tests cover happy path and edge cases
- Ensure documentation is updated
- Verify no console.log statements in production code
```

### Performance Considerations

<!-- Add performance guidelines -->
```
[Add your performance standards here]

Examples:
- Optimize bundle size using lazy loading
- Use virtual scrolling for large lists
- Implement proper caching strategies
- Monitor and optimize API response times
- Use web workers for CPU-intensive operations
```

### Security Requirements

<!-- Add security requirements -->
```
[Add your security standards here]

Examples:
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Store sensitive data encrypted
- Use HTTPS for all communications
- Follow OWASP security guidelines
```

---

## Testing Requirements

### Unit Tests

<!-- Add unit testing requirements -->
```
[Add your unit testing standards here]

Examples:
- Minimum 80% code coverage for business logic
- Test happy path and edge cases
- Mock external dependencies
- Use descriptive test names (should/when/given pattern)
- Keep tests focused and independent
```

### Integration Tests

<!-- Add integration testing requirements -->
```
[Add your integration testing standards here]

Examples:
- Test API endpoints end-to-end
- Verify database interactions
- Test error scenarios and timeouts
- Use test databases, not production
```

### E2E Tests

<!-- Add E2E testing requirements -->
```
[Add your E2E testing standards here]

Examples:
- Cover critical user journeys
- Test on multiple browsers
- Implement proper wait strategies
- Use page object pattern
```

---

## Documentation Expectations

### Code Documentation

<!-- Add code documentation standards -->
```
[Add your documentation standards here]

Examples:
- All public APIs must have JSDoc comments
- Complex algorithms need explanatory comments
- Include usage examples in documentation
- Document assumptions and constraints
- Explain 'why' not just 'what'
```

### Architecture Documentation

<!-- Add architecture documentation requirements -->
```
[Add your architecture documentation standards here]

Examples:
- Maintain up-to-date architecture diagrams
- Document major architectural decisions in ADRs
- Keep API documentation synchronized with code
- Document deployment architecture and dependencies
```

---

## References

### Internal Documentation

<!-- Add links to your internal documentation -->
```
[Add your internal documentation links here]

Examples:
- [Project README](./README.md)
- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Setup Guide](./docs/setup.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
```

### External Resources

<!-- Add links to external resources -->
```
[Add your external resource links here]

Examples:
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [RxJS Documentation](https://rxjs.dev/guide/overview)
```

### Technology Stack

<!-- Add your technology stack details -->
```
[Add your technology stack here]

Examples:
- Frontend: Angular 18+, RxJS, Angular Material
- Backend: Next.js 14+, Node.js 20+
- Database: PostgreSQL, Redis
- Testing: Jest, Cypress, Playwright
- DevOps: Docker, Kubernetes, GitHub Actions
```

---

## Custom Instructions Template

When adding new instructions, use this template:

```markdown
### [Instruction Category]

**Context:** [Why this instruction exists]

**Rule:** [The specific rule or guideline]

**Example:**
```typescript
// Good example
[code example]

// Bad example (avoid)
[code example]
```

**Rationale:** [Why this approach is preferred]

**Exceptions:** [When this rule doesn't apply]
```

---

## Version History

- **1.0.0** (2025-10-01): Initial creation of AGENT_INSTRUCTIONS.md

---

**Note to Maintainers**: Keep this file up to date as the project evolves. When you discover new patterns or conventions, add them here so all agents can benefit from your learnings. This file is living documentation that should grow with your project.
