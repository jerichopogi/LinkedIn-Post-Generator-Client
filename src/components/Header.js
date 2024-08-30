// src/components/Header.js
import React from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/login'); // Redirect to login page after successful logout
    }
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-gray-800 text-white">
      <h1 className="text-3xl font-bold">Linkedin Post Generator</h1>
      {user && (
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
