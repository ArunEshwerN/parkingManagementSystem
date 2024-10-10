import { useState } from 'react';
import { api } from './services/api';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Link } from 'react-router-dom';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.signup({ name, username, email, password });
            if (response.status === 201) {
                alert('Signup successful');
                // Redirect to login page
            }
        } catch (error) {
            console.error('Signup failed', error);
            setError('Signup failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Sign Up</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-text-light">Name</Label>
                            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium text-text-light">Username</Label>
                            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="input" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-text-light">Email (Gmail only)</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} pattern="[a-zA-Z0-9._%+-]+@gmail\.com$" required className="input" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-text-light">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input" />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="btn-primary w-full">
                            Sign Up
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <Link to="/" className="text-primary hover:underline text-sm">
                        Already have an account? Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}