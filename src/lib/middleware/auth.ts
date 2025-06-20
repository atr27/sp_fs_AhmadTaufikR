import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends NextRequest {
    user?: { userId: string; email: string };
}

export function authMiddleware(handler: Function) {
    return async (req: AuthenticatedRequest, res: NextResponse) => {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                {
                    message: 'No token provided'
                },
                { status: 401 }
            );
        }
        try {
            const decoded = jwt.verify(token,
                process.env.JWT_SECRET!) as { userId: string; email: string };
            req.user = decoded; // Attach user info to request
            return handler(req, res);
        } catch (error) {
            return NextResponse.json(
                {
                    message: 'Invalid token'
                },
                {
                    status: 403
                }
            );
        }
    };
}