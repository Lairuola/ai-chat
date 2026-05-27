# Token Integration Reference

Integrating design tokens into frontend implementations.

## CSS Custom Properties

### Setup

```css
/* tokens.css - Generated or manually maintained */
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-text: #1a1a1a;
  --color-text-muted: #6b7280;
  --color-bg: #ffffff;
  --color-border: #e5e7eb;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Typography */
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', monospace;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;

  /* Other */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Dark Mode

```css
/* Theme switching via data attribute */
[data-theme="dark"] {
  --color-text: #fafafa;
  --color-text-muted: #a1a1aa;
  --color-bg: #0a0a0a;
  --color-border: #27272a;
}

/* Or via media query */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #fafafa;
    --color-bg: #0a0a0a;
  }
}
```

### Usage in CSS

```css
.button {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  transition: background-color 150ms ease;
}

.button:hover {
  background-color: var(--color-primary-hover);
}
```

## Tailwind CSS Integration

### tailwind.config.js

```javascript
module.exports = {
  theme: {
    colors: {
      // Use CSS variables for theming
      primary: {
        DEFAULT: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
      },
      text: {
        DEFAULT: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
      },
      bg: 'var(--color-bg)',
      border: 'var(--color-border)',
    },
    spacing: {
      0: '0',
      1: 'var(--spacing-1)',
      2: 'var(--spacing-2)',
      4: 'var(--spacing-4)',
      6: 'var(--spacing-6)',
      8: 'var(--spacing-8)',
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      full: '9999px',
    },
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
  },
};
```

### Usage with Tailwind

```tsx
function Button({ children }: Props) {
  return (
    <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-sans">
      {children}
    </button>
  );
}
```

## JavaScript/TypeScript Tokens

### Token Definition

```typescript
// tokens.ts
export const tokens = {
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    text: '#1a1a1a',
    textMuted: '#6b7280',
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
  },
  radii: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
} as const;

// Type extraction
export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;
```

### Usage in styled-components

```typescript
import styled from 'styled-components';
import { tokens } from './tokens';

const Button = styled.button`
  background-color: ${tokens.colors.primary};
  padding: ${tokens.spacing[2]} ${tokens.spacing[4]};
  border-radius: ${tokens.radii.md};

  &:hover {
    background-color: ${tokens.colors.primaryHover};
  }
`;
```

### Usage in CSS-in-JS (Emotion)

```typescript
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { tokens } from './tokens';

const buttonStyles = css`
  background-color: ${tokens.colors.primary};
  padding: ${tokens.spacing[2]} ${tokens.spacing[4]};
`;

function Button({ children }: Props) {
  return <button css={buttonStyles}>{children}</button>;
}
```

## Token Generation Pipeline

### Style Dictionary Setup

```json
// tokens/color.json
{
  "color": {
    "primary": {
      "value": "#2563eb",
      "type": "color"
    },
    "primary-hover": {
      "value": "#1d4ed8",
      "type": "color"
    }
  }
}
```

```javascript
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
      }],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [{
        destination: 'tokens.ts',
        format: 'javascript/es6',
      }],
    },
  },
};
```

### Build Process

```bash
# package.json scripts
{
  "scripts": {
    "tokens:build": "style-dictionary build",
    "tokens:watch": "nodemon --watch tokens -e json --exec npm run tokens:build"
  }
}
```

## Theme Provider Pattern

### React Context

```tsx
// ThemeProvider.tsx
interface Theme {
  colors: typeof lightTheme.colors;
  spacing: typeof tokens.spacing;
}

const lightTheme: Theme = {
  colors: {
    primary: '#2563eb',
    text: '#1a1a1a',
    bg: '#ffffff',
  },
  spacing: tokens.spacing,
};

const darkTheme: Theme = {
  colors: {
    primary: '#60a5fa',
    text: '#fafafa',
    bg: '#0a0a0a',
  },
  spacing: tokens.spacing,
};

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: Props) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

### CSS Variable Injection

```tsx
function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## Component-Level Tokens

### Scoped Variables

```css
/* Component-specific tokens derived from global */
.card {
  --card-padding: var(--spacing-4);
  --card-radius: var(--radius-lg);
  --card-bg: var(--color-bg);
  --card-border: var(--color-border);

  padding: var(--card-padding);
  border-radius: var(--card-radius);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

/* Variant overrides */
.card--elevated {
  --card-bg: var(--color-bg-elevated);
  box-shadow: var(--shadow-md);
}
```

### TypeScript Token Props

```tsx
interface ButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

const sizeTokens = {
  sm: { px: 'var(--spacing-2)', py: 'var(--spacing-1)', text: 'var(--text-sm)' },
  md: { px: 'var(--spacing-4)', py: 'var(--spacing-2)', text: 'var(--text-base)' },
  lg: { px: 'var(--spacing-6)', py: 'var(--spacing-3)', text: 'var(--text-lg)' },
};

const variantTokens = {
  primary: { bg: 'var(--color-primary)', text: 'white' },
  secondary: { bg: 'var(--color-secondary)', text: 'var(--color-text)' },
  ghost: { bg: 'transparent', text: 'var(--color-text)' },
};
```

## Best Practices

### Token Naming

```
Good:
--color-primary
--color-text-muted
--spacing-4
--radius-md

Avoid:
--blue-500 (raw value, not semantic)
--button-padding (too specific at global level)
--large (not descriptive enough)
```

### Token Layering

```
Layer 1: Primitives (raw values)
--blue-600: #2563eb;

Layer 2: Semantic (purpose)
--color-primary: var(--blue-600);

Layer 3: Component (scoped)
--button-bg: var(--color-primary);
```

### Migration Strategy

```
1. Audit existing styles for hard-coded values
2. Create token definitions
3. Replace values gradually (component by component)
4. Add dark mode support
5. Document token usage
```
