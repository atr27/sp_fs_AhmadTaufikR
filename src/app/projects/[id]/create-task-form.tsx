'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectMember {
    userId: string;
    user: { id: string; name: string | null; email: string };
}

interface CreateTaskFormProps {
    projectId: string;
    projectMembers: ProjectMember[];
    onTaskCreated: (task: any) => void;
}

export default function CreateTaskForm({ projectId, projectMembers, onTaskCreated }: CreateTaskFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title, description,
                    assigneeId
                }),
            });
            if (response.ok) {
                const newTask = await response.json();
                onTaskCreated(newTask);
                setTitle('');
                setDescription('');
                setAssigneeId(null);
            } else {
                const errorData = await response.json();
                alert(`Failed to create task: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md shadow-sm">
            <h2 className="text-xl font-semibold">Create New Task</h2>
            <div>
                <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700">Task Title</label>
                <input
                    type="text"
                    id="taskTitle"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                    id="taskDescription"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                ></textarea>
            </div>
            <div>
                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee (Optional)</label>
                <select
                    id="assignee"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={assigneeId || ''}
                    onChange={(e) => setAssigneeId(e.target.value ||
                        null)}
                    disabled={loading}
                >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member) => (
                        <option key={member.userId} value={member.userId}>
                            {member.user.name || member.user.email}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
            >
                {loading ? 'Creating...' : 'Create Task'}
            </button>
        </form>
    );
}