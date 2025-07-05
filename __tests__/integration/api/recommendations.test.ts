import request from 'supertest';
import app from '../../../server/index';

describe('Recommendations API', () => {
  describe('POST /api/recommendations', () => {
    test('should return recommendations for valid member IDs', async () => {
      const recommendationRequest = {
        memberIds: [1, 2],
        filters: {
          maxPriceRange: 3,
          minRating: 4.0
        }
      };

      const response = await request(app)
        .post('/api/recommendations')
        .send(recommendationRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('recommendations');
      expect(response.body.data).toHaveProperty('summary');
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    test('should reject empty member IDs array', async () => {
      const invalidRequest = {
        memberIds: []
      };

      const response = await request(app)
        .post('/api/recommendations')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject invalid filters', async () => {
      const invalidRequest = {
        memberIds: [1],
        filters: {
          maxPriceRange: 10, // Invalid: should be 1-4
          minRating: 6 // Invalid: should be 0-5
        }
      };

      const response = await request(app)
        .post('/api/recommendations')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});