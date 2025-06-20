'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import CreateProjectForm from './create-project-form';
import ProjectList from './project-list';
import { Project } from '@/types';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
            return;
        }

        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects');
                if (response.ok) {
                    const data: Project[] = await response.json();
                    setProjects(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to fetch projects');
                }
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [session, status, router]);

    const handleProjectCreated = (newProject: Project) => {
        setProjects((prevProjects) => [newProject, ...prevProjects]);
    };

    if (loading) return <div className="p-6">Loading dashboard...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
    if (!session) return null;

    return (
        <>
            <Navbar />
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Welcome, {session.user?.name || session.user?.email}!</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <CreateProjectForm onProjectCreated={handleProjectCreated} />
                    </div>
                    <ProjectList projects={projects} />
                </div>
            </div>
        </>
    );
}