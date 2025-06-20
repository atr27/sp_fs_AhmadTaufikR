import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }
        const existingUser = await prisma.user.findUnique({
            where:
                { email }
        });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User with this email already exists' }, 
                { status: 409 }
            );
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                },
            });
            return NextResponse.json(
                {
                    message: 'User registered successfully', 
                    user: { id: user.id, email: user.email, name: user.name } 
                }, 
                { status: 201 }
            );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Something went wrong' }, 
            { status: 500 }
        );
    }
}

