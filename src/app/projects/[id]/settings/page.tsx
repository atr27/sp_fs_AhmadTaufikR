'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import InviteMemberForm from './invite-member-form';
import { Button } from '@/components/ui/button';
import { Trash2, User, UserX } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function ProjectSettings({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        throw new Error('Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load project members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [params.id]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      const response = await fetch(`/api/projects/${params.id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Member removed successfully');
        fetchMembers(); // Refresh the members list
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Project deleted successfully');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading project settings...</div>;
  }

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-6">Project Settings</h1>
      </div>

      {/* Invite Members Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <InviteMemberForm projectId={params.id} onMemberAdded={fetchMembers} />
        
        {/* Members List */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Current Members</h3>
          {members.length === 0 ? (
            <p className="text-gray-500">No members yet. Invite someone to get started!</p>
          ) : (
            <div className="bg-white rounded-lg border divide-y">
              {members.map((member) => (
                <div key={member.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name || member.email}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {member.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-red-100 pt-6 mt-12">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Delete this project</h3>
              <p className="text-sm text-red-700">Once you delete a project, there is no going back. Please be certain.</p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={deleteLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
