# PocketBase Collections Setup

This document provides the complete setup for all PocketBase collections required for the course system with progress tracking and referrals.

## Required Collections

### 1. Users Collection (`users`)
**Type**: Auth Collection

**Fields:**
- `name` (Text, required)
- `email` (Email, required, unique)
- `password` (Password, required, min length 8)
- `referralCode` (Text, unique, optional)
- `referredBy` (Text, optional) - stores referral code of the person who referred this user

**API Rules:**
- **List/Search**: `@request.auth.id != ""`
- **View**: `@request.auth.id != "" && (@request.auth.id = id || @collection.referrals.user = @request.auth.id)`
- **Create**: `@request.data.email != ""`
- **Update**: `@request.auth.id = id`
- **Delete**: `@request.auth.id = id`

### 2. Courses Collection (`courses`)
**Type**: Base Collection

**Fields:**
- `title` (Text, required)
- `description` (Text, required)
- `thumbnail` (File, optional)
- `isFree` (Bool, default: false)
- `price` (Number, default: 0)
- `content` (Editor, optional)

**API Rules:**
- **List/Search**: `@request.auth.id != ""`
- **View**: `@request.auth.id != ""`
- **Create**: `@request.auth.role = "admin"`
- **Update**: `@request.auth.role = "admin"`
- **Delete**: `@request.auth.role = "admin"`

### 3. Course Lessons Collection (`course_lessons`)
**Type**: Base Collection

**Fields:**
- `title` (Text, required)
- `content` (Editor, required)
- `module` (Relation to courses, required)
- `order` (Number, required)
- `duration` (Number, optional, in minutes)

**API Rules:**
- **List/Search**: `@request.auth.id != ""`
- **View**: `@request.auth.id != ""`
- **Create**: `@request.auth.role = "admin"`
- **Update**: `@request.auth.role = "admin"`
- **Delete**: `@request.auth.role = "admin"`

### 4. User Progress Collection (`user_progress`)
**Type**: Base Collection

**Fields:**
- `user` (Relation to users, required)
- `course` (Relation to courses, required)
- `completion_percentage` (Number, default: 0)
- `completed_lessons` (JSON, default: "[]")
- `current_lesson` (Relation to course_lessons, optional)
- `last_accessed` (DateTime, default: NOW)

**API Rules:**
- **List/Search**: `@request.auth.id != "" && user = @request.auth.id`
- **View**: `@request.auth.id != "" && user = @request.auth.id`
- **Create**: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- **Update**: `@request.auth.id != "" && user = @request.auth.id`
- **Delete**: `@request.auth.id != "" && user = @request.auth.id`

### 5. Support Messages Collection (`support`)
**Type**: Base Collection

**Fields:**
- `user` (Relation to users, required)
- `message` (Text, required)
- `response` (Text, optional)
- `status` (Select: "open", "in_progress", "resolved", default: "open")
- `priority` (Select: "low", "medium", "high", default: "medium")

**API Rules:**
- **List/Search**: `@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin")`
- **View**: `@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin")`
- **Create**: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- **Update**: `@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin")`
- **Delete**: `@request.auth.role = "admin"`

### 6. Referrals Collection (`referrals`)
**Type**: Base Collection

**Fields:**
- `user` (Relation to users, required) - the user who owns the referral code
- `referralCode` (Text, unique, required)
- `referredUsers` (Relation to users, multiple) - users who used this referral code
- `totalReferrals` (Number, default: 0)
- `isActive` (Bool, default: true)

**API Rules:**
- **List/Search**: `@request.auth.id != "" && user = @request.auth.id`
- **View**: `@request.auth.id != "" && user = @request.auth.id`
- **Create**: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- **Update**: `@request.auth.id != "" && user = @request.auth.id`
- **Delete**: `@request.auth.id != "" && user = @request.auth.id`

## Setup Instructions

### Step 1: Create Collections
1. Open PocketBase Admin Panel at `http://127.0.0.1:8090/_/`
2. Go to "Collections" in the sidebar
3. Create each collection with the specified fields and settings

### Step 2: Configure Authentication
1. Go to "Settings" > "Auth providers"
2. Configure email/password authentication
3. Set appropriate password requirements

### Step 3: Set API Rules
Copy and paste the API rules for each collection as specified above.

### Step 4: Test Collections
1. Create a test user account
2. Create a test course
3. Verify that all collections are accessible through the API

## Migration from Existing Setup

If you already have a `lessons` collection instead of `course_lessons`:

### Option 1: Rename Collection
1. Export your `lessons` collection data
2. Delete the `lessons` collection
3. Create `course_lessons` collection with the new schema
4. Import the data with field mapping:
   - `course` field → `module` field

### Option 2: Update Application Code
Update all references from `course_lessons` to `lessons` in your application code.

## Sample Data Structure

### Example Course
```json
{
  "id": "course123",
  "title": "Introduction to Web Development",
  "description": "Learn the basics of HTML, CSS, and JavaScript",
  "isFree": false,
  "price": 99.99
}
```

### Example Course Lesson
```json
{
  "id": "lesson123",
  "title": "HTML Basics",
  "content": "<h1>Welcome to HTML</h1><p>HTML is...</p>",
  "module": "course123",
  "order": 1,
  "duration": 30
}
```

### Example User Progress
```json
{
  "id": "progress123",
  "user": "user123",
  "course": "course123",
  "completion_percentage": 25,
  "completed_lessons": "[\"lesson123\"]",
  "current_lesson": "lesson124",
  "last_accessed": "2025-01-01T10:00:00Z"
}
```

### Example Referral
```json
{
  "id": "ref123",
  "user": "user123",
  "referralCode": "JOHN2025",
  "referredUsers": ["user456", "user789"],
  "totalReferrals": 2,
  "isActive": true
}
```

## Troubleshooting

### Collection Not Found Error
- Verify collection names match exactly (case-sensitive)
- Check that collections are created in PocketBase admin panel
- Ensure API rules allow access for authenticated users

### Permission Denied Error
- Review API rules for each collection
- Ensure user is properly authenticated
- Check that user ID matches in relations

### Invalid Data Error
- Verify required fields are provided
- Check data types match field definitions
- Ensure relations reference existing records
