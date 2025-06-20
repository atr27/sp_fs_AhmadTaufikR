import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient, TaskStatus } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, {
            status: 401
        });
    }
    const taskId = params.id;
    const currentUserId = session.user.id;
    const { status } = await request.json();
    if (!status || !Object.values(TaskStatus).includes(status)) {
        return NextResponse.json({ message: 'Invalid task status provided' }, { status: 400 });
    }
    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } },
        });
        if (!task) {
            return NextResponse.json({ message: 'Task not found' }, {
                status: 404
            });
        }
        const project = task.project;
        const isOwner = project.ownerId === currentUserId;
        const isMember = project.members.some((member: any) => member.userId === currentUserId);
        if (!isOwner && !isMember) {
            return NextResponse.json({
                message:
                    'Forbidden: You do not have access to this project'
            }, {
                status: 403
            });
        }
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status: status },
        });
        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error('Error updating task status:', error);
        return NextResponse.json(
            {
                message: 'Something went wrong',
            },
            {
                status: 500
            }
        );
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, {
            status: 401
        });
    }
    const taskId = params.id;
    const currentUserId = session.user.id;
    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: { include: { members: true } },
                assignee: true
            },
        });
        if (!task) {
            return NextResponse.json({ message: 'Task not found' }, {
                status: 404
            });
        }
        const project = task.project;
        const isOwner = project.ownerId === currentUserId;
        const isMember = project.members.some((member: any) => member.userId === currentUserId);
        if (!isOwner && !isMember) {
            return NextResponse.json(
                {
                    message:
                        'Forbidden: You do not have access to this project'
                },
                {
                    status: 403
                }
            );
        }
        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json(
            {
                message: 'Something went wrong',
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
    const taskId = params.id;
    const currentUserId = session.user.id;
    const { title, description, assigneeId, status } = await
        request.json();
    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } },
        });
        if (!task) {
            return NextResponse.json(
                {
                    message: 'Task not found'
                },
                {
                    status: 404
                }
            );
        }
        const project = task.project;
        const isOwner = project.ownerId === currentUserId;
        const isMember = project.members.some((member: any) =>
            member.userId === currentUserId);
        if (!isOwner && !isMember) {
            return NextResponse.json(
                {
                    message:
                        'Forbidden: You do not have access to this project'
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
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                title: title ?? task.title,
                description: description ?? task.description,
                assigneeId: assigneeId === undefined ?
                    task.assigneeId : assigneeId,
                status: status ?? task.status,
            },
        });
        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error('Error updating task:', error);
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
    const taskId = params.id;
    const currentUserId = session.user.id;
    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } },
        });
        if (!task) {
            return NextResponse.json(
                {
                    message: 'Task not found'
                },
                {
                    status: 404
                }
            );
        }
        const project = task.project;
        const isOwner = project.ownerId === currentUserId;
        const isMember = project.members.some((member: any) =>
            member.userId === currentUserId);
        if (!isOwner && !isMember) {
            return NextResponse.json(
                {
                    message:
                        'Forbidden: You do not have access to this project'
                },
                {
                    status: 403
                }
            );
        }
        await prisma.task.delete({ where: { id: taskId } });
        return NextResponse.json(
            {
                message: 'Task deleted successfully'
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error('Error deleting task:', error);
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