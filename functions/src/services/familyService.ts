import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyUser {
  id: string;
  familyId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export class FamilyService {
  static async getUserFamilies(userId: string): Promise<Family[]> {
    const familyUsersSnapshot = await db
      .collection('familyUsers')
      .where('userId', '==', userId)
      .get();

    const familyIds = familyUsersSnapshot.docs.map(doc => doc.data().familyId);
    
    if (familyIds.length === 0) {
      return [];
    }

    const familiesSnapshot = await db
      .collection('families')
      .where('__name__', 'in', familyIds)
      .get();

    return familiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Family));
  }

  static async createFamily(name: string, ownerId: string): Promise<Family> {
    const familyRef = db.collection('families').doc();
    const family: Omit<Family, 'id'> = {
      name,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await familyRef.set(family);

    // Add owner to family users
    const familyUserRef = db.collection('familyUsers').doc();
    const familyUser: Omit<FamilyUser, 'id'> = {
      familyId: familyRef.id,
      userId: ownerId,
      role: 'owner',
      joinedAt: new Date()
    };

    await familyUserRef.set(familyUser);

    return {
      id: familyRef.id,
      ...family
    };
  }

  static async getUserPrimaryFamily(userId: string): Promise<Family | null> {
    const families = await this.getUserFamilies(userId);
    
    if (families.length === 0) {
      // Auto-create a family for new users
      return await this.createFamily('My Family', userId);
    }
    
    // Return the first family (could be expanded to have user preference)
    return families[0];
  }

  static async checkFamilyAccess(userId: string, familyId: string): Promise<boolean> {
    const familyUserSnapshot = await db
      .collection('familyUsers')
      .where('userId', '==', userId)
      .where('familyId', '==', familyId)
      .limit(1)
      .get();

    return !familyUserSnapshot.empty;
  }
}