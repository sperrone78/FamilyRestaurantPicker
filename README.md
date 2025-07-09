# Family Restaurant Picker

A web application to help families choose restaurants based on member preferences and dietary restrictions.

## Features

- **Family Member Management**: Add and edit family members with their dining preferences and dietary restrictions
- **Restaurant Database**: Add restaurants manually (with future API integration planned)
- **Smart Recommendations**: Select attending family members and get restaurant suggestions based on their combined preferences
- **Dietary Restrictions**: Full support for dietary needs including gluten-free options
- **Cuisine Preference Scoring**: Restaurants are scored based on family member preferences (1-5 scale)
- **User Favorites**: Mark restaurants as favorites for quick access and filtering
- **Personal Comments**: Add, edit, and delete private comments on restaurants visible only to you
- **Advanced Filtering**: Filter restaurants by favorites, cuisine type, dietary accommodations, and ratings

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Firebase (Authentication & Firestore)
- **Database**: Firestore (NoSQL)
- **Testing**: Jest, React Testing Library, Playwright
- **Validation**: Joi
- **API Client**: React Query

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Authentication and Firestore enabled

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd family-restaurant-picker
npm install
```

### 2. Firebase Setup

#### Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase project credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Set up Firebase service account:
1. Download your Firebase service account JSON file
2. Save it as `firebase-service-account.json` in the project root

#### Populate Firestore with initial data:
```bash
node scripts/migrate-to-firestore.js
```

### 3. Start Development Server

```bash
npm run client:dev
```

### 4. Access the Application

- Frontend: http://localhost:3001
- Authentication: Firebase Auth
- Database: Firestore

## Firestore Services

The application uses Firebase Firestore instead of traditional REST APIs. See `API-FIRESTORE.md` for detailed service documentation.

### Core Services
- `familyMembersService` - Manage family members
- `restaurantsService` - Manage restaurants with populated data
- `favoritesService` - Manage user favorites (NEW)
- `commentsService` - Manage user comments (NEW)
- `referenceDataService` - Access cuisines and dietary restrictions

## Database Schema

The application uses Firebase Firestore with the following collections:

- `familyMembers` - Store family member information
- `restaurants` - Restaurant information with populated cuisine data
- `cuisines` - Available cuisine types (reference data)
- `dietaryRestrictions` - Available dietary restrictions (reference data)
- `restaurantFavorites` - User-specific restaurant favorites (NEW)
- `restaurantComments` - User-specific restaurant comments (NEW)

See `DATABASE-FIRESTORE.md` for detailed schema documentation.

## New Features

### User Favorites
- **Heart Icon**: Click the heart icon on any restaurant card to add/remove from favorites
- **Favorites Filter**: Use the "Show only favorites" checkbox to view only your favorite restaurants
- **Real-time Updates**: Favorite status updates immediately without page refresh
- **Private Data**: Your favorites are only visible to you

### Personal Comments
- **Add Comments**: Click "View Details" on any restaurant card and scroll to the comments section
- **Character Limit**: Comments are limited to 500 characters
- **Edit/Delete**: You can edit or delete your own comments anytime
- **Private Visibility**: Comments are only visible to you
- **Timestamps**: See when comments were created and last modified

### Enhanced Filtering
- **Multiple Filters**: Combine favorites filter with cuisine, dietary, and rating filters
- **Clear Filters**: Remove individual filters or clear all at once
- **Active Filter Display**: See which filters are currently active with colored badges
- **Specialty Cuisine Filters**: Filter by Dessert & Ice Cream, Bakery & Pastries, and Cafe & Coffee

### UI/UX Improvements
- **Complete Cuisine Preference Display**: All family member preferences are now visible (1-5 scale)
- **Color-Coded Preferences**: Visual distinction for preference levels:
  - 🟢 Green (4-5/5): Loved cuisines
  - 🔵 Blue (3/5): Liked cuisines  
  - ⚪ Gray (1-2/5): Neutral/disliked cuisines

## Testing

### Run all tests:
```bash
npm test
```

### Run specific test types:
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only
npm run test:coverage     # With coverage report
```

