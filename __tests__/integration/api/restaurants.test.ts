import request from 'supertest';
import app from '../../../server/index';

describe('Restaurants API', () => {
  describe('GET /api/restaurants', () => {
    test('should return restaurants array', async () => {
      const response = await request(app)
        .get('/api/restaurants')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter by cuisine', async () => {
      const response = await request(app)
        .get('/api/restaurants?cuisine=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/restaurants', () => {
    test('should create a new restaurant', async () => {
      const newRestaurant = {
        name: 'Test Pizza Place',
        address: '123 Test St',
        cuisineId: 1,
        priceRange: 2,
        rating: 4.5,
        dietaryAccommodations: [
          {
            dietaryRestrictionId: 1,
            notes: 'Gluten-free options available'
          }
        ]
      };

      const response = await request(app)
        .post('/api/restaurants')
        .send(newRestaurant)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Pizza Place');
      expect(response.body.data.priceRange).toBe(2);
    });

    test('should reject invalid price range', async () => {
      const invalidRestaurant = {
        name: 'Invalid Restaurant',
        priceRange: 10 // Invalid: should be 1-4
      };

      const response = await request(app)
        .post('/api/restaurants')
        .send(invalidRestaurant)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});