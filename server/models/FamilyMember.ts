import { PoolClient } from 'pg';
import { db } from '../database/connection';
import { 
  FamilyMember, 
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  DietaryRestriction,
  CuisinePreference
} from '../types';

export class FamilyMemberModel {
  static async findAll(): Promise<FamilyMember[]> {
    const membersQuery = 'SELECT id, name, email, created_at, updated_at FROM family_members ORDER BY created_at DESC';
    const membersResult = await db.query(membersQuery);
    
    const members: FamilyMember[] = [];
    
    for (const memberRow of membersResult.rows) {
      const member = await this.findById(memberRow.id);
      if (member) {
        members.push(member);
      }
    }
    
    return members;
  }

  static async findById(id: number): Promise<FamilyMember | null> {
    // Get basic member info
    const memberQuery = 'SELECT id, name, email, created_at, updated_at FROM family_members WHERE id = $1';
    const memberResult = await db.query(memberQuery, [id]);
    
    if (memberResult.rows.length === 0) {
      return null;
    }
    
    const member = memberResult.rows[0];
    
    // Get dietary restrictions
    const restrictionsQuery = `
      SELECT dr.id, dr.name, dr.description 
      FROM dietary_restrictions dr
      JOIN member_dietary_restrictions mdr ON dr.id = mdr.dietary_restriction_id
      WHERE mdr.member_id = $1
      ORDER BY dr.name
    `;
    const restrictionsResult = await db.query(restrictionsQuery, [id]);
    
    // Get cuisine preferences
    const preferencesQuery = `
      SELECT c.id as cuisine_id, c.name as cuisine_name, mcp.preference_level
      FROM cuisines c
      JOIN member_cuisine_preferences mcp ON c.id = mcp.cuisine_id
      WHERE mcp.member_id = $1
      ORDER BY c.name
    `;
    const preferencesResult = await db.query(preferencesQuery, [id]);
    
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      dietaryRestrictions: restrictionsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description
      })),
      cuisinePreferences: preferencesResult.rows.map(row => ({
        cuisineId: row.cuisine_id,
        cuisineName: row.cuisine_name,
        preferenceLevel: row.preference_level
      })),
      createdAt: member.created_at,
      updatedAt: member.updated_at
    };
  }

  static async create(data: CreateFamilyMemberRequest): Promise<FamilyMember> {
    const result = await db.transaction(async (client: PoolClient) => {
      const memberQuery = `
        INSERT INTO family_members (name, email)
        VALUES ($1, $2)
        RETURNING id, name, email, created_at, updated_at
      `;

      const memberResult = await client.query(memberQuery, [data.name, data.email]);
      const member = memberResult.rows[0];

      if (data.dietaryRestrictions && data.dietaryRestrictions.length > 0) {
        for (const restrictionId of data.dietaryRestrictions) {
          await client.query(
            'INSERT INTO member_dietary_restrictions (member_id, dietary_restriction_id) VALUES ($1, $2) ON CONFLICT (member_id, dietary_restriction_id) DO NOTHING',
            [member.id, restrictionId]
          );
        }
      }

      if (data.cuisinePreferences && data.cuisinePreferences.length > 0) {
        for (const preference of data.cuisinePreferences) {
          await client.query(
            'INSERT INTO member_cuisine_preferences (member_id, cuisine_id, preference_level) VALUES ($1, $2, $3) ON CONFLICT (member_id, cuisine_id) DO UPDATE SET preference_level = EXCLUDED.preference_level',
            [member.id, preference.cuisineId, preference.preferenceLevel]
          );
        }
      }

      return member;
    });
    
    // Fetch the complete member data after transaction commits
    const createdMember = await this.findById(result.id);
    return createdMember!;
  }

  static async update(id: number, data: UpdateFamilyMemberRequest): Promise<FamilyMember | null> {
    return await db.transaction(async (client: PoolClient) => {
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(data.name);
      }
      if (data.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        updateValues.push(data.email);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        const updateQuery = `
          UPDATE family_members 
          SET ${updateFields.join(', ')} 
          WHERE id = $${paramIndex}
          RETURNING id
        `;
        const result = await client.query(updateQuery, updateValues);
        if (result.rows.length === 0) return null;
      }

      if (data.dietaryRestrictions !== undefined) {
        await client.query('DELETE FROM member_dietary_restrictions WHERE member_id = $1', [id]);
        for (const restrictionId of data.dietaryRestrictions) {
          await client.query(
            'INSERT INTO member_dietary_restrictions (member_id, dietary_restriction_id) VALUES ($1, $2)',
            [id, restrictionId]
          );
        }
      }

      if (data.cuisinePreferences !== undefined) {
        await client.query('DELETE FROM member_cuisine_preferences WHERE member_id = $1', [id]);
        for (const preference of data.cuisinePreferences) {
          await client.query(
            'INSERT INTO member_cuisine_preferences (member_id, cuisine_id, preference_level) VALUES ($1, $2, $3)',
            [id, preference.cuisineId, preference.preferenceLevel]
          );
        }
      }

      return await this.findById(id);
    });
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM family_members WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

}