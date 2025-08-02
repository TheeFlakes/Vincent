# PocketBase Setup Instructions

The authentication system in this application requires PocketBase to be running as a backend server.

## Installation and Setup

### Option 1: Download PocketBase Binary

1. Go to [PocketBase releases](https://github.com/pocketbase/pocketbase/releases)
2. Download the latest release for your operating system
3. Extract the executable to your project directory or a convenient location
4. Run PocketBase:
   ```bash
   # Windows
   pocketbase.exe serve
   
   # Mac/Linux
   ./pocketbase serve
   ```

### Option 2: Using Go (if you have Go installed)

```bash
go install github.com/pocketbase/pocketbase@latest
pocketbase serve
```

## Configuration

1. After starting PocketBase, open your browser and go to:
   ```
   http://127.0.0.1:8090/_/
   ```

2. Create an admin account when prompted

3. Create a `users` collection with the following fields:
   - `name` (Text, required)
   - `email` (Email, required, unique)
   - `password` (Password, required, min length 8)

4. Set up authentication settings for the `users` collection:
   - Enable "Auth collection"
   - Set appropriate API rules for Create, Read, Update, Delete operations

## Default Configuration

The application is configured to connect to PocketBase at:
```
http://127.0.0.1:8090
```

If you need to change this URL, update the configuration in:
```javascript
// src/lib/pocketbase.js
export const pb = new PocketBase('your-pocketbase-url');
```

## Troubleshooting

- **"Unable to connect to server"**: Make sure PocketBase is running on port 8090
- **Authentication errors**: Check that the `users` collection is properly configured
- **CORS issues**: PocketBase usually handles CORS automatically for localhost development

## Running the Application

1. Start PocketBase server: `pocketbase serve`
2. Start the SvelteKit dev server: `npm run dev`
3. Open your browser to the SvelteKit URL (usually http://localhost:5173)
