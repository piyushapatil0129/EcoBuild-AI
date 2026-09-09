import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.userMessage || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@ecobuild.ai');
    setPassword('password123');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 text-center mb-1">
        Sign in to EcoBuild AI
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6">
        Access your sustainability assessments and design optimizations
      </p>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="name@architecture.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full py-2 px-3 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          Quick Demo Credentials (demo@ecobuild.ai)
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-forest-800 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
