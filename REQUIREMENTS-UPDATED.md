# Project Requirements (Updated)

## Overview

The Family Restaurant Picker is a web application designed to help families choose restaurants based on the dining preferences and dietary restrictions of attending family members. The application now includes user authentication and personal features like favorites and comments.

## Core Features

### 1. Family Member Management

**Add Family Members**
- Name (required)
- Email (optional)
- Dietary restrictions (multiple selection)
- Cuisine preferences with rating scale (1-5)

**Edit Family Members**
- Modify all fields
- Add/remove dietary restrictions
- Update cuisine preferences

**Delete Family Members**
- Remove family member and all associated data

### 2. Restaurant Management

**Add Restaurants**
- Name (required)
- Address
- Phone number
- Cuisine type
- Price range (1-4 dollar signs)
- Rating (1-5 stars)
- Website URL
- Notes
- Dietary accommodations (what restrictions they can handle)

**Edit Restaurants**
- Modify all fields
- Update dietary accommodations

**Delete Restaurants**
- Remove restaurant from database

### 3. Recommendation Engine

**Member Selection**
- Select which family members are attending
- Display selected members' restrictions and preferences

**Restaurant Filtering**
- Must accommodate ALL dietary restrictions of selected members
- Score restaurants based on cuisine preferences
- Filter by price range (optional)
- Filter by minimum rating (optional)

**Recommendation Display**
- Show scored list of restaurants
- Display reasons for recommendation
- Show which dietary restrictions are accommodated
- Highlight highly preferred cuisines

### 4. User Favorites & Comments (NEW)

**Restaurant Favorites**
- Mark/unmark restaurants as favorites with heart icon
- Filter restaurants to show only favorites
- Favorites are private to each user
- Real-time favorite status updates

**Personal Comments**
- Add private comments to restaurants (max 500 characters)
- Edit and delete own comments
- Comments visible only to the user who created them
- Timestamps show creation and last modification dates
- Comments display in restaurant detail modal

**Enhanced Filtering**
- Filter by favorites (show only favorited restaurants)
- Combine with existing filters (cuisine, dietary, rating)
- Clear individual filters or all filters at once

### 5. User Authentication (NEW)

**Firebase Authentication**
- Email/password registration and login
- Google OAuth sign-in
- User session management
- Protected routes requiring authentication

**User Profile**
- Display user email in navigation
- Sign out functionality
- Automatic family creation per user

## Dietary Restrictions

### Required Restrictions
- Gluten Free
- Vegetarian
- Vegan
- Dairy Free
- Nut Allergy
- Shellfish Allergy

### Additional Restrictions
- Kosher
- Halal
- Low Sodium
- Diabetic Friendly

## User Interface Requirements

### Navigation
- Home/Dashboard
- Family Members
- Restaurants
- Find Restaurant (main feature)

### Responsive Design
- Mobile-friendly
- Tablet optimized
- Desktop layout

### Accessibility
- Screen reader compatible
- Keyboard navigation
- High contrast support
- Clear focus indicators

## Technical Requirements

### Frontend
- React with TypeScript
- Responsive design (mobile-first)
- Form validation
- Loading states
- Error handling

### Backend
- Firebase Authentication
- Firestore NoSQL database
- Real-time data synchronization
- User-scoped data access

### Database
- Firestore collections
- Proper indexing
- Data integrity constraints
- Security rules

### Performance
- Page load under 3 seconds
- Smooth interactions
- Efficient database queries
- Real-time updates

## Data Validation

### Family Members
- Name: Required, 1-100 characters
- Email: Valid email format if provided
- Dietary restrictions: Must exist in database
- Cuisine preferences: Rating 1-5

### Restaurants
- Name: Required, 1-200 characters
- Price range: 1-4
- Rating: 0-5 (decimal allowed)
- Website: Valid URL format if provided
- Dietary accommodations: Must exist in database

### User Comments (NEW)
- Content: Required, 1-500 characters
- Must be associated with valid restaurant
- User must be authenticated

## Future Enhancements

### Phase 2 (COMPLETED)
- ✅ User accounts and authentication
- ✅ Personal favorites and comments
- ✅ Enhanced filtering options
- Restaurant API integration (Google Places, Yelp)
- Multiple family groups
- Restaurant photos

### Phase 3
- Mobile app (React Native)
- Push notifications
- Social features (share recommendations)
- Advanced filtering (distance, hours, etc.)
- Meal planning integration

### Phase 4
- AI-powered recommendations
- Learning from past choices
- Integration with delivery services
- Nutritional information
- Reservation system integration

## Success Metrics

### User Experience
- Users can add family member in under 2 minutes
- Users can get restaurant recommendations in under 30 seconds
- 95% of dietary restrictions are properly accommodated
- Users can mark favorites and add comments intuitively

### Performance
- Firestore queries under 500ms
- UI interactions under 200ms
- Real-time updates without page refresh

### Reliability
- 99.9% uptime
- Zero data loss
- Proper error handling and recovery

## Security Considerations

### Data Protection
- Firebase security rules
- User authentication required
- Input sanitization
- XSS protection

### Privacy
- User comments and favorites are private
- No sharing of personal data between users
- Optional email addresses only
- Family-scoped data isolation

## Testing Requirements

### Unit Tests
- All service functions
- React components
- Utility functions
- Authentication flows

### Integration Tests
- Firestore operations
- User workflows
- Authentication integration

### End-to-End Tests
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness

## Deployment Requirements

### Development Environment
- Firebase project setup
- Environment variables
- Hot reloading
- Debug tools

### Production Environment
- Firebase hosting
- Firestore security rules
- Environment configuration
- Error monitoring
- Performance monitoring