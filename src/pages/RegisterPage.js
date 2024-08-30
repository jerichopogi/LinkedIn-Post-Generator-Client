import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data: { user }, error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;

      // Step 2: Insert the new user into the 'users' table
      if (user) {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: user.id,  // Use the user's ID from Supabase Auth
            email: user.email,  // Use the user's email from Supabase Auth
            role: 'user',  // Default role, change if needed
          },
        ]);

        if (insertError) throw insertError;
      }

      // Navigate to login page after successful registration and insertion
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-semibold transition-colors"
          >
            Register
          </button>
        </form>
        <p className="text-center mt-6">
          <a href="/login" className="text-indigo-400 hover:underline">
            Already have an account? Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
