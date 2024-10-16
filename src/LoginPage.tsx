import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './services/api';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Link } from 'react-router-dom';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.login({ identifier, password });
            if (response.data) {
                console.log('Login successful', response.data);
                // Store the user ID in localStorage or a state management solution
                localStorage.setItem('userId', response.data.user_id.toString());
                // Redirect to the dashboard after successful login
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login failed', error);
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 animate-fade-in">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="identifier" className="text-sm font-medium text-text-light">Username or Email</Label>
                            <Input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-text-light">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="btn-primary w-full">
                            Log In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Link to="/forgot-password" className="text-primary hover:underline text-sm">
                        Forgot Password?
                    </Link>
                    <Link to="/signup" className="text-secondary hover:underline text-sm">
                        Don't have an account? Sign Up
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}