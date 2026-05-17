import React, { useState } from 'react';
import axiosInstance from '../../services/axiosInstance';

const AdminMakeUser: React.FC = () => {
  const [email, setEmail] = useState('m.abdo@tieapps.com');
  const [firstName, setFirstName] = useState('Mohamed');
  const [lastName, setLastName] = useState('Abdo');
  const [password, setPassword] = useState('TempP@ssw0rd1');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/create-admin', {
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setMessage(`Admin created: ${data?.email || email}`);
    } catch (err: any) {
      console.error(err);
      const serverMsg = err?.response?.data?.error || err?.message || 'Failed to create admin';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Create Admin User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">First name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Temp password</label>
          <input className="mt-1 w-full border rounded px-3 py-2" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className={`w-full py-2 text-white rounded ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {loading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
};

export default AdminMakeUser;


