# Testing Guide for Loopd Desktop App

## Overview

This guide covers the testing architecture and best practices for the Loopd desktop app, which uses React with Next.js frontend and Rust with Tauri backend.

## Testing Stack

- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing (planned)
- **@tauri-apps/api/mocks** - Tauri API mocking

## Test Structure

```
src/
├── __tests__/                    # Test files
│   ├── components/               # Component tests
│   ├── hooks/                    # Hook tests
│   └── lib/                      # Utility tests
├── test/
│   ├── fixtures/                 # Mock data
│   ├── utils/                    # Test utilities
│   └── mocks/                    # Mock configurations
```

## Running Tests

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test:run -- src/components/__tests__/BlockRulesManager.test.tsx
```

## Writing Tests

### 1. Component Tests

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    render(<MyComponent />)
    
    fireEvent.click(screen.getByText('Click me'))
    
    await waitFor(() => {
      expect(screen.getByText('Clicked!')).toBeInTheDocument()
    })
  })
})
```

### 2. Hook Tests

```tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useMyHook())
    
    expect(result.current.value).toBe('default')
  })

  it('updates state when called', async () => {
    const { result } = renderHook(() => useMyHook())
    
    await act(async () => {
      await result.current.updateValue('new value')
    })
    
    expect(result.current.value).toBe('new value')
  })
})
```

### 3. Utility Tests

```tsx
import { describe, it, expect } from 'vitest'
import { formatTime } from '../timeUtils'

describe('timeUtils', () => {
  it('formats time correctly', () => {
    expect(formatTime(30)).toBe('30s')
    expect(formatTime(90)).toBe('1m 30s')
  })
})
```

## Mocking Tauri APIs

### 1. Basic Mocking

```tsx
import { vi } from 'vitest'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}))

// In your test
const { invoke } = await import('@tauri-apps/api/core')
vi.mocked(invoke).mockResolvedValue('test-data')
```

### 2. Advanced Mocking

```tsx
// Mock with different responses
vi.mocked(invoke)
  .mockResolvedValueOnce('first-call')
  .mockRejectedValueOnce(new Error('second-call-error'))
  .mockResolvedValueOnce('third-call')
```

## Test Utilities

### Custom Render Function

```tsx
import { render } from '@/test/utils/test-utils'

// Automatically includes:
// - UserContext provider
// - Theme provider
// - Tauri mocks
render(<MyComponent />)
```

### Mock Data

```tsx
import { mockBlockRules } from '@/test/fixtures/block-rules'

// Use consistent mock data across tests
render(<BlockRulesManager blockRules={mockBlockRules} />)
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

### 2. Component Testing

- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility features

### 3. Hook Testing

- Test the public API of hooks
- Use `act()` for state updates
- Mock external dependencies

### 4. Error Handling

```tsx
it('handles errors gracefully', async () => {
  vi.mocked(invoke).mockRejectedValue(new Error('Network error'))
  
  render(<MyComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })
})
```

### 5. Async Testing

```tsx
it('handles async operations', async () => {
  const { result } = renderHook(() => useMyHook())
  
  await act(async () => {
    await result.current.asyncOperation()
  })
  
  expect(result.current.isLoading).toBe(false)
})
```

## Common Patterns

### 1. Testing Dialogs

```tsx
it('opens and closes dialog', async () => {
  render(<MyComponent />)
  
  // Open dialog
  fireEvent.click(screen.getByText('Open Dialog'))
  
  await waitFor(() => {
    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
  })
  
  // Close dialog
  fireEvent.click(screen.getByText('Close'))
  
  await waitFor(() => {
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument()
  })
})
```

### 2. Testing Form Submissions

```tsx
it('submits form data', async () => {
  const mockSubmit = vi.fn()
  render(<MyForm onSubmit={mockSubmit} />)
  
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'John Doe' }
  })
  
  fireEvent.click(screen.getByText('Submit'))
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
  })
})
```

### 3. Testing Loading States

```tsx
it('shows loading state', async () => {
  vi.mocked(invoke).mockImplementation(() => new Promise(() => {}))
  
  render(<MyComponent />)
  
  fireEvent.click(screen.getByText('Load Data'))
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})
```

## Debugging Tests

### 1. Debug Output

```tsx
it('debug test', () => {
  render(<MyComponent />)
  
  // Print DOM for debugging
  screen.debug()
  
  // Print specific element
  screen.debug(screen.getByText('Hello'))
})
```

### 2. Test Isolation

```tsx
beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})
```

## Performance Testing

### 1. Memory Leaks

```tsx
it('does not cause memory leaks', () => {
  const { unmount } = render(<MyComponent />)
  
  // Perform operations
  fireEvent.click(screen.getByText('Action'))
  
  // Clean up
  unmount()
})
```

### 2. Render Performance

```tsx
it('renders efficiently', () => {
  const startTime = performance.now()
  
  render(<MyComponent />)
  
  const endTime = performance.now()
  expect(endTime - startTime).toBeLessThan(100) // 100ms threshold
})
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Troubleshooting

### Common Issues

1. **Tauri Mock Errors**: Use proper mock setup in `vitest.config.ts`
2. **Async Test Timeouts**: Increase timeout or fix async logic
3. **Component Not Found**: Check import paths and component exports
4. **Mock Not Working**: Ensure mocks are set up before component renders

### Getting Help

- Check existing test files for patterns
- Review Vitest documentation
- Check React Testing Library documentation
- Ask in team discussions

## Future Enhancements

1. **E2E Testing** with Playwright
2. **Visual Regression Testing**
3. **Performance Testing**
4. **Accessibility Testing**
5. **Contract Testing** for API integration

---

This guide should help you write effective tests for the Loopd desktop app. Remember to keep tests simple, focused, and maintainable! 