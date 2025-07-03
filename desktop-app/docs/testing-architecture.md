# Comprehensive Testing Architecture for Loopd Desktop App

## Overview
This document outlines a comprehensive testing strategy for the Loopd desktop application, covering all major features including app tracking, block rules, database operations, and UI components. The testing system will ensure reliability, maintainability, and confidence in the application's functionality.

## 1. Testing Pyramid Structure

### 1.1 Unit Tests (Foundation - 70%)
- **Rust Backend Logic**: Database operations, block rule evaluation, app tracking
- **React Components**: Individual UI components, hooks, utilities
- **TypeScript Utilities**: Helper functions, data transformations

### 1.2 Integration Tests (Middle - 20%)
- **Tauri Commands**: Frontend-backend communication
- **Database Operations**: SQL queries, migrations, data consistency
- **Component Integration**: Component interactions, state management

### 1.3 End-to-End Tests (Top - 10%)
- **User Workflows**: Complete user journeys
- **Cross-Platform Compatibility**: Windows, macOS, Linux
- **Real App Blocking**: Actual app detection and blocking

## 2. Testing Framework Stack

### 2.1 Frontend (React/TypeScript)
```json
{
  "testing-library/react": "^14.0.0",
  "testing-library/jest-dom": "^6.0.0",
  "testing-library/user-event": "^14.0.0",
  "vitest": "^1.0.0",
  "@vitest/ui": "^1.0.0",
  "jsdom": "^23.0.0"
}
```

### 2.2 Backend (Rust)
```toml
[dev-dependencies]
tokio-test = "0.4"
mockall = "0.12"
sqlx = { version = "0.8", features = ["runtime-tokio-rustls", "sqlite", "migrate"] }
```

### 2.3 E2E (Tauri)
```toml
[dev-dependencies]
tauri-plugin-test = "0.1"
```

## 3. Test Organization Structure

```
desktop-app/
├── src/
│   ├── __tests__/                    # Frontend tests
│   │   ├── components/               # Component tests
│   │   ├── hooks/                    # Hook tests
│   │   ├── lib/                      # Utility tests
│   │   └── integration/              # Integration tests
│   └── ...
├── src-tauri/
│   ├── tests/                        # Backend tests
│   │   ├── database/                 # Database tests
│   │   ├── blocking/                 # Block rules tests
│   │   ├── usage/                    # App tracking tests
│   │   └── integration/              # Backend integration
│   └── ...
├── e2e/                              # End-to-end tests
│   ├── workflows/                    # User workflow tests
│   ├── platform/                     # Platform-specific tests
│   └── performance/                  # Performance tests
└── test-utils/                       # Shared test utilities
    ├── fixtures/                     # Test data
    ├── mocks/                        # Mock implementations
    └── helpers/                      # Test helpers
```

## 4. Frontend Testing Strategy

### 4.1 Component Testing
```typescript
// Example: BlockScreen.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockScreen } from '@/components/BlockScreen';

describe('BlockScreen', () => {
  const mockBlockStatus = {
    is_blocked: true,
    rule: {
      id: '1',
      app_name: 'Discord',
      block_type: 'time' as const,
      strictness: 'hard' as const,
      // ... other properties
    },
    reason: 'Time-based block: 09:00 - 17:00',
    can_override: false,
  };

  it('renders block screen when app is blocked', () => {
    render(<BlockScreen blockStatus={mockBlockStatus} deviceId="test" />);
    expect(screen.getByText('⛔ App Blocked')).toBeInTheDocument();
    expect(screen.getByText('Discord')).toBeInTheDocument();
  });

  it('shows override button for soft blocks', () => {
    const softBlockStatus = { ...mockBlockStatus, can_override: true };
    render(<BlockScreen blockStatus={softBlockStatus} deviceId="test" />);
    expect(screen.getByText('Override Block')).toBeInTheDocument();
  });
});
```

