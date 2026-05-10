import { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Shield, User as UserIcon } from 'lucide-react';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/auth/users');
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch team members', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="animate-pulse">Loading team members...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => (
          <div key={user._id} className="glass p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
              {(user.name?.charAt(0) || '?').toUpperCase()}
            </div>
            <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
            <div className="flex items-center text-sm opacity-70 mb-4">
              <Mail size={14} className="mr-2" />
              {user.email}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
              {user.role === 'Admin' ? <Shield size={12} className="mr-1" /> : <UserIcon size={12} className="mr-1" />}
              {user.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