### Test database setup:
```bash
npm run db:migrate:test
npm run db:seed:test
```

## Development Scripts

```bash
npm run dev              # Start both frontend and backend
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run typecheck       # Check TypeScript types
```

## Database Management

```bash
npm run db:create        # Create development database
npm run db:create:test   # Create test database
npm run db:migrate       # Run migrations
npm run db:migrate:test  # Run migrations on test database
npm run db:seed          # Seed development database
npm run db:seed:test     # Seed test database
npm run db:reset         # Drop, create, migrate, and seed development database
npm run db:reset:test    # Drop, create, migrate, and seed test database
```

## Key Features Implementation

### Cuisine Categories
The system includes comprehensive cuisine categorization:

**Traditional Cuisines:**
- American, Italian, Mexican, Chinese, Japanese, Indian, Thai
- Mediterranean, French, Greek, Vietnamese, Korean
- BBQ, Seafood, Steakhouse

**Specialty Food Categories (NEW):**
- **Dessert & Ice Cream** - Ice cream shops, dessert parlors, specialty sweet treats
- **Bakery & Pastries** - Bakeries, pastry shops, fresh baked goods  
- **Cafe & Coffee** - Coffee shops, cafes, light breakfast/lunch spots

### Dietary Restrictions Support
The system supports the following dietary restrictions out of the box:
- Gluten Free (prominently featured as requested)
- Vegetarian
- Vegan
- Dairy Free
- Nut Allergy
- Shellfish Allergy
- Kosher
- Halal
- Low Sodium
- Diabetic Friendly

### Recommendation Algorithm
The recommendation engine works by:

1. **Filtering**: Only shows restaurants that accommodate ALL dietary restrictions of selected family members
2. **Scoring**: Restaurants are scored (0-100) based on:
   - Base availability (10 points for existing restaurant)
   - Cuisine preferences (up to 30 points based on family preferences, 1-5 scale)
   - Dietary accommodation (up to 30 points for accommodating all restrictions)
   - Restaurant rating (up to 20 points based on star rating)
   - Price consideration (up to 10 points for budget-friendly options)
3. **Ranking**: Results are sorted by score, highest first
4. **Favorite Boost**: Favorited restaurants receive a 10% score boost (capped at 100%)

**Recent Fixes:**
- Fixed dietary restriction matching bug that prevented proper scoring
- Improved cuisine preference data handling for accurate recommendations

### Input Validation
All API endpoints include comprehensive validation:
- Required fields validation
- Data type checking
- Range validation (ratings 0-5, price range 1-4, preference levels 1-5)
- Email format validation
- URL format validation

## Project Structure

```
family-restaurant-picker/
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service functions
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Node.js backend source
│   ├── routes/            # Express route handlers
│   ├── models/            # Database models
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   ├── database/          # Database connection and migrations
│   ├── validation/        # Request validation schemas
│   └── types/             # TypeScript type definitions
├── __tests__/             # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
└── docs/                  # Documentation files
```

## Environment Variables

### Development (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/family_restaurant_picker
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
LOG_LEVEL=info
```

### Test (.env.test)
```env
DATABASE_URL_TEST=postgresql://username:password@localhost:5432/family_restaurant_picker_test
PORT=3001
NODE_ENV=test
API_BASE_URL=http://localhost:3001/api
LOG_LEVEL=error
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`npm test`)
6. Run linting (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database names exist

### Port Conflicts
- Change PORT in `.env` if 3000 is occupied
- Frontend dev server runs on 3001 by default

### Migration Errors
- Ensure database exists before running migrations
- Check PostgreSQL user permissions
- Reset database if needed: `npm run db:reset`

## Future Enhancements

### Phase 2
- Restaurant API integration (Google Places, Yelp)
- User accounts and authentication
- Multiple family groups
- Restaurant photos
- Reviews and ratings from family members

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

## License

MIT License - see LICENSE file for details.