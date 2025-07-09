import { db } from '../database/connection';
import { DietaryRestriction } from '../types';

export class DietaryRestrictionModel {
  static async findAll(): Promise<DietaryRestriction[]> {
    const query = `
      SELECT id, name, description, created_at
      FROM dietary_restrictions
      ORDER BY name ASC
    `;

    const result = await db.query(query);
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
    }));
  }

  static async findById(id: number): Promise<DietaryRestriction | null> {
    const query = `
      SELECT id, name, description, created_at
      FROM dietary_restrictions
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