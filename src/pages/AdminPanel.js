import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header';

const AdminPanel = () => {
  const { user, role } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch only users with the role 'user'
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'user');
        
        if (error) {
          throw error;
        }

        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users.');
      }
    };

    // Only fetch users if the current user is an admin
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const handleDeleteUser = async (userId) => {
    try {
      console.log('Attempting to delete user with ID:', userId); // Log user ID
  
      // Call the server-side API to delete the user
      const response = await fetch(`https://linked-in-post-generator-server.vercel.app/delete-user/${userId}`, {
        method: 'DELETE',
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Error deleting user from server:', result.message);
        setError(`Failed to delete user: ${result.message}`);
        return;
      }
  
      console.log('User deleted successfully:', userId); // Log successful deletion
  
      // Update the users state after successful deletion
      setUsers(users.filter((u) => u.id !== userId));
      setSuccessMessage('User deleted successfully from both authentication and users table.');
    } catch (error) {
      console.error('Unexpected error deleting user:', error);
      setError('Unexpected error occurred while deleting user.');
    }
  };
  
  

  const handleReloadArticles = () => {
    // Placeholder for reload articles functionality
    alert('Articles reload triggered!');
  };

  // Redirect if not an admin
  if (!user || role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Registration Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-700">
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Actions</h2>
          <button
            onClick={handleReloadArticles}
            className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded transition-colors"
          >
            Reload Articles
          </button>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
