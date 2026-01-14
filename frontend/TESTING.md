# Frontend Testing Guide

## Setup

### Install Testing Dependencies

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

### Unit Tests
Test individual components and functions in isolation.

Example: `src/components/common/Button.test.jsx`

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests
Test how multiple components work together.

### E2E Tests
Use Playwright or Cypress for end-to-end testing (not yet implemented).

## Writing Tests

### Testing Components

1. **Import necessary testing utilities**
```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
```

2. **Render the component**
```jsx
render(<YourComponent prop="value" />);
```

3. **Query elements**
```jsx
const button = screen.getByRole('button', { name: /click me/i });
const text = screen.getByText('Hello World');
```

4. **Interact with elements**
```jsx
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'new value' } });
```

5. **Assert expectations**
```jsx
expect(button).toBeInTheDocument();
expect(button).toHaveClass('btn-primary');
expect(mockFn).toHaveBeenCalled();
```

### Mocking

#### Mock functions
```jsx
const mockFn = vi.fn();
mockFn('test');
expect(mockFn).toHaveBeenCalledWith('test');
```

#### Mock modules
```jsx
vi.mock('./api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'test' }))
}));
```

#### Mock context providers
```jsx
import { WalletContext } from './contexts/WalletContext';

const mockWalletContext = {
  accountId: '0.0.123456',
  isConnected: true,
  connect: vi.fn(),
};

render(
  <WalletContext.Provider value={mockWalletContext}>
    <YourComponent />
  </WalletContext.Provider>
);
```

## Best Practices

1. **Test behavior, not implementation**
   - Focus on what the user sees and does
   - Avoid testing internal state or methods

2. **Use semantic queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary

3. **Keep tests simple and focused**
   - One assertion per test when possible
   - Clear test names that describe the scenario

4. **Use data-testid sparingly**
   - Only when semantic queries don't work
   - Example: `<div data-testid="custom-element" />`

5. **Mock external dependencies**
   - Mock API calls, external services
   - Keep tests fast and deterministic

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Common Issues

### Issue: "Cannot find module '@testing-library/react'"
**Solution**: Run `npm install --save-dev @testing-library/react @testing-library/jest-dom`

### Issue: "ReferenceError: document is not defined"
**Solution**: Make sure `vitest.config.js` has `environment: 'jsdom'`

### Issue: Tests timeout
**Solution**: Add timeout config in vitest.config.js:
```js
test: {
  testTimeout: 10000
}
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
