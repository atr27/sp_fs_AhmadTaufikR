import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

interface User {
  email: string;
  // Add other user properties here as needed
  [key: string]: any; // For any additional properties that might be in the JWT
}

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwt.decode(token) as any;
                setUser(decodedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                router.push('/login');
            }
        } else {
            setIsAuthenticated(false);
            router.push('/login');
        }
    }, [router]);
    return { isAuthenticated, user };
}