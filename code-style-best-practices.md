# React + TypeScript Code Style Best Practices

A comprehensive guide to writing clean, maintainable, and consistent code.

---

## 📋 Table of Contents

1. [Naming Conventions](#naming-conventions)
2. [TypeScript Configuration](#typescript-configuration)
3. [Component Structure](#component-structure)
4. [Props & Types](#props--types)
5. [State Management](#state-management)
6. [Functions & Handlers](#functions--handlers)
7. [File Organization](#file-organization)
8. [Formatting & Linting](#formatting--linting)
9. [Comments & Documentation](#comments--documentation)
10. [Common Anti-Patterns to Avoid](#anti-patterns)

---

## 1. Naming Conventions

### Variables & Functions
Use camelCase for variables, functions, methods, and properties

```typescript
// ✅ Good
const userName = 'John';
const totalPrice = 100;
let isLoading = false;

function calculateTotal() {}
function getUserData() {}

// ❌ Bad
const UserName = 'John';
const user_name = 'John';
const TOTAL_PRICE = 100; // Only for constants
```

### Booleans
Use prefixes like is, has, or can to distinguish boolean variables

```typescript
// ✅ Good
const isActive = true;
const hasPermission = false;
const canEdit = user.role === 'admin';
const shouldRender = isActive && hasPermission;

// ❌ Bad
const active = true;
const permission = false;
const edit = true;
```

### Classes & Components
Use PascalCase for classes, interfaces, types, and React components

```typescript
// ✅ Good - Components
export function UserProfile() {}
export const LoginForm: React.FC = () => {};

// ✅ Good - Classes
class UserService {}
class ApiClient {}

// ✅ Good - Types/Interfaces
interface UserData {}
type ApiResponse = {};

// ❌ Bad
function userProfile() {}
class userService {}
interface userData {}
```

### Constants
Use UPPER_SNAKE_CASE for constants that are truly immutable

```typescript
// ✅ Good
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

// ✅ Good - Config objects (use camelCase for mutable)
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

// ❌ Bad
const api_base_url = 'https://api.example.com';
const maxRetries = 3; // Should be MAX_RETRIES if truly constant
```

### File Names
Use consistent file naming - prefer kebab-case or lowercase for cross-platform compatibility

```
// ✅ Good - Components (PascalCase or kebab-case)
UserProfile.tsx
LoginForm.tsx
user-profile.tsx

// ✅ Good - Utilities, services, hooks
user-service.ts
use-auth.ts
api-client.ts

// ✅ Good - Types
user.types.ts
api.types.ts

// ❌ Bad - Mixed cases can cause issues on different OS
userProfile.tsx (avoid mixing with UserProfile.tsx)
User_Service.ts
```

### Function & Method Names
Use verbs as prefixes to indicate what the function does

```typescript
// ✅ Good - Clear action verbs
function getUser() {}
function fetchData() {}
function calculateTotal() {}
function handleSubmit() {}
function validateEmail() {}
function isValidUser() {}

// ❌ Bad - No verb or unclear purpose
function user() {}
function data() {}
function total() {}
```

**Common prefixes:**
- `get/set` - Getters and setters
- `fetch` - API calls
- `handle` - Event handlers
- `calculate/compute` - Calculations
- `validate/verify` - Validation
- `is/has/can` - Boolean checks
- `create/update/delete` - CRUD operations

---

## 2. TypeScript Configuration

### Essential tsconfig.json Settings
Enable strict mode to enforce strict type checking and catch potential errors at compile time

```json
{
  "compilerOptions": {
    "strict": true,                          // Enable all strict checks
    "noImplicitAny": true,                   // Error on implicit 'any'
    "strictNullChecks": true,                // Strict null checking
    "strictFunctionTypes": true,             // Strict function checks
    "noUnusedLocals": true,                  // Report unused variables
    "noUnusedParameters": true,              // Report unused parameters
    "noImplicitReturns": true,               // Check all paths return
    "noFallthroughCasesInSwitch": true,      // Check switch cases
    "esModuleInterop": true,                 // Better ES module support
    "skipLibCheck": true,                    // Skip type checking libraries
    "forceConsistentCasingInFileNames": true // Enforce consistent casing
  }
}
```

### Type Inference vs Explicit Typing
Be explicit on the outside (APIs, functions), implicit on the inside (internal logic)

```typescript
// ✅ Good - Explicit return types for public APIs
export function calculateTotal(items: Item[]): number {
  // Let TypeScript infer internal variables
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  return subtotal + tax;
}

// ✅ Good - Explicit for complex return types
export function processUserData(data: RawData): {
  user: User;
  metadata: Metadata;
} {
  // Implementation
}

// ❌ Bad - Missing return type on public function
export function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

---

## 3. Component Structure

### Functional Components (Preferred)
Always provide type annotations for component props to ensure type safety

```typescript
// ✅ Good - Clear, typed functional component
interface UserCardProps {
  user: User;
  onEdit?: () => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  return (
    <div className={className}>
      <h2>{user.name}</h2>
      {onEdit && <button onClick={onEdit}>Edit</button>}
    </div>
  );
}

// ✅ Also Good - With default props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  disabled = false, 
  children 
}: ButtonProps) {
  return <button className={variant} disabled={disabled}>{children}</button>;
}

// ❌ Bad - No type annotations
export function UserCard({ user, onEdit }) {
  return <div>{user.name}</div>;
}
```

### Component File Structure Order

```typescript
// 1. Imports (organized)
import { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui';
import type { User } from '@/types';

// 2. Types/Interfaces
interface UserProfileProps {
  userId: string;
}

// 3. Constants (if any)
const MAX_BIO_LENGTH = 500;

// 4. Component
export function UserProfile({ userId }: UserProfileProps) {
  // 4a. State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 4b. Hooks
  useEffect(() => {
    fetchUser();
  }, [userId]);
  
  // 4c. Event handlers
  const handleSave = () => {
    // Implementation
  };
  
  // 4d. Helper functions (or extract to utils)
  const formatBio = (bio: string) => {
    return bio.substring(0, MAX_BIO_LENGTH);
  };
  
  // 4e. Early returns
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;
  
  // 4f. Main render
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{formatBio(user.bio)}</p>
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}

// 5. Sub-components (if small, otherwise separate file)
function UserBio({ bio }: { bio: string }) {
  return <p>{bio}</p>;
}
```

---

## 4. Props & Types

### Prop Definitions
Required properties make it explicit which data is always expected, avoiding ambiguity

```typescript
// ✅ Good - Clear required vs optional
interface UserFormProps {
  // Required props first
  userId: string;
  onSubmit: (data: FormData) => void;
  
  // Optional props after
  initialData?: FormData;
  isEditing?: boolean;
  onCancel?: () => void;
}

// ✅ Good - Use readonly for arrays/objects that shouldn't mutate
interface TableProps {
  columns: ReadonlyArray<Column>;
  data: ReadonlyArray<Row>;
}

// ❌ Bad - Too many optional props
interface UserFormProps {
  userId?: string;
  onSubmit?: (data: FormData) => void;
  data?: FormData;
  editing?: boolean;
  // This creates ambiguity
}
```

### Extending Props
Use ComponentProps to ensure type consistency when extending components

```typescript
import { ComponentProps } from 'react';

// ✅ Good - Extend existing component props
type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button className={variant} {...props} />;
}

// ✅ Good - Spread props from another component
type IconButtonProps = {
  icon: React.ReactNode;
} & ComponentProps<typeof Button>;

export function IconButton({ icon, ...buttonProps }: IconButtonProps) {
  return (
    <Button {...buttonProps}>
      {icon}
      {buttonProps.children}
    </Button>
  );
}
```

### Type vs Interface
**When to use Interface:**
- For object shapes, especially component props
- When you need to extend/merge declarations
- For public APIs

**When to use Type:**
- For unions, intersections, tuples
- For utility types and mapped types
- For primitives and complex types

```typescript
// ✅ Interface for objects
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Type for unions
type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ Type for complex combinations
type ApiResponse<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// ✅ Interface can be extended
interface Admin extends User {
  permissions: string[];
}
```

---

## 5. State Management

### useState Typing
Use generics with React Hooks for cleaner and safer code

```typescript
// ✅ Good - Explicit type when initial value is null/undefined
const [user, setUser] = useState<User | null>(null);
const [data, setData] = useState<ApiData | undefined>(undefined);

// ✅ Good - Type inference when initial value is provided
const [count, setCount] = useState(0); // inferred as number
const [isOpen, isOpen] = useState(false); // inferred as boolean

// ✅ Good - Complex state types
interface FormState {
  email: string;
  password: string;
  errors: Record<string, string>;
}

const [form, setForm] = useState<FormState>({
  email: '',
  password: '',
  errors: {}
});

// ❌ Bad - Implicit any
const [data, setData] = useState(null); // Type is null
```

### State Updates

```typescript
// ✅ Good - Functional updates for dependent state
setCount(prev => prev + 1);
setForm(prev => ({ ...prev, email: newEmail }));

// ✅ Good - Batch related state together
const [userState, setUserState] = useState({
  profile: null,
  isLoading: false,
  error: null
});

// ❌ Bad - Too many separate states
const [profile, setProfile] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
```

---

## 6. Functions & Handlers

### Event Handlers

```typescript
// ✅ Good - Properly typed event handlers
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  // Handle submit
}

function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  console.log(e.clientX, e.clientY);
}

// ✅ Good - Inline handlers for simple operations
<button onClick={() => setCount(c => c + 1)}>Increment</button>

// ✅ Good - Extracted handlers for complex logic
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;
  
  try {
    await api.deleteUser(id);
    setUsers(users => users.filter(u => u.id !== id));
  } catch (error) {
    setError('Failed to delete user');
  }
};

// ❌ Bad - Creating new function on every render
<button onClick={() => handleComplexOperation(id, name)}>
  Click
</button>
// Should use: onClick={handleClick} or useCallback
```

### Async Functions

```typescript
// ✅ Good - Proper error handling
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    throw error;
  }
}

// ✅ Good - Loading states with async
const [isLoading, setIsLoading] = useState(false);

async function handleSubmit() {
  setIsLoading(true);
  try {
    await api.submit(data);
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
}
```

---

## 7. File Organization

### Import Order

```typescript
// 1. External libraries (React first)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal absolute imports
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { api } from '@/services/api';

// 3. Types
import type { User, Post } from '@/types';

// 4. Relative imports
import { UserCard } from './components/UserCard';
import styles from './styles.module.css';

// 5. Side effects (CSS, etc.)
import './global.css';
```

### Export Patterns

```typescript
// ✅ Good - Named exports (preferred for most cases)
export function UserProfile() {}
export function useUser() {}
export const API_URL = 'https://api.example.com';

// ✅ Good - Default export for main component
// UserProfile.tsx
export default function UserProfile() {}

// ✅ Good - Re-export from index
// components/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';

// ❌ Bad - Mix of default and named in same file
export default function UserProfile() {}
export const otherThing = () => {}; // Confusing
```

---

## 8. Formatting & Linting

### ESLint Configuration
Set up ESLint with TypeScript parser for consistent code quality

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off", // Not needed in React 17+
    "react/prop-types": "off", // Using TypeScript
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_" 
    }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

### Code Formatting Rules

```typescript
// ✅ Good - Consistent spacing and line breaks
function calculateTotal(
  items: Item[],
  discount: number,
  taxRate: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * discount;
  const taxAmount = (subtotal - discountAmount) * taxRate;
  return subtotal - discountAmount + taxAmount;
}

// ✅ Good - Destructuring for cleaner code
const { name, email, role } = user;
const { data, isLoading, error } = useQuery('users', fetchUsers);

// ✅ Good - Object shorthand
const user = {
  name,
  email,
  role,
  isActive: true
};

// ❌ Bad - Inconsistent formatting
function calculateTotal(items:Item[],discount:number,taxRate:number):number{
const subtotal=items.reduce((sum,item)=>sum+item.price,0)
return subtotal}
```

---

## 9. Comments & Documentation

### When to Comment

```typescript
// ✅ Good - Explain WHY, not WHAT
// Use debounce to prevent excessive API calls during typing
const debouncedSearch = useDebounce(searchTerm, 300);

// ✅ Good - Document complex logic
/**
 * Calculates compound interest using the formula: A = P(1 + r/n)^(nt)
 * @param principal - Initial investment amount
 * @param rate - Annual interest rate (as decimal)
 * @param time - Time period in years
 * @returns Final amount after interest
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number
): number {
  return principal * Math.pow(1 + rate, time);
}

// ✅ Good - Mark TODOs clearly
// TODO: Add error handling for network failures
// FIXME: This logic breaks when user is null

// ❌ Bad - Obvious comments
// Set name to John
const name = 'John';

// Loop through users
for (const user of users) {
  // ...
}
```

### JSDoc for Public APIs

```typescript
/**
 * Fetches user data from the API
 * @param userId - The unique identifier for the user
 * @param options - Additional fetch options
 * @returns Promise resolving to User object
 * @throws {ApiError} When the request fails
 * @example
 * ```ts
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export async function fetchUser(
  userId: string,
  options?: FetchOptions
): Promise<User> {
  // Implementation
}
```

---

## 10. Common Anti-Patterns to Avoid

### ❌ Don't Use Type Assertions Unnecessarily
Type assertions are unsafe and should only be used when you have an explicit reason

```typescript
// ❌ Bad - Unsafe type assertion
const user = response.data as User;

// ✅ Good - Runtime check + type guard
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}

if (isUser(response.data)) {
  const user = response.data; // Type is User
}
```

### ❌ Don't Use @ts-ignore
Never use @ts-ignore as it superficially fixes compiler errors but hides larger problems

```typescript
// ❌ Bad
// @ts-ignore
const value = dangerousOperation();

// ✅ Good - Fix the actual issue
const value: SafeType = dangerousOperation() as SafeType;
// Or better: Fix the types properly
```

### ❌ Don't Overuse any

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good - Use proper types
function processData(data: { value: string }) {
  return data.value;
}

// ✅ Good - Use unknown for truly unknown types
function processData(data: unknown) {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}
```

### ❌ Don't Create Unnecessary Wrapper Components

```typescript
// ❌ Bad - Unnecessary wrapper
function MyButton(props: ButtonProps) {
  return <Button {...props} />;
}

// ✅ Good - Just use the original or add value
function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}
```

### ❌ Don't Mix Concerns

```typescript
// ❌ Bad - Component doing too much
function UserProfile() {
  const [user, setUser] = useState(null);
  
  // API call
  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(setUser);
  }, []);
  
  // Business logic
  const calculateAge = () => {
    // complex calculation
  };
  
  // Rendering
  return <div>...</div>;
}

// ✅ Good - Separated concerns
function UserProfile() {
  const { user, isLoading } = useUser(); // Hook handles data
  const age = calculateUserAge(user); // Utils handle logic
  
  if (isLoading) return <LoadingSpinner />;
  return <UserDisplay user={user} age={age} />; // Component renders
}
```

---

## 🎯 Key Takeaways

1. **Consistency is King** - Choose conventions and stick to them
2. **Types Everywhere** - Leverage TypeScript's type system fully
3. **Readable Names** - Use descriptive, intention-revealing names
4. **Function Components** - Prefer functional components with hooks
5. **Explicit Interfaces** - Type your props and public APIs
6. **Separate Concerns** - Keep components, logic, and data separate
7. **Use Tools** - Let ESLint and Prettier enforce rules
8. **Document Complexity** - Comment the WHY, not the WHAT
9. **Avoid any** - Use proper types or unknown
10. **Test Your Code** - Write tests for critical functionality

---

## 🔧 Recommended Tools

- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files
- **VS Code** - With TypeScript and ESLint extensions

---

## 📚 Additional Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)

---

**Remember:** Code is read more often than it's written. Write code for humans first, computers second.