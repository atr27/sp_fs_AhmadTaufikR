import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: {
    params: { id: string }
}) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            {
                message: 'Unauthorized'
            },
            {
                status: 401
            }
        );
    }
    const projectId = params.id;
    const currentUserId = session.user.id;
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: true,
                members: { include: { user: true } },
                tasks: true, // Include tasks for project detail view
            },
        });
        if (!project) {
            return NextResponse.json(
                {
                    message: 'Project not found'
                },
                {
                    status: 404
                }
            );
        }

        const isOwner = project.ownerId === currentUserId;
        const isMember = project.members.some((member: any) => member.userId === currentUserId);
        if (!isOwner && !isMember) {
            return NextResponse.json(
                {
                    message: 'Forbidden: You do not have access to this project'
                },
                {
                    status: 403
                }
            );
        }
        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            {
                message: 'Something went wrong'
            },
            {
                status: 500
            }
        );
    }
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            {
                message: 'Unauthorized'
            },
            {
                status: 401
            }
        );
    }
    const projectId = params.id;
    const currentUserId = session.user.id;
    const { title, description } = await request.json();
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true },
        });
        if (!project) {
            return NextResponse.json(
                {
                    message: 'Project not found'
                },
                {
                    status: 404
                }
            );
        }

        if (project.ownerId !== currentUserId) {
            return NextResponse.json(
                {
                    message: 'Forbidden: Only project owner can update project'
                },
                {
                    status: 403
                }
            );
        }
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title,
                description,
            },
        });
        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            {
                message: 'Something went wrong'
            },
            {
                status: 500
            }
        );
    }
}


export async function DELETE(request: Request, { params }: {
    params: { id: string }
}) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json(
            {
                message: 'Unauthorized'
            },
            {
                status: 401
            }
        );
    }
    const projectId = params.id;
    const currentUserId = session.user.id;
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true },
        });
        if (!project) {
            return NextResponse.json(
                {
                    message: 'Project not found'
                },
                {
                    status: 404
                }
            );
        }

        if (project.ownerId !== currentUserId) {
            return NextResponse.json(
                {
                    message: 'Forbidden: Only project owner can delete project'
                },
                {
                    status: 403
                }
            );
        }

        await prisma.$transaction([
            prisma.projectMember.deleteMany({ where: { projectId: projectId } }),
            prisma.task.deleteMany({ where: { projectId: projectId } }),
            prisma.project.delete({ where: { id: projectId } })
        ]);
        return NextResponse.json(
            {
                message: 'Project deleted successfully'
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            {
                message: 'Something went wrong'
            },
            {
                status: 500
            }
        );
    }
}