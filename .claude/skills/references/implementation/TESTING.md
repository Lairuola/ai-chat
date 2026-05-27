# Testing Frameworks Reference

Frontend testing patterns and best practices.

## Testing Stack

```
Unit Tests:        Jest + React Testing Library
Integration Tests: React Testing Library
E2E Tests:         Playwright or Cypress
A11y Tests:        axe-core, Playwright
Visual Tests:      Playwright screenshots, Chromatic
```

## React Testing Library

### Basic Component Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Async Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('shows loading then data', async () => {
  render(<UserList />);

  // Initially shows loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});

it('handles form submission', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### Query Priority

```tsx
// Prefer these queries (accessibility-first)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByPlaceholderText(/search/i);
screen.getByText(/welcome/i);

// Use these when above don't work
screen.getByTestId('complex-component');
screen.getByDisplayValue('current value');

// Avoid
document.querySelector('.button'); // Implementation detail
```

### Testing Hooks

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter(0));

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

## Jest Configuration

### jest.config.js

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### jest.setup.ts

```typescript
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
window.IntersectionObserver = MockIntersectionObserver as any;
```

## Playwright E2E Tests

### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('successful login', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});
```

### Page Object Model

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}

// tests/login.spec.ts
test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

### Accessibility Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page should be accessible', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Visual Regression

```typescript
test('button variants', async ({ page }) => {
  await page.goto('/components/button');

  await expect(page.locator('.button-primary')).toHaveScreenshot('button-primary.png');
  await expect(page.locator('.button-secondary')).toHaveScreenshot('button-secondary.png');
});
```

## Mocking

### API Mocking with MSW

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ])
    );
  }),

  rest.post('/api/login', async (req, res, ctx) => {
    const { email } = await req.json();
    if (email === 'test@example.com') {
      return res(ctx.json({ token: 'mock-token' }));
    }
    return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Component Mocking

```typescript
// Mock child component
jest.mock('./ExpensiveChart', () => ({
  ExpensiveChart: () => <div data-testid="mock-chart">Chart</div>,
}));

// Mock hook
jest.mock('./useUser', () => ({
  useUser: () => ({
    user: { id: 1, name: 'Test User' },
    loading: false,
  }),
}));

// Mock context
const mockContextValue = {
  theme: 'light',
  setTheme: jest.fn(),
};

render(
  <ThemeContext.Provider value={mockContextValue}>
    <ThemeToggle />
  </ThemeContext.Provider>
);
```

## Test Organization

### File Structure

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx      # Unit tests
│       └── Button.stories.tsx   # Storybook
├── hooks/
│   └── useAuth/
│       ├── useAuth.ts
│       └── useAuth.test.ts
└── __tests__/                   # Integration tests
    └── auth-flow.test.tsx

e2e/
├── tests/
│   ├── login.spec.ts
│   └── checkout.spec.ts
└── pages/                       # Page objects
    └── LoginPage.ts
```

### Test Naming

```typescript
describe('Button', () => {
  describe('rendering', () => {
    it('renders children');
    it('applies variant styles');
  });

  describe('interactions', () => {
    it('calls onClick when clicked');
    it('does not call onClick when disabled');
  });

  describe('accessibility', () => {
    it('has accessible name');
    it('supports keyboard activation');
  });
});
```

## CI Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### What to Test

```
✓ Component renders correctly
✓ User interactions work
✓ Accessibility requirements met
✓ Error states display correctly
✓ Loading states appear
✓ Edge cases handled

✗ Implementation details
✗ Third-party library internals
✗ Styling (use visual tests)
```

### Test Quality

```
✓ Test behavior, not implementation
✓ Use accessible queries
✓ Keep tests independent
✓ Make tests deterministic
✓ Test one thing per test
✓ Use meaningful assertions
```
