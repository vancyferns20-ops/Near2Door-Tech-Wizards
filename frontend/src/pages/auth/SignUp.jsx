import React, { useState } from 'react';
import useForm from '../../hooks/UseForm';
import api from '../../api/api';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';

const SignUp = ({ onNavigate }) => {
  const { login } = useAuth();
  const [authError, setAuthError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validate = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Name is required';
    if (!values.email) errors.email = 'Email is required';
    if (!values.password) errors.password = 'Password is required';
    if (!values.role) errors.role = 'Role is required';
    if (values.role === 'shop') {
      if (!values.shopName) errors.shopName = 'Shop name is required';
      if (!values.shopLocation) errors.shopLocation = 'Shop location is required';
    }
    return errors;
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    { name: '', email: '', password: '', role: 'customer', shopName: '', shopType: '', shopLocation: '', shopDescription: '', shopProfileImage: '' },
    validate
  );

  const onSubmit = async (vals) => {
    // build payload and include shop metadata when registering as a shop
    const payload = { name: vals.name, email: vals.email, password: vals.password, role: vals.role };
    if (vals.role === 'shop') {
      payload.shop = {
        name: vals.shopName,
        type: vals.shopType,
        location: vals.shopLocation,
        description: vals.shopDescription,
        profileImage: vals.shopProfileImage,
      };
    }

    const { response, data } = await api.register(payload);
    if (response.ok) {
      // For agent or shop, show message and don't sign in
      if (data.user.role === 'shop' || data.user.role === 'agent') {
        setSubmitted(true);
      } else if (data.user.role === 'customer') {
        login(data.user, data.token);
        onNavigate('customer-dashboard');
      } else if (data.user.role === 'admin') {
        login(data.user, data.token);
        onNavigate('admin-dashboard');
      } else {
        login(data.user, data.token);
        onNavigate('landing');
      }
    } else {
      setAuthError(data.error || 'Registration failed');
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-8 text-center shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold text-lime-400">Application Submitted!</h2>
      <div className="mb-4 text-gray-300">
            Thank you for signing up.<br />
            Your account will be reviewed by an admin.<br />
            Please check back in 24 hours to login.
          </div>
          <Button onClick={() => onNavigate('landing')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-8 shadow-2xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-lime-400">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" name="name" type="text" value={values.name} onChange={handleChange} error={errors.name} />
          <Input label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} />
          <Input label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} />
          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-200 text-sm font-bold mb-2">Role</label>
            <select
              name="role"
              id="role"
              value={values.role}
              onChange={handleChange}
              className={`shadow appearance-none rounded-xl w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all duration-300 bg-slate-700 text-white border-2 ${errors.role ? 'border-red-500' : 'border-slate-600'}`}
            >
              <option value="customer">Customer</option>
              <option value="shop">Shop</option>
              <option value="agent">Delivery Agent</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs italic mt-1">{errors.role}</p>}
          </div>

          {values.role === 'shop' && (
            <div className="mb-6 space-y-3">
              <Input label="Shop Name" name="shopName" type="text" value={values.shopName} onChange={handleChange} error={errors.shopName} />
              <Input label="Shop Type" name="shopType" type="text" value={values.shopType} onChange={handleChange} error={errors.shopType} />
              <Input label="Location" name="shopLocation" type="text" value={values.shopLocation} onChange={handleChange} error={errors.shopLocation} />
              <Input label="Profile Image URL" name="shopProfileImage" type="text" value={values.shopProfileImage} onChange={handleChange} error={errors.shopProfileImage} />
              <div>
                <label className="block text-gray-200 text-sm font-bold mb-2">Description</label>
                <textarea name="shopDescription" value={values.shopDescription} onChange={handleChange} className="w-full rounded-xl bg-slate-700 text-white p-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-400" />
              </div>
            </div>
          )}
          <Button type="submit" disabled={Object.keys(errors).length > 0}>Sign Up</Button>
        </form>
        {authError && <div className="mt-4 text-center text-red-400">{authError}</div>}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <button onClick={() => onNavigate('signin')} className="font-semibold text-lime-400 hover:text-lime-300">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;