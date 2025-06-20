import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json(
                {
                    message: 'Email and password are required'
                },
                { status: 400 }
            );
        }
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user || !(await bcrypt.compare(password,
            user.password))) {
            return NextResponse.json(
                {
                    message: 'Invalid credentials'
                },
                { status: 401 }
            );
        }
        const token = jwt.sign({
            userId: user.id, email:
                user.email
        }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        return NextResponse.json({
            message: 'Login successful',
            token
        }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                message: 'Something went wrong'
            },
            { status: 500 }
        );
    }
}