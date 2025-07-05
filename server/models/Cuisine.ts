import { db } from '../database/connection';
import { Cuisine } from '../types';

export class CuisineModel {
  static async findAll(): Promise<Cuisine[]> {
    const query = `
      SELECT id, name, description, created_at
      FROM cuisines
      ORDER BY name ASC
    `;

    const result = await db.query(query);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
    }));
  }

  static async findById(id: number): Promise<Cuisine | null> {
    const query = `
      SELECT id, name, description, created_at
      FROM cuisines
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows.length > 0 ? {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
    } : null;
  }
}