# Vincent - SvelteKit Authentication System

This project implements a complete authentication system using SvelteKit and PocketBase.

## File Structure

```
src/
├── lib/
│   ├── pocketbase.js          # PocketBase client setup
│   └── auth.js               # Auth utilities (login, signup, logout)
├── routes/
│   ├── (auth)/               # Public routes (grouped)
│   │   ├── login/
│   │   │   ├── +page.svelte  # Login UI
│   │   │   └── +page.server.js # Login form action
│   │   └── signup/
│   │       ├── +page.svelte  # Signup UI
│   │       └── +page.server.js # Signup form action
│   ├── (protected)/          # Auth-required routes (grouped)
│   │   └── dashboard/
│   │       └── +page.svelte  # Protected dashboard page
│   ├── logout/               # Logout action
│   │   └── +page.server.js
│   ├── +layout.svelte        # Main layout with navbar
│   ├── +layout.server.js     # Server-side session loader
│   └── +error.svelte         # Error handling page
├── hooks.server.js           # Global auth middleware
└── app.postcss              # Tailwind CSS styles
```

## Features

- **User Registration**: Create new accounts with email/password
- **User Authentication**: Login with email/password  
- **Protected Routes**: Dashboard requires authentication
- **Session Management**: Persistent sessions using cookies
- **Route Groups**: Auth routes vs protected routes
- **Global Navigation**: Navbar shows login/logout based on auth state
- **Error Handling**: Custom error pages for auth failures
- **Responsive Design**: Tailwind CSS styling

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start PocketBase**:
   - Download PocketBase from https://pocketbase.io/
   - Create a `users` collection with fields: `name`, `email`, `password`
   - Start PocketBase: `./pocketbase serve`
   - Update the PocketBase URL in `src/lib/pocketbase.js` if needed

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Usage

### Authentication Flow

1. **Registration**: Visit `/signup` to create a new account
2. **Login**: Visit `/login` to authenticate
3. **Dashboard**: After login, access protected content at `/dashboard`
4. **Logout**: Use the logout button in the navbar or visit `/logout`

### Route Protection

- Routes in `(auth)` group are public (login, signup)
- Routes in `(protected)` group require authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users trying to access auth pages are redirected to `/dashboard`

### Session Management

- Authentication state is managed by PocketBase
- Sessions persist across browser refreshes using cookies
- Global auth state is available via the `currentUser` store

## Configuration

### PocketBase Setup

Update the PocketBase URL in `src/lib/pocketbase.js`:

```javascript
export const pb = new PocketBase('http://127.0.0.1:8090'); // Your PocketBase URL
```

### Protected Routes

Add routes to the protected list in `src/hooks.server.js`:

```javascript
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
```

## Components

### Auth Utilities (`src/lib/auth.js`)

- `login(email, password)` - Authenticate user
- `signup(userData)` - Register new user
- `logout()` - Clear authentication
- `isAuthenticated()` - Check auth status
- `getCurrentUser()` - Get current user data

### PocketBase Client (`src/lib/pocketbase.js`)

- Configured PocketBase client
- Reactive `currentUser` store
- Auto-updates on auth state changes

## Styling

The project uses Tailwind CSS for styling with:
- Responsive design
- Clean authentication forms
- Professional dashboard layout
- Error state handling
- Loading states

## Security

- Server-side route protection via hooks
- Client-side auth state management
- Secure cookie handling
- Form validation
- Error handling for auth failures
