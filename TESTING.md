# Testing Documentation

## Overview

This document outlines the testing strategy, setup, and guidelines for the Family Restaurant Picker project.

## Testing Stack

- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: Jest with Supertest
- **End-to-End Tests**: Playwright
- **Database Tests**: Jest with test database
- **API Tests**: Jest with Supertest
- **Coverage**: Jest coverage reports

## Test Structure

```
family-restaurant-picker/
├── __tests__/
│   ├── unit/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   └── database/
│   └── e2e/
│       ├── family-members.spec.ts
│       ├── restaurants.spec.ts
│       └── recommendations.spec.ts
├── src/
│   └── __tests__/
│       └── components/
└── server/
    └── __tests__/
        ├── routes/
        └── models/
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

## Test Database Setup

### Environment Variables
Create a `.env.test` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/family_restaurant_picker_test
NODE_ENV=test
```

### Test Database Commands
```bash
# Create test database
npm run db:create:test

# Run migrations on test database
npm run db:migrate:test

# Seed test database
npm run db:seed:test

# Reset test database
npm run db:reset:test
```

## Unit Testing Guidelines

### Component Testing

```typescript
// Example: FamilyMemberCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import FamilyMemberCard from '../FamilyMemberCard';

describe('FamilyMemberCard', () => {
  const mockMember = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    dietaryRestrictions: [{ id: 1, name: 'Gluten Free' }],
    cuisinePreferences: [{ cuisineId: 1, cuisineName: 'Italian', preferenceLevel: 5 }]
  };

  test('renders member information correctly', () => {
    render(<FamilyMemberCard member={mockMember} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Gluten Free')).toBeInTheDocument();
  });

  test('handles edit button click', () => {
    const mockOnEdit = jest.fn();
    render(<FamilyMemberCard member={mockMember} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockMember);
  });
});
```

### Service Testing

```typescript
// Example: RecommendationService.test.ts
import { RecommendationService } from '../services/RecommendationService';

describe('RecommendationService', () => {
  test('filters restaurants by dietary restrictions', () => {
    const members = [
      { id: 1, dietaryRestrictions: [{ id: 1, name: 'Gluten Free' }] }
    ];
    const restaurants = [
      { id: 1, name: 'Pizza Place', dietaryAccommodations: [{ id: 1, name: 'Gluten Free' }] },
      { id: 2, name: 'Regular Diner', dietaryAccommodations: [] }
    ];

    const recommendations = RecommendationService.getRecommendations(members, restaurants);
    
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].restaurant.name).toBe('Pizza Place');
  });
});
```

## Integration Testing

### API Endpoint Testing

```typescript
// Example: family-members.api.test.ts
import request from 'supertest';
import app from '../server/app';
import { setupTestDB, teardownTestDB } from './helpers/database';

describe('Family Members API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestData();
  });

  test('POST /api/family-members creates new member', async () => {
    const newMember = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      dietaryRestrictions: [1],
      cuisinePreferences: [{ cuisineId: 1, preferenceLevel: 4 }]
    };

    const response = await request(app)
      .post('/api/family-members')
      .send(newMember)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Jane Doe');
  });

  test('GET /api/family-members returns all members', async () => {
    await createTestMember({ name: 'John Doe' });
    await createTestMember({ name: 'Jane Doe' });

    const response = await request(app)
      .get('/api/family-members')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });
});
```

### Database Testing

```typescript
// Example: FamilyMember.model.test.ts
import { FamilyMember } from '../server/models/FamilyMember';
import { setupTestDB, teardownTestDB } from './helpers/database';

describe('FamilyMember Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test('creates family member with dietary restrictions', async () => {
    const member = await FamilyMember.create({
      name: 'Test User',
      email: 'test@example.com',
      dietaryRestrictions: [1, 2]
    });

    expect(member.id).toBeDefined();
    expect(member.name).toBe('Test User');
    
    const restrictions = await member.getDietaryRestrictions();
    expect(restrictions).toHaveLength(2);
  });
});
```

## End-to-End Testing

### Page Object Model

