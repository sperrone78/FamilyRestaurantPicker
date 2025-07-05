# Family Restaurant Picker

A web application to help families choose restaurants based on member preferences and dietary restrictions.

## Features

- **Family Member Management**: Add and edit family members with their dining preferences and dietary restrictions
- **Restaurant Database**: Add restaurants manually (with future API integration planned)
- **Smart Recommendations**: Select attending family members and get restaurant suggestions based on their combined preferences
- **Dietary Restrictions**: Full support for dietary needs including gluten-free options
- **Cuisine Preference Scoring**: Restaurants are scored based on family member preferences (1-5 scale)

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL
- **Testing**: Jest, React Testing Library, Playwright
- **Validation**: Joi
- **API Client**: React Query

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd family-restaurant-picker
npm install
```

### 2. Database Setup

#### Create PostgreSQL databases:
```bash
createdb family_restaurant_picker
createdb family_restaurant_picker_test
```

#### Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/family_restaurant_picker
DATABASE_URL_TEST=postgresql://username:password@localhost:5432/family_restaurant_picker_test
PORT=3000
NODE_ENV=development
```

#### Run migrations and seed data:
```bash
npm run db:migrate
npm run db:seed
```

### 3. Start Development Servers

#### Option 1: Start both servers simultaneously
```bash
npm run dev
```

#### Option 2: Start servers separately
```bash
# Terminal 1 - Backend server (port 3000)
npm run server:dev

# Terminal 2 - Frontend dev server (port 3001)
npm run client:dev
```

### 4. Access the Application

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Health Check: http://localhost:3000/health

## API Endpoints

### Family Members
- `GET /api/family-members` - Get all family members
- `POST /api/family-members` - Create new family member
- `GET /api/family-members/:id` - Get family member by ID
- `PUT /api/family-members/:id` - Update family member
- `DELETE /api/family-members/:id` - Delete family member

### Restaurants
- `GET /api/restaurants` - Get all restaurants (with optional filters)
- `POST /api/restaurants` - Create new restaurant
- `GET /api/restaurants/:id` - Get restaurant by ID
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Recommendations
- `POST /api/recommendations` - Get restaurant recommendations

### Reference Data
- `GET /api/dietary-restrictions` - Get all dietary restrictions
- `GET /api/cuisines` - Get all cuisine types

## Database Schema

The application uses the following main tables:

- `family_members` - Store family member information
- `dietary_restrictions` - Available dietary restrictions
- `member_dietary_restrictions` - Link members to their restrictions
- `cuisines` - Available cuisine types
- `member_cuisine_preferences` - Store member cuisine preferences (1-5 scale)
- `restaurants` - Restaurant information
- `restaurant_dietary_accommodations` - Link restaurants to dietary restrictions they accommodate

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
   - Dietary accommodation (40 points for accommodating all restrictions)
   - Cuisine preferences (up to 30 points based on family preferences)
   - Restaurant rating (up to 15 points for excellent ratings)
   - Price consideration (5 points for budget-friendly options)
3. **Ranking**: Results are sorted by score, highest first

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