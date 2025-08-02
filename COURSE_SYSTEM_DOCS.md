# Course Browsing System Documentation

## Overview

This comprehensive course browsing system built with SvelteKit and PocketBase provides robust search, filtering, and sorting functionality for course management. The system includes:

- **Course Listing Page**: Browse all available courses with advanced filtering
- **Course Detail Page**: View individual course information and lessons
- **Real-time Search**: Instant search across course titles and descriptions
- **Advanced Filtering**: Filter by payment type (free/paid) and sort options
- **URL Persistence**: All filter states are preserved in the URL for shareable links
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Features Implemented

### 1. Server-Side Data Fetching
- Uses SvelteKit's `load` functions for optimal performance
- Server-side filtering through PocketBase queries
- Automatic query parameter handling

### 2. Search Functionality
- Full-text search using PocketBase's `~` operator
- Searches across course titles and descriptions
- Real-time search with form submission
- Enter key support for quick searches

### 3. Filtering System
- **Payment Type Filters**:
  - All Courses
  - Free Courses Only
  - Paid Courses Only
- Visual active state indicators
- Toggle-based filter selection

### 4. Sorting Options
- **Newest First** (default) - Sort by creation date descending
- **Oldest First** - Sort by creation date ascending
- **Price: Low to High** - Sort by price ascending
- **Price: High to Low** - Sort by price descending

### 5. URL State Management
- All filter states persist in URL query parameters
- Shareable links with applied filters
- Browser back/forward navigation support
- Clean URLs with only necessary parameters

### 6. Course Display
- Responsive CSS Grid layout
- Course cards with thumbnails, titles, descriptions
- Prominent pricing badges (Free vs $X.XX)
- Hover effects and visual feedback
- Loading states and error handling
- Empty state handling

## PocketBase Collections

### Courses Collection (`courses`)
```javascript
{
  "id": "string",
  "title": "string",
  "description": "string", 
  "thumbnail": "file",
  "isFree": "boolean",
  "price": "number",
  "created": "datetime",
  "updated": "datetime"
}
```

### Course Lessons Collection (`course_lessons`)
```javascript
{
  "id": "string",
  "title": "string",
  "content": "string",
  "module": "relation(courses)",
  "order": "number",
  "duration": "number",
  "created": "datetime",
  "updated": "datetime"
}
```

## File Structure

```
src/routes/(protected)/dashboard/courses/
├── +page.server.js          # Server-side course listing logic
├── +page.svelte             # Course browsing interface
└── [id]/
    ├── +page.server.js      # Server-side course detail logic
    └── +page.svelte         # Individual course detail page
```

## Usage Examples

### 1. Search for Courses
- Navigate to `/dashboard/courses`
- Type search terms in the search bar
- Press Enter or click Search button
- Results are filtered in real-time

### 2. Filter by Payment Type
- Click "Free Courses" to show only free courses
- Click "Paid Courses" to show only paid courses
- Click "All Courses" to remove payment filters

### 3. Sort Courses
- Use the sort dropdown to change ordering
- Options include newest/oldest and price sorting
- Results update immediately

### 4. Share Filtered Results
- Apply desired filters and search terms
- Copy the URL from the address bar
- Share the URL to maintain the same view

### 5. View Course Details
- Click on any course card
- Navigate to individual course page
- View lessons, pricing, and course information

## URL Parameters

The system uses the following query parameters:

- `search` - Search term for full-text search
- `filter` - Payment type filter (`all`, `free`, `paid`)
- `sort` - Sort option (`newest`, `oldest`, `price-low`, `price-high`)

Example URLs:
```
/dashboard/courses                                    # Default view
/dashboard/courses?search=marketing                   # Search for "marketing"
/dashboard/courses?filter=free                       # Show only free courses
/dashboard/courses?sort=price-low                     # Sort by price low to high
/dashboard/courses?search=affiliate&filter=paid&sort=newest  # Combined filters
```

## Performance Optimizations

1. **Server-Side Filtering**: All filtering is done via PocketBase queries, not client-side JavaScript
2. **Efficient Queries**: Uses PocketBase's built-in filtering and sorting capabilities
3. **Optimized Loading**: Server-side rendering with SvelteKit's load functions
4. **Minimal Re-renders**: Reactive state management with Svelte 5's `$state`

## Error Handling

- **Loading States**: Skeleton placeholders during data fetching
- **Error States**: User-friendly error messages with retry options
- **Empty States**: Helpful messages when no courses match filters
- **Network Failures**: Graceful degradation with error boundaries

## Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Flexible Grid**: Responsive CSS Grid that adapts to screen size
- **Touch-Friendly**: Large touch targets for mobile interaction
- **Readable Typography**: Proper font sizes and line heights

## Setup Instructions

1. **PocketBase Setup**:
   - Create `courses` and `course_lessons` collections
   - Set up the schema as documented above
   - Configure authentication and permissions

2. **Environment Configuration**:
   - Update PocketBase URL in `src/lib/pocketbase.js`
   - Ensure authentication is properly configured

3. **Sample Data** (Optional):
   - Use the seeding script in `src/lib/seed-data.js`
   - Modify the script with your admin credentials
   - Run the script to populate sample courses

4. **Development**:
   - Run `npm run dev`
   - Navigate to `/dashboard/courses`
   - Test search, filtering, and sorting functionality

## Customization

### Adding New Filter Types
1. Add new filter options to `filterOptions` array
2. Update server-side filtering logic in `+page.server.js`
3. Modify URL parameter handling as needed

### Custom Sort Options
1. Add new sort options to `sortOptions` array
2. Update the switch statement in the load function
3. Implement corresponding PocketBase sort parameters

### Styling Modifications
- Colors and themes can be modified in the Svelte components
- The design uses Tailwind CSS classes
- Dark theme is the default, but can be customized

## Best Practices

1. **SEO-Friendly**: Server-side rendering ensures good SEO
2. **Accessibility**: Proper ARIA labels and semantic HTML
3. **Performance**: Efficient queries and minimal client-side processing
4. **User Experience**: Intuitive interface with clear visual feedback
5. **Maintainability**: Clean code structure with proper separation of concerns

## Troubleshooting

### Common Issues

1. **Courses Not Loading**:
   - Check PocketBase connection
   - Verify collection names and schema
   - Check authentication permissions

2. **Search Not Working**:
   - Ensure PocketBase supports full-text search
   - Check filter syntax in server-side code
   - Verify search fields exist in the collection

3. **Filtering Issues**:
   - Check boolean field types in PocketBase
   - Verify filter logic in load function
   - Test query parameters manually

4. **URL State Not Persisting**:
   - Check SvelteKit routing configuration
   - Verify `goto` function usage
   - Test browser navigation

This course browsing system provides a solid foundation for e-learning platforms and can be extended with additional features like user enrollment tracking, progress monitoring, and course ratings.
