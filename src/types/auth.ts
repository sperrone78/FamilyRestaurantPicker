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

export interface UserProfile {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFamilyRequest {
  name: string;
}

export interface InviteFamilyMemberRequest {
  email: string;
  familyId: string;
}