### 4.2 Hook Testing
```typescript
// Example: useAppTracking.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAppTracking } from '@/hooks/useAppTracking';

// Mock Tauri commands
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('useAppTracking', () => {
  it('fetches initial data on mount', async () => {
    const { result } = renderHook(() => useAppTracking());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.currentApp).toBeDefined();
    expect(result.current.deviceId).toBeDefined();
  });

  it('evaluates block status for current app', async () => {
    const { result } = renderHook(() => useAppTracking());
    
    await act(async () => {
      result.current.evaluateBlockStatus();
    });
    
    expect(result.current.currentBlockStatus).toBeDefined();
  });
});
```

### 4.3 Integration Testing
```typescript
// Example: BlockRulesManager.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockRulesManager } from '@/components/BlockRulesManager';

describe('BlockRulesManager Integration', () => {
  it('creates a new block rule', async () => {
    const mockOnRefresh = vi.fn();
    render(
      <BlockRulesManager 
        blockRules={[]} 
        deviceId="test" 
        onRefresh={mockOnRefresh} 
      />
    );

    fireEvent.click(screen.getByText('Add Block Rule'));
    
    fireEvent.change(screen.getByLabelText('Application Name'), {
      target: { value: 'Discord' },
    });
    
    fireEvent.click(screen.getByText('Create'));
    
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });
});
```

## 5. Backend Testing Strategy

### 5.1 Database Testing
```rust
// Example: database/tests.rs
#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::SqlitePool;

    async fn setup_test_db() -> SqlitePool {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::migrate!("../migrations").run(&pool).await.unwrap();
        pool
    }

    #[tokio::test]
    async fn test_create_block_rule() {
        let pool = setup_test_db().await;
        let db = Database::new(pool);
        
        let rule_id = db.create_block_rule(
            "test-device",
            "Discord".to_string(),
            BlockType::Time,
            Some("09:00".to_string()),
            Some("17:00".to_string()),
            None,
            Strictness::Hard,
        ).await.unwrap();
        
        assert!(!rule_id.is_empty());
        
        let rules = db.get_block_rules("test-device").await.unwrap();
        assert_eq!(rules.len(), 1);
        assert_eq!(rules[0].app_name, "Discord");
    }

    #[tokio::test]
    async fn test_evaluate_block_status() {
        let pool = setup_test_db().await;
        let db = Database::new(pool);
        
        // Create a time-based rule
        db.create_block_rule(
            "test-device",
            "Discord".to_string(),
            BlockType::Time,
            Some("09:00".to_string()),
            Some("17:00".to_string()),
            None,
            Strictness::Hard,
        ).await.unwrap();
        
        // Test during block window
        let status = db.evaluate_block_status("test-device", "Discord").await.unwrap();
        // Assert based on current time
    }
}
```

### 5.2 Block Rules Testing
```rust
// Example: blocking/tests.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_block_type_parsing() {
        assert_eq!("time".parse::<BlockType>().unwrap(), BlockType::Time);
        assert_eq!("usage".parse::<BlockType>().unwrap(), BlockType::Usage);
        assert!("invalid".parse::<BlockType>().is_err());
    }

    #[test]
    fn test_strictness_parsing() {
        assert_eq!("hard".parse::<Strictness>().unwrap(), Strictness::Hard);
        assert_eq!("soft".parse::<Strictness>().unwrap(), Strictness::Soft);
        assert!("invalid".parse::<Strictness>().is_err());
    }
}
```

### 5.3 Tauri Commands Testing
```rust
// Example: commands/tests.rs
#[cfg(test)]
mod tests {
    use super::*;
    use tauri::test;

    #[tokio::test]
    async fn test_create_block_rule_command() {
        let app = test::mock_builder().build();
        let db = Arc::new(Database::new(setup_test_pool().await));
        app.manage(db);

        let result = create_block_rule_command(
            State::from(&app),
            "test-device".to_string(),
            "Discord".to_string(),
            "time".to_string(),
            Some("09:00".to_string()),
            Some("17:00".to_string()),
            None,
            "hard".to_string(),
        ).await;

        assert!(result.is_ok());
    }
}
```

