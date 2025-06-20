import Link from 'next/link';
import { Project } from '@/types';

interface ProjectListProps {
    projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
    return (
        <div className="col-span-1">
            <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
            {projects.length === 0 ? (
                <p className="text-gray-600">You don't have any projects yet. Create one to get started!</p>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                            <h3 className="text-xl font-semibold mb-2">
                                <Link href={`/projects/${project.id}`} className="text-indigo-600 hover:underline">
                                    {project.title}
                                </Link>
                            </h3>
                            {project.description && <p className="text-gray-600 text-sm mb-2">{project.description}</p>}
                            {project.owner && <p className="text-xs text-gray-500">Owner: {project.owner.name || project.owner.email}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