```typescript
// Example: pages/FamilyMembersPage.ts
import { Page } from '@playwright/test';

export class FamilyMembersPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/family-members');
  }

  async addMember(name: string, email: string, restrictions: string[]) {
    await this.page.click('[data-testid="add-member-btn"]');
    await this.page.fill('[data-testid="member-name"]', name);
    await this.page.fill('[data-testid="member-email"]', email);
    
    for (const restriction of restrictions) {
      await this.page.check(`[data-testid="restriction-${restriction}"]`);
    }
    
    await this.page.click('[data-testid="save-member-btn"]');
  }

  async getMemberCount() {
    return await this.page.locator('[data-testid="member-card"]').count();
  }
}
```

### E2E Test Example

```typescript
// Example: family-members.spec.ts
import { test, expect } from '@playwright/test';
import { FamilyMembersPage } from './pages/FamilyMembersPage';

test.describe('Family Members', () => {
  test('can add and edit family members', async ({ page }) => {
    const familyPage = new FamilyMembersPage(page);
    
    await familyPage.goto();
    await familyPage.addMember('John Doe', 'john@example.com', ['Gluten Free']);
    
    expect(await familyPage.getMemberCount()).toBe(1);
    
    // Test editing
    await page.click('[data-testid="edit-member-btn"]');
    await page.fill('[data-testid="member-name"]', 'John Smith');
    await page.click('[data-testid="save-member-btn"]');
    
    await expect(page.locator('text=John Smith')).toBeVisible();
  });
});
```

## Test Helpers

### Database Helpers

```typescript
// helpers/database.ts
import { Pool } from 'pg';

let testDB: Pool;

export async function setupTestDB() {
  testDB = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  // Run migrations
  await runMigrations(testDB);
  
  // Seed test data
  await seedTestData(testDB);
}

export async function teardownTestDB() {
  await testDB.end();
}

export async function clearTestData() {
  await testDB.query('TRUNCATE TABLE family_members CASCADE');
  await testDB.query('TRUNCATE TABLE restaurants CASCADE');
}

export async function createTestMember(data: Partial<FamilyMember>) {
  // Helper to create test family members
}
```

### Mock Data

```typescript
// helpers/mockData.ts
export const mockFamilyMembers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    dietaryRestrictions: [{ id: 1, name: 'Gluten Free' }]
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@example.com',
    dietaryRestrictions: [{ id: 2, name: 'Vegetarian' }]
  }
];

export const mockRestaurants = [
  {
    id: 1,
    name: 'Pizza Palace',
    cuisineId: 1,
    rating: 4.5,
    priceRange: 2,
    dietaryAccommodations: [{ id: 1, name: 'Gluten Free' }]
  }
];
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

### Coverage Configuration (jest.config.js)
```javascript
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'server/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!server/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Testing Best Practices

### General Guidelines
1. **Test Behavior, Not Implementation** - Focus on what the code does, not how it does it
2. **Write Descriptive Test Names** - Test names should clearly describe the scenario
3. **Arrange-Act-Assert Pattern** - Structure tests with clear setup, execution, and verification
4. **One Assertion Per Test** - Keep tests focused and easy to debug
5. **Use Test Data Builders** - Create reusable test data creation functions

### React Testing
1. **Test User Interactions** - Focus on how users interact with components
2. **Use Testing Library Queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock External Dependencies** - Mock API calls and external services
4. **Test Loading and Error States** - Ensure all UI states are covered

### API Testing
1. **Test All HTTP Methods** - Cover GET, POST, PUT, DELETE endpoints
2. **Test Input Validation** - Verify proper error handling for invalid inputs
3. **Test Edge Cases** - Cover boundary conditions and error scenarios
4. **Test Database Integration** - Ensure data persistence works correctly

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: family_restaurant_picker_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

## Debugging Tests

### Common Issues
1. **Async/Await Problems** - Ensure proper async handling in tests
2. **Database State** - Clean up test data between tests
3. **Mock Issues** - Verify mocks are properly configured
4. **Timing Issues** - Use proper waiting strategies in E2E tests

### Debug Commands
```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npm test -- FamilyMemberCard.test.tsx

# Run tests with verbose output
npm test -- --verbose
```