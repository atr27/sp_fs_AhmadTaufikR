'use client';

import { useState } from 'react';

interface Project {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    owner: { name: string | null; email: string };
}

interface CreateProjectFormProps {
    onProjectCreated: (project: Project) => void;
}

export default function CreateProjectForm({ onProjectCreated }: CreateProjectFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            });
            if (response.ok) {
                const newProject = await response.json();
                onProjectCreated(newProject);
                setTitle('');
                setDescription('');
            } else {
                const errorData = await response.json();
                alert(`Failed to create project: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md shadow-sm">
            <h2 className="text-xl font-semibold">Create New Project</h2>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Project Title</label>
                <input
                    type="text"
                    id="title"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                    id="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                ></textarea>
            </div>
            <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
            >
                {loading ? 'Creating...' : 'Create Project'}
            </button>
        </form>
    );
}