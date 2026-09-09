import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const ROLES = [
  'Architect',
  'Builder / Contractor',
  'Sustainability Engineer',
  'Engineering Student',
  'Institution / Academic',
  'Homeowner'
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Architect');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.userMessage || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 text-center mb-1">
        Create Your Account
      </h2>
      <p className="text-xs text-slate-500 text-center mb-6">
        Join architects and builders making data-driven sustainability decisions
      </p>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          required
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={User}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="jane@studio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
        />

        <Input
          label="Password (min. 6 chars)"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
        />

        <Select
          label="Professional Role"
          options={ROLES}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          icon={UserPlus}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-forest-800 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
