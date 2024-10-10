import { useState } from 'react';
import { api } from './services/api';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.forgotPassword(email);
            setMessage('If an account exists for this email, password reset instructions have been sent.');
        } catch (error) {
            console.error('Failed to send reset instructions', error);
            setMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Forgot Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-text-light">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input"
                            />
                        </div>
                        <Button type="submit" className="btn-primary w-full">
                            Send Reset Link
                        </Button>
                    </form>
                    {message && <p className="mt-4 text-center text-sm text-text-light">{message}</p>}
                </CardContent>
                <CardFooter className="justify-center">
                    <Link to="/" className="text-primary hover:underline text-sm">
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
