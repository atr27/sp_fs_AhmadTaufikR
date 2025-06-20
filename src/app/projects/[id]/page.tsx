'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateTaskForm from './create-task-form';
import TaskBoard from './task-board';
import { TaskStatus } from '@/generated/prisma'; 

interface User {
    id: string;
    name: string | null;
    email: string;
}

interface ProjectMember {
    userId: string;
    user: User;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    assigneeId: string | null;
    assignee: User | null;
}

interface Project {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    owner: User;
    members: ProjectMember[];
    tasks: Task[];
}

export default function ProjectDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/login');
            return;
        }
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}`);
                if (response.ok) {
                    const data: Project = await response.json();
                    setProject(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to fetch project');
                }
            } catch (err) {
                console.error('Error fetching project:', err);
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId, session, status, router]);

    const handleTaskCreated = (newTask: Task) => {
        setProject((prevProject) => {
            if (!prevProject) return null;
            return {
                ...prevProject,
                tasks: [...prevProject.tasks, newTask],
            };
        });
    };

    const setProjectTasks = (newTasksAction: React.SetStateAction<Task[]>) => {
        setProject(prevProject => {
            if (!prevProject) return null;
            const newTasks = typeof newTasksAction === 'function'
                ? newTasksAction(prevProject.tasks)
                : newTasksAction;
            return { ...prevProject, tasks: newTasks };
        });
    };

    
    if (loading) return <div className="p-6">Loading project...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
    if (!project) return <div className="p-6">Project not found.</div>;
    const isOwner = session?.user?.id === project.ownerId;
    const allProjectMembers: ProjectMember[] = [
        { userId: project.owner.id, user: project.owner },
        ...project.members.filter(member => member.userId !==
            project.owner.id)
    ];
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            {project.description && <p className="text-gray-700 mb-4">{project.description}</p>}
            <p className="text-sm text-gray-600 mb-2">Owner: {project.owner.name || project.owner.email}</p>
            <h2 className="text-2xl font-semibold mt-6 mb-3">Members</h2>
            <ul className="list-disc list-inside">
                {allProjectMembers.map(member => (
                    <li key={member.userId}>{member.user.name ||member.user.email}</li>
                ))}
            </ul>
            {isOwner && (
                <div className="mt-6">
                    <Link href={`/projects/${projectId}/settings`}
                        className="text-indigo-600 hover:underline">
                        Project Settings (Invite Members, Delete Project)
                    </Link>
                </div>
            )}
            <h2 className="text-2xl font-semibold mt-6 mb-3">Tasks</h2>
            <div className="mb-6">
                <CreateTaskForm projectId={projectId} projectMembers={allProjectMembers} onTaskCreated={handleTaskCreated} />
            </div>
            <TaskBoard projectId={projectId} tasks={project.tasks} setTasks={setProjectTasks} />
        </div>
    );
}