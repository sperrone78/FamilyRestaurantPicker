import request from 'supertest';
import app from '../../../server/index';

describe('Family Members API', () => {
  describe('GET /api/family-members', () => {
    test('should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/family-members')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/family-members', () => {
    test('should create a new family member', async () => {
      const newMember = {
        name: 'John Doe',
        email: 'john@example.com',
        dietaryRestrictions: [1],
        cuisinePreferences: [
          {
            cuisineId: 1,
            preferenceLevel: 5
          }
        ]
      };

      const response = await request(app)
        .post('/api/family-members')
        .send(newMember)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.email).toBe('john@example.com');
    });

    test('should reject invalid data', async () => {
      const invalidMember = {
        // missing required name field
        email: 'invalid@example.com'
      };

      const response = await request(app)
        .post('/api/family-members')
        .send(invalidMember)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});