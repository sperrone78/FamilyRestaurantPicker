import { PoolClient } from 'pg';
import { db } from '../database/connection';
import { 
  Restaurant, 
  CreateRestaurantRequest, 
  UpdateRestaurantRequest,
  DietaryAccommodation
} from '../types';

export class RestaurantModel {
  static async findAll(filters?: {
    cuisine?: number;
    dietary?: number;
    rating?: number;
  }): Promise<Restaurant[]> {
    let query = `
      SELECT 
        r.id,
        r.name,
        r.address,
        r.phone,
        r.price_range,
        r.rating,
        r.website,
        r.notes,
        r.created_at,
        r.updated_at,
        JSON_BUILD_OBJECT(
          'id', c.id,
          'name', c.name,
          'description', c.description
        ) as cuisine,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN dr.id IS NOT NULL 
              THEN JSON_BUILD_OBJECT(
                'id', dr.id,
                'name', dr.name,
                'notes', rda.notes
              )
              ELSE NULL 
            END
          ) FILTER (WHERE dr.id IS NOT NULL), 
          '[]'
        ) as dietary_accommodations
      FROM restaurants r
      LEFT JOIN cuisines c ON r.cuisine_id = c.id
      LEFT JOIN restaurant_dietary_accommodations rda ON r.id = rda.restaurant_id
      LEFT JOIN dietary_restrictions dr ON rda.dietary_restriction_id = dr.id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters?.cuisine) {
      conditions.push(`r.cuisine_id = $${paramIndex++}`);
      params.push(filters.cuisine);
    }

    if (filters?.dietary) {
      conditions.push(`EXISTS (
        SELECT 1 FROM restaurant_dietary_accommodations rda2 
        WHERE rda2.restaurant_id = r.id 
        AND rda2.dietary_restriction_id = $${paramIndex++}
      )`);
      params.push(filters.dietary);
    }

    if (filters?.rating) {
      conditions.push(`r.rating >= $${paramIndex++}`);
      params.push(filters.rating);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY r.id, r.name, r.address, r.phone, r.price_range, r.rating, r.website, r.notes, r.created_at, r.updated_at, c.id, c.name, c.description
      ORDER BY r.rating DESC, r.name ASC
    `;

    const result = await db.query(query, params);
    return result.rows.map(this.mapRowToRestaurant);
  }

  static async findById(id: number): Promise<Restaurant | null> {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.address,
        r.phone,
        r.price_range,
        r.rating,
        r.website,
        r.notes,
        r.created_at,
        r.updated_at,
        JSON_BUILD_OBJECT(
          'id', c.id,
          'name', c.name,
          'description', c.description
        ) as cuisine,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN dr.id IS NOT NULL 
              THEN JSON_BUILD_OBJECT(
                'id', dr.id,
                'name', dr.name,
                'notes', rda.notes
              )
              ELSE NULL 
            END
          ) FILTER (WHERE dr.id IS NOT NULL), 
          '[]'
        ) as dietary_accommodations
      FROM restaurants r
      LEFT JOIN cuisines c ON r.cuisine_id = c.id
      LEFT JOIN restaurant_dietary_accommodations rda ON r.id = rda.restaurant_id
      LEFT JOIN dietary_restrictions dr ON rda.dietary_restriction_id = dr.id
      WHERE r.id = $1
      GROUP BY r.id, r.name, r.address, r.phone, r.price_range, r.rating, r.website, r.notes, r.created_at, r.updated_at, c.id, c.name, c.description
    `;

    const result = await db.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToRestaurant(result.rows[0]) : null;
  }

  static async create(data: CreateRestaurantRequest): Promise<Restaurant> {
    const result = await db.transaction(async (client: PoolClient) => {
      const restaurantQuery = `
        INSERT INTO restaurants (name, address, phone, cuisine_id, price_range, rating, website, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, address, phone, price_range, rating, website, notes, created_at, updated_at
      `;

      const restaurantResult = await client.query(restaurantQuery, [
        data.name,
        data.address,
        data.phone,
        data.cuisineId,
        data.priceRange,
        data.rating,
        data.website,
        data.notes
      ]);
      const restaurant = restaurantResult.rows[0];

      if (data.dietaryAccommodations && data.dietaryAccommodations.length > 0) {
        for (const accommodation of data.dietaryAccommodations) {
          await client.query(
            'INSERT INTO restaurant_dietary_accommodations (restaurant_id, dietary_restriction_id, notes) VALUES ($1, $2, $3)',
            [restaurant.id, accommodation.dietaryRestrictionId, accommodation.notes]
          );
        }
      }

      return restaurant;
    });
    
    // Fetch the complete restaurant data after transaction commits
    const createdRestaurant = await this.findById(result.id);
    return createdRestaurant!;
  }

  static async update(id: number, data: UpdateRestaurantRequest): Promise<Restaurant | null> {
    return await db.transaction(async (client: PoolClient) => {
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(data.name);
      }
      if (data.address !== undefined) {
        updateFields.push(`address = $${paramIndex++}`);
        updateValues.push(data.address);
      }
      if (data.phone !== undefined) {
        updateFields.push(`phone = $${paramIndex++}`);
        updateValues.push(data.phone);
      }
      if (data.cuisineId !== undefined) {
        updateFields.push(`cuisine_id = $${paramIndex++}`);
        updateValues.push(data.cuisineId);
      }
      if (data.priceRange !== undefined) {
        updateFields.push(`price_range = $${paramIndex++}`);
        updateValues.push(data.priceRange);
      }
      if (data.rating !== undefined) {
        updateFields.push(`rating = $${paramIndex++}`);
        updateValues.push(data.rating);
      }
      if (data.website !== undefined) {
        updateFields.push(`website = $${paramIndex++}`);
        updateValues.push(data.website);
      }
      if (data.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex++}`);
        updateValues.push(data.notes);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        const updateQuery = `
          UPDATE restaurants 
          SET ${updateFields.join(', ')} 
          WHERE id = $${paramIndex}
          RETURNING id
        `;
        const result = await client.query(updateQuery, updateValues);
        if (result.rows.length === 0) return null;
      }

      if (data.dietaryAccommodations !== undefined) {
        await client.query('DELETE FROM restaurant_dietary_accommodations WHERE restaurant_id = $1', [id]);
        for (const accommodation of data.dietaryAccommodations) {
          await client.query(
            'INSERT INTO restaurant_dietary_accommodations (restaurant_id, dietary_restriction_id, notes) VALUES ($1, $2, $3)',
            [id, accommodation.dietaryRestrictionId, accommodation.notes]
          );
        }
      }

      return await this.findById(id);
    });
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM restaurants WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  private static mapRowToRestaurant(row: any): Restaurant {
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      cuisine: row.cuisine,
      priceRange: row.price_range,
      rating: row.rating,
      website: row.website,
      notes: row.notes,
      dietaryAccommodations: row.dietary_accommodations || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}