## 6. End-to-End Testing Strategy

### 6.1 User Workflow Tests
```typescript
// Example: e2e/workflows/block-rules.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Block Rules Workflow', () => {
  test('user can create and manage block rules', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to block rules section
    await page.click('[data-testid="block-rules-tab"]');
    
    // Create a new rule
    await page.click('[data-testid="add-block-rule"]');
    await page.fill('[data-testid="app-name-input"]', 'Discord');
    await page.selectOption('[data-testid="block-type-select"]', 'time');
    await page.fill('[data-testid="start-time-input"]', '09:00');
    await page.fill('[data-testid="end-time-input"]', '17:00');
    await page.click('[data-testid="create-rule"]');
    
    // Verify rule was created
    await expect(page.locator('[data-testid="rule-item"]')).toContainText('Discord');
  });

  test('block screen appears when app is blocked', async ({ page }) => {
    // Setup: Create a block rule for current time
    // This would require backend setup
    
    // Switch to a blocked app
    // Verify block screen appears
    await expect(page.locator('[data-testid="block-screen"]')).toBeVisible();
  });
});
```

### 6.2 Platform-Specific Tests
```typescript
// Example: e2e/platform/windows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Windows Platform Tests', () => {
  test('app detection works on Windows', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verify Windows-specific app detection
    const currentApp = await page.locator('[data-testid="current-app"]').textContent();
    expect(currentApp).toMatch(/\.exe$/);
  });
});
```

## 7. Performance Testing

### 7.1 Load Testing
```typescript
// Example: e2e/performance/load.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('handles large number of sessions', async ({ page }) => {
    // Setup: Create 1000+ sessions
    // Measure UI responsiveness
    // Verify no memory leaks
  });

  test('block rule evaluation performance', async ({ page }) => {
    // Setup: Create 100+ block rules
    // Measure evaluation time
    // Verify UI remains responsive
  });
});
```

## 8. Test Data Management

### 8.1 Fixtures
```typescript
// Example: test-utils/fixtures/block-rules.ts
export const mockBlockRules = [
  {
    id: '1',
    device_id: 'test-device',
    app_name: 'Discord',
    block_type: 'time' as const,
    time_window_start: '09:00',
    time_window_end: '17:00',
    strictness: 'hard' as const,
    enabled: true,
    // ... other properties
  },
  // ... more fixtures
];

export const mockUsageData = [
  {
    day: '2024-01-01',
    app_name: 'Discord',
    total_seconds: 3600,
  },
  // ... more fixtures
];
```

### 8.2 Mock Implementations
```typescript
// Example: test-utils/mocks/tauri.ts
export const mockTauriCommands = {
  get_active_app: vi.fn().mockResolvedValue('Discord'),
  get_block_rules_command: vi.fn().mockResolvedValue(mockBlockRules),
  evaluate_block_status_command: vi.fn().mockResolvedValue({
    is_blocked: false,
    rule: null,
    reason: '',
    can_override: false,
  }),
  // ... other commands
};
```

## 9. CI/CD Integration

### 9.1 GitHub Actions Workflow
```yaml
# Example: .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: cargo test

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
```

## 10. Test Coverage Goals

### 10.1 Coverage Targets
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user paths only
- **Backend Logic**: 95%+ coverage

### 10.2 Coverage Reporting
```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src-tauri/',
        '**/*.d.ts',
      ],
    },
  },
});
```

## 11. Testing Best Practices

### 11.1 Frontend
- Use `data-testid` attributes for reliable element selection
- Test user interactions, not implementation details
- Mock external dependencies (Tauri commands, API calls)
- Use realistic test data and scenarios

### 11.2 Backend
- Use in-memory SQLite for fast, isolated tests
- Test database migrations and rollbacks
- Mock OS-specific functionality where possible
- Test error conditions and edge cases

### 11.3 E2E
- Focus on critical user journeys
- Test cross-platform compatibility
- Include accessibility testing
- Performance regression testing

## 12. Tauri-Specific Testing Considerations

### 12.1 Tauri Command Testing
```typescript
// Example: testing Tauri commands
import { invoke } from '@tauri-apps/api/core';

// Mock Tauri commands for testing
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('Tauri Commands', () => {
  it('calls get_active_app command', async () => {
    const mockInvoke = vi.mocked(invoke);
    mockInvoke.mockResolvedValue('Discord');
    
    // Test your component/hook that uses invoke
    const result = await invoke('get_active_app');
    expect(result).toBe('Discord');
  });
});
```

### 12.2 Window Management Testing
```typescript
// Example: testing window operations
import { appWindow } from '@tauri-apps/api/window';

vi.mock('@tauri-apps/api/window', () => ({
  appWindow: {
    show: vi.fn(),
    hide: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
  },
}));

describe('Window Management', () => {
  it('shows block screen window', async () => {
    const mockShow = vi.mocked(appWindow.show);
    await appWindow.show();
    expect(mockShow).toHaveBeenCalled();
  });
});
```

### 12.3 File System Testing
```typescript
// Example: testing file operations
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';

vi.mock('@tauri-apps/api/fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));

describe('File Operations', () => {
  it('reads configuration file', async () => {
    const mockReadTextFile = vi.mocked(readTextFile);
    mockReadTextFile.mockResolvedValue('{"setting": "value"}');
    
    const config = await readTextFile('config.json');
    expect(config).toBe('{"setting": "value"}');
  });
});
```

## 13. Database Testing with SQL Plugin

### 13.1 In-Memory Database Testing
```rust
// Example: testing with SQL plugin
#[cfg(test)]
mod tests {
    use super::*;
    use tauri_plugin_sql::{Builder, Migration, MigrationKind};

    async fn setup_test_db() -> tauri::App {
        let migrations = vec![
            Migration {
                version: 1,
                description: "create_initial_tables",
                sql: include_str!("../migrations/0001_init.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 2,
                description: "create_block_rules_tables",
                sql: include_str!("../migrations/0002_block_rules.sql"),
                kind: MigrationKind::Up,
            },
        ];

        let app = tauri::test::mock_builder()
            .plugin(
                Builder::default()
                    .add_migrations("sqlite::memory:", migrations)
                    .build(),
            )
            .build();

        app
    }

    #[tokio::test]
    async fn test_database_operations() {
        let app = setup_test_db().await;
        // Test your database operations
    }
}
```

## 14. Next Steps

1. **Setup Testing Infrastructure**: Install dependencies and configure test runners
2. **Create Test Utilities**: Build shared fixtures, mocks, and helpers
3. **Implement Core Tests**: Start with critical functionality (app tracking, block rules)
4. **Add Integration Tests**: Test component interactions and Tauri commands
5. **Setup CI/CD**: Configure automated testing in GitHub Actions
6. **Performance Testing**: Add load and performance regression tests
7. **Documentation**: Create testing guidelines for contributors

## 15. Testing Checklist

### 15.1 Frontend Testing
- [ ] Component rendering tests
- [ ] User interaction tests
- [ ] Hook behavior tests
- [ ] State management tests
- [ ] Error handling tests
- [ ] Accessibility tests

### 15.2 Backend Testing
- [ ] Database CRUD operations
- [ ] Block rule evaluation logic
- [ ] App tracking functionality
- [ ] Tauri command handlers
- [ ] Error handling and edge cases
- [ ] Performance benchmarks

### 15.3 Integration Testing
- [ ] Frontend-backend communication
- [ ] Database migrations
- [ ] Component interactions
- [ ] Cross-platform compatibility

### 15.4 E2E Testing
- [ ] Complete user workflows
- [ ] Real app blocking scenarios
- [ ] Platform-specific features
- [ ] Performance under load

This comprehensive testing architecture will ensure the Loopd desktop app is reliable, maintainable, and provides a great user experience across all platforms. 