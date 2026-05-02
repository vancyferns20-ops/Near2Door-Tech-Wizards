import React, { useState } from 'react';
import useForm from '../../hooks/UseForm';
import api from '../../api/api';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';

const SignIn = ({ onNavigate }) => {
  const { login } = useAuth();
  const [authError, setAuthError] = useState('');

  const validate = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email address is invalid';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    validate
  );

  const onSubmit = async (vals) => {
    const { response, data } = await api.login(vals);
    if (response.ok) {
      login(data.user, data.token);

      // ✅ Updated redirect logic for all user roles
      switch (data.user.role) {
        case 'shop':
          onNavigate('shop-dashboard');
          break;
        case 'customer':
          onNavigate('customer-dashboard');
          break;
        case 'admin':
          onNavigate('admin-dashboard');
          break;
        case 'agent':
          onNavigate('agent-dashboard');
          break;
        default:
          onNavigate('landing'); // fallback
      }
    } else {
      setAuthError(data.error || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-8 shadow-2xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-lime-400">
          Sign In
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          {authError && (
            <p className="text-red-500 text-center text-sm mb-4">{authError}</p>
          )}
          <Button type="submit" disabled={Object.keys(errors).length > 0}>
            Sign In
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="font-semibold text-lime-400 hover:text-lime-300"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
