import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { familyMembersApi, referenceDataApi } from '../services/api';
import { FamilyMember, CreateFamilyMemberRequest } from '../types';
import FamilyMemberCard from '../components/FamilyMemberCard';
import FamilyMemberForm from '../components/FamilyMemberForm';
import { useAuth } from '../contexts/AuthContext';

export default function FamilyMembersPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: members = [], isLoading, error } = useQuery(
    'familyMembers',
    () => familyMembersApi.getAll(user?.uid || ''),
    { enabled: !!user?.uid }
  );

  const { data: cuisines = [] } = useQuery('cuisines', referenceDataApi.getCuisines);
  const { data: dietaryRestrictions = [] } = useQuery('dietaryRestrictions', referenceDataApi.getDietaryRestrictions);

  const createMutation = useMutation(
    (data: CreateFamilyMemberRequest) => familyMembersApi.create(user?.uid || '', data),
    {
    onSuccess: () => {
      queryClient.invalidateQueries('familyMembers');
      setShowForm(false);
      setEditingMember(undefined);
      setErrorMessage(null);
    },
    onError: (error: any) => {
      console.error('Failed to create family member:', error);
      const errorMsg = error?.message || 'Failed to create family member';
      setErrorMessage(errorMsg);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: CreateFamilyMemberRequest }) =>
      familyMembersApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('familyMembers');
        setShowForm(false);
        setEditingMember(undefined);
        setErrorMessage(null);
      },
      onError: (error: any) => {
        console.error('Failed to update family member:', error);
        const errorMsg = error?.message || 'Failed to update family member';
        setErrorMessage(errorMsg);
      },
    }
  );

  const deleteMutation = useMutation(familyMembersApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('familyMembers');
      setErrorMessage(null);
    },
    onError: (error: any) => {
      console.error('Failed to delete family member:', error);
      const errorMsg = error?.message || 'Failed to delete family member';
      setErrorMessage(errorMsg);
    },
  });

  const handleSubmit = (data: CreateFamilyMemberRequest) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      deleteMutation.mutate(memberId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(undefined);
  };

  const handleAddNew = () => {
    setEditingMember(undefined);
    setShowForm(true);
    setErrorMessage(null);
  };

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Family Members</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Failed to load family members. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-600 mt-2">
            Manage your family members and their dining preferences.
            {members.length > 0 && (
              <span className="ml-2 text-sm">
                ({members.length}/10 members)
              </span>
            )}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleAddNew}
            disabled={members.length >= 10}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
              members.length >= 10
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
            }`}
            data-testid="add-member-btn"
            title={members.length >= 10 ? 'Maximum 10 family members allowed' : ''}
          >
            Add Family Member
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <FamilyMemberForm
            member={editingMember}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createMutation.isLoading || updateMutation.isLoading}
          />
        </div>
      )}

      {isLoading ? (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No family members yet</h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first family member with their dietary restrictions and cuisine preferences.
          </p>
          {!showForm && (
            <button
              onClick={handleAddNew}
              disabled={members.length >= 10}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                members.length >= 10
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
              }`}
              title={members.length >= 10 ? 'Maximum 10 family members allowed' : ''}
            >
              Add Your First Family Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isLoading}
              cuisines={cuisines}
              dietaryRestrictions={dietaryRestrictions}
            />
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}