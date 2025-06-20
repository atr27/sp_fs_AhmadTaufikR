import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../api/auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    try {
        const projectId = params.id;
        const currentUserId = session.user.id;
        const { title, description, assigneeId } = await request.json();

        if (!title) {
            return NextResponse.json(
                {
                    message: 'Task title is required'
                },
                {
                    status: 400
                }
            );
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
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

        if (assigneeId) {
            const assigneeIsMember = project.ownerId === assigneeId
                || project.members.some((member: any) => member.userId === assigneeId);
            if (!assigneeIsMember) {
                return NextResponse.json(
                    {
                        message: 'Assignee must be a member of this project'
                    },
                    {
                        status: 400
                    }
                );
            }
        }

        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                assigneeId: assigneeId || null,
            },
        });

        // Re-fetch the task to include the assignee details
        const taskWithAssignee = await prisma.task.findUnique({
            where: { id: newTask.id },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(taskWithAssignee, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
        }
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


export async function GET(request: Request, { params }: { params: { id: string } }) {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'You must be logged in to view tasks' },
            { status: 401 }
        );
    }
    
    const projectId = params.id;
    const currentUserId = session.user.id;
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
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
        const tasks = await prisma.task.findMany({
            where: { projectId: projectId },
            include: {
                assignee: {
                    select: {
                        id: true, name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        console.error('Error fetching tasks:', error);
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