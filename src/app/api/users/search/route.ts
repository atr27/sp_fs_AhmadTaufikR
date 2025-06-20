import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
                NOT: {
                    id: session.user.id, // Exclude the current user from the results
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            take: 10, // Limit the number of results
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error searching for users:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}