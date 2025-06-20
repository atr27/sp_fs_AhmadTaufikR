import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../api/auth/[...nextauth]/route';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        console.log('GET /api/projects/[id]/members - Started');

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.log('GET /api/projects/[id]/members - Unauthorized: No session or user ID');
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
                { status: 401 }
            );
        }

        const projectId = params.id;
        const currentUserId = session.user.id;

        console.log(`GET /api/projects/${projectId}/members - User ID: ${currentUserId}`);

        try {
            // Verify the current user is a member of the project
            const isMember = await prisma.projectMember.findFirst({
                where: {
                    projectId,
                    userId: currentUserId,
                },
            });

            if (!isMember) {
                console.log(`GET /api/projects/${projectId}/members - Forbidden: User ${currentUserId} is not a member of project ${projectId}`);
                return NextResponse.json(
                    { error: 'Forbidden', message: 'You are not a member of this project' },
                    { status: 403 }
                );
            }


            // Fetch project details to get the ownerId
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { ownerId: true },
            });

            if (!project) {
                console.log(`GET /api/projects/${projectId}/members - Project not found`);
                return NextResponse.json(
                    { error: 'Not Found', message: 'Project not found' },
                    { status: 404 }
                );
            }


            // Get all members of the project with their user details
            console.log(`GET /api/projects/${projectId}/members - Fetching members`);
            const members = await prisma.projectMember.findMany({
                where: { projectId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            const formattedMembers = members.map((member) => ({
                id: member.user.id,
                email: member.user.email,
                name: member.user.name,
                role: member.user.id === project.ownerId ? 'Owner' : 'Member',
            }));

            console.log(`GET /api/projects/${projectId}/members - Success: Found ${formattedMembers.length} members`);
            return NextResponse.json(formattedMembers);

        } catch (dbError) {
            console.error('Database error in GET /api/projects/[id]/members:', dbError);
            const errorMessage = dbError instanceof Error ? dbError.message : 'An unknown database error occurred';
            return NextResponse.json(
                {
                    error: 'Database Error',
                    message: 'Failed to fetch project members',
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Unexpected error in GET /api/projects/[id]/members:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request, { params }: {
    params: { id: string }
}) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, {
            status: 401
        });
    }
    const projectId = params.id;
    const { userId: invitedUserId } = await request.json();
    const currentUserId = session.user.id;
    if (!invitedUserId) {
        return NextResponse.json(
            {
                message: 'User ID to invite is required'
            },
            {
                status: 400
            }
        );
    }
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true },
        });
        if (!project || project.ownerId !== currentUserId) {
            return NextResponse.json(
                {
                    message: 'Forbidden: Only project owner can invite members'
                },
                {
                    status: 403
                }
            );
        }
        const existingMember = await
            prisma.projectMember.findUnique({
                where: {
                    userId_projectId: {
                        userId: invitedUserId,
                        projectId: projectId,
                    },
                },
            });
        if (existingMember) {
            return NextResponse.json(
                {
                    message: 'User is already a member of this project'
                },
                {
                    status: 409
                }
            );
        }
        const projectMember = await prisma.projectMember.create({
            data: {
                userId: invitedUserId,
                projectId: projectId,
            },
        });

        return NextResponse.json(projectMember, { status: 201 });
    } catch (error) {
        console.error('Error inviting member:', error);
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
        return NextResponse.json({ message: 'Unauthorized' }, {
            status: 401
        });
    }
    const projectId = params.id;
    const { userId: memberToRemoveId } = await request.json();
    const currentUserId = session.user.id;
    if (!memberToRemoveId) {
        return NextResponse.json(
            {
                message: 'User ID to remove is required'
            },
            {
                status: 400
            }
        );
    }
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true },
        });
        if (!project || project.ownerId !== currentUserId) {
            return NextResponse.json(
                {
                    message: 'Forbidden: Only project owner can remove members'
                },
                {
                    status: 403
                }
            );
        }

        if (memberToRemoveId === currentUserId) {
            return NextResponse.json({
                message:
                    'Cannot remove project owner from members'
            }, { status: 400 });
        }

        await prisma.projectMember.delete({
            where: {
                userId_projectId: {
                    userId: memberToRemoveId,
                    projectId: projectId,
                },
            },
        });
        return NextResponse.json(
            {
                message: 'Member removed successfully'
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error('Error removing member:', error);
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