# React Router Architecture Guide
## Views & Resources Pattern with Complete Layer Structure

---

## 📁 Complete Folder Structure

```
src/
├── app/
│   ├── views/                    # UI Routes (user-facing pages)
│   │   ├── layouts/              # Shared layout components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── home/                 # Home feature
│   │   │   └── index.tsx
│   │   │
│   │   ├── users/                # Users feature
│   │   │   ├── index.tsx         # List view (/users)
│   │   │   ├── show.tsx          # Detail view (/users/:id)
│   │   │   ├── new.tsx           # Create view (/users/new)
│   │   │   ├── edit.tsx          # Edit view (/users/:id/edit)
│   │   │   └── components/       # User-specific components
│   │   │       ├── UserCard.tsx
│   │   │       └── UserForm.tsx
│   │   │
│   │   └── posts/                # Posts feature
│   │       ├── index.tsx
│   │       ├── show.tsx
│   │       └── components/
│   │
│   ├── resources/                # Non-UI routes (API, webhooks)
│   │   ├── api/
│   │   │   ├── users.ts          # API route handlers
│   │   │   └── posts.ts
│   │   └── webhooks/
│   │       └── stripe.ts
│   │
│   └── routes/                   # Route configuration
│       ├── index.tsx             # Main router setup
│       └── routeConfig.ts        # Route definitions
│
├── services/                     # External API calls & data fetching
│   ├── api/
│   │   ├── client.ts             # API client configuration (axios/fetch)
│   │   ├── users.service.ts      # User API calls
│   │   ├── posts.service.ts      # Post API calls
│   │   └── auth.service.ts       # Authentication API calls
│   │
│   └── external/                 # Third-party services
│       ├── stripe.service.ts
│       └── analytics.service.ts
│
├── handlers/                     # Business logic layer
│   ├── users/
│   │   ├── createUser.handler.ts
│   │   ├── updateUser.handler.ts
│   │   ├── deleteUser.handler.ts
│   │   └── validators/
│   │       └── userValidation.ts
│   │
│   └── posts/
│       ├── createPost.handler.ts
│       └── validators/
│
├── hooks/                        # Custom React hooks
│   ├── useUsers.ts               # User data hooks
│   ├── usePosts.ts
│   └── useAuth.ts
│
├── components/                   # Shared/global components
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── ui/
│       ├── Card.tsx
│       └── Table.tsx
│
├── store/                        # State management (Redux/Zustand/Context)
│   ├── slices/
│   │   ├── userSlice.ts
│   │   └── authSlice.ts
│   └── index.ts
│
├── utils/                        # Helper functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
│
└── types/                        # TypeScript types
    ├── user.types.ts
    ├── post.types.ts
    └── api.types.ts
```

---

## 🏗️ Architecture Layers & Responsibilities

### **Layer 1: Views (UI Components)**
**Location:** `app/views/`  
**Purpose:** Presentation layer - renders UI and handles user interactions

**Responsibilities:**
- ✅ Render UI components
- ✅ Handle user events (clicks, form submissions)
- ✅ Call hooks for data
- ✅ Display loading/error states
- ❌ NO direct API calls
- ❌ NO business logic

**Example:**
```tsx
// app/views/users/index.tsx
import { useUsers } from '@/hooks/useUsers';
import UserCard from './components/UserCard';

export default function UsersListView() {
  const { users, isLoading, error } = useUsers();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

### **Layer 2: Hooks (Data Access Layer)**
**Location:** `hooks/`  
**Purpose:** Manages data fetching, caching, and state

**Responsibilities:**
- ✅ Call services to fetch data
- ✅ Manage loading/error states
- ✅ Cache data (using React Query/SWR)
- ✅ Provide data to views
- ❌ NO business logic
- ❌ NO direct API calls (use services)

**Example:**
```tsx
// hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/api/users.service';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAllUsers()
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => createUserHandler(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    }
  });
}
```

---

### **Layer 3: Handlers (Business Logic Layer)**
**Location:** `handlers/`  
**Purpose:** Contains business rules, validation, and orchestration

**Responsibilities:**
- ✅ Validate data
- ✅ Transform data
- ✅ Orchestrate multiple service calls
- ✅ Apply business rules
- ✅ Handle errors and edge cases
- ❌ NO UI rendering
- ❌ NO direct state management

**Example:**
```typescript
// handlers/users/createUser.handler.ts
import { usersService } from '@/services/api/users.service';
import { validateUser } from './validators/userValidation';
import { User, CreateUserDTO } from '@/types/user.types';

export async function createUserHandler(userData: CreateUserDTO): Promise<User> {
  // 1. Validate input
  const validation = validateUser(userData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // 2. Transform data if needed
  const normalizedData = {
    ...userData,
    email: userData.email.toLowerCase(),
    username: userData.username.trim()
  };
  
  // 3. Check business rules
  const existingUser = await usersService.getUserByEmail(normalizedData.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // 4. Call service to create user
  const newUser = await usersService.createUser(normalizedData);
  
  // 5. Perform additional operations if needed
  // e.g., send welcome email, log analytics
  
  return newUser;
}
```

**Validation Example:**
```typescript
// handlers/users/validators/userValidation.ts
import { CreateUserDTO } from '@/types/user.types';

export function validateUser(userData: CreateUserDTO) {
  const errors: string[] = [];
  
  if (!userData.email || !userData.email.includes('@')) {
    errors.push('Invalid email address');
  }
  
  if (!userData.username || userData.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  
  if (!userData.password || userData.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

### **Layer 4: Services (API Communication Layer)**
**Location:** `services/`  
**Purpose:** Direct communication with external APIs

**Responsibilities:**
- ✅ Make HTTP requests
- ✅ Handle API endpoints
- ✅ Transform API responses
- ✅ Handle network errors
- ❌ NO business logic
- ❌ NO validation

**API Client Setup:**
```typescript
// services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Service Example:**
```typescript
// services/api/users.service.ts
import apiClient from './client';
import { User, CreateUserDTO, UpdateUserDTO } from '@/types/user.types';

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`/users/email/${email}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  async createUser(userData: CreateUserDTO): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  
  async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },
  
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }
};
```

---

### **Layer 5: Routes (Configuration Layer)**
**Location:** `app/routes/`  
**Purpose:** Define and configure all application routes

**Route Configuration:**
```typescript
// app/routes/routeConfig.ts
import { lazy } from 'react';

// Layouts
import MainLayout from '@/app/views/layouts/MainLayout';
import AuthLayout from '@/app/views/layouts/AuthLayout';

// Lazy load views
const Home = lazy(() => import('@/app/views/home'));
const UsersList = lazy(() => import('@/app/views/users/index'));
const UserDetail = lazy(() => import('@/app/views/users/show'));
const UserNew = lazy(() => import('@/app/views/users/new'));
const UserEdit = lazy(() => import('@/app/views/users/edit'));

export const routeConfig = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'users',
        children: [
          { index: true, element: <UsersList /> },
          { path: 'new', element: <UserNew /> },
          { path: ':id', element: <UserDetail /> },
          { path: ':id/edit', element: <UserEdit /> }
        ]
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> }
    ]
  }
];
```

**Main Router:**
```tsx
// app/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { routeConfig } from './routeConfig';

const router = createBrowserRouter(routeConfig);

export default function AppRouter() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
```

---

## 🔄 Complete Data Flow Example

### Scenario: User creates a new post

**1. View triggers action:**
```tsx
// app/views/posts/new.tsx
export default function NewPostView() {
  const { mutate: createPost, isLoading } = useCreatePost();
  
  const handleSubmit = (formData) => {
    createPost(formData);
  };
  
  return <PostForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
```

**2. Hook coordinates the operation:**
```tsx
// hooks/usePosts.ts
export function useCreatePost() {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (postData) => createPostHandler(postData),
    onSuccess: (newPost) => {
      navigate(`/posts/${newPost.id}`);
    }
  });
}
```

**3. Handler applies business logic:**
```typescript
// handlers/posts/createPost.handler.ts
export async function createPostHandler(postData: CreatePostDTO): Promise<Post> {
  // Validate
  const validation = validatePost(postData);
  if (!validation.isValid) throw new Error(validation.errors[0]);
  
  // Transform
  const processedData = {
    ...postData,
    slug: generateSlug(postData.title),
    publishedAt: new Date().toISOString()
  };
  
  // Call service
  const newPost = await postsService.createPost(processedData);
  
  // Additional operations
  await analyticsService.track('post_created', { postId: newPost.id });
  
  return newPost;
}
```

**4. Service makes API call:**
```typescript
// services/api/posts.service.ts
export const postsService = {
  async createPost(postData: CreatePostDTO): Promise<Post> {
    const response = await apiClient.post('/posts', postData);
    return response.data;
  }
};
```

---

## 📋 Implementation Checklist

### Phase 1: Setup Foundation
- [ ] Create folder structure
- [ ] Setup API client with interceptors
- [ ] Configure TypeScript types
- [ ] Install React Query or SWR for data fetching
- [ ] Setup router configuration

### Phase 2: Build Core Layers
- [ ] Create service files for each entity
- [ ] Build handler functions with validation
- [ ] Create custom hooks for data access
- [ ] Build layout components

### Phase 3: Build Views
- [ ] Create view components for each route
- [ ] Add feature-specific components
- [ ] Connect views to hooks

### Phase 4: Testing & Optimization
- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Add route-level code splitting
- [ ] Write tests for handlers and services

---

## 🎯 Key Principles

1. **Separation of Concerns**: Each layer has ONE responsibility
2. **Unidirectional Flow**: Views → Hooks → Handlers → Services → API
3. **No Skip Layers**: Don't call services directly from views
4. **Co-location**: Keep related files together (e.g., view + components)
5. **Type Safety**: Use TypeScript throughout
6. **Error Handling**: Handle errors at each layer appropriately
7. **Testing**: Each layer can be tested independently

---

## ✨ Benefits of This Architecture

- ✅ **Highly Readable**: Clear structure and naming
- ✅ **Maintainable**: Easy to find and modify code
- ✅ **Testable**: Each layer can be tested in isolation
- ✅ **Scalable**: Add new features without refactoring
- ✅ **Team-Friendly**: Clear conventions for collaboration
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Performance**: Built-in code splitting and lazy loading