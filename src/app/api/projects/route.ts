import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, {
            status: 401
        });
    }
    const userId = session.user.id;
    const { title, description } = await request.json();
    if (!title) {
        return NextResponse.json(
            {
                message: 'Project title is required'
            },
            { status: 400 }
        );
    }
    try {
            const project = await prisma.project.create({
                data: {
                    title,
                    description,
                    ownerId: userId,
                },
            });
            return NextResponse.json(project, { status: 201 });
        } catch (error) {
            console.error('Error creating project:', error);
            return NextResponse.json(
                {
                    message: 'Something went wrong'
                },
                { status: 500 }
            );
        }
}

export async function GET(request: Request) {
            const session = await getServerSession(authOptions);
            if (!session || !session.user || !session.user.id) {
                return NextResponse.json({ message: 'Unauthorized' }, {
                    status: 401
                });
            }
            const userId = session.user.id;
            try {
                const projects = await prisma.project.findMany({
                    where: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId: userId } } }
                        ]
                    },
                    include: {
                        owner: true, members: {
                            include: {
                                user:
                                    true
                            }
                        }
                    }
                });
                return NextResponse.json(projects, { status: 200 });
            } catch (error) {
                console.error('Error fetching projects:', error);
                return NextResponse.json(
                    {
                        message: 'Something went wrong'
                    },
                    { status: 500 }
                );
            }
        }
