import { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Shield, User as UserIcon, Search } from 'lucide-react';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/auth/users');
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch team members', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = (users || []).filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-sm opacity-60">{users.length} member{users.length !== 1 ? 's' : ''} in your organization</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
          <input 
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="glass p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
            <div className="flex items-center text-sm opacity-70 mb-4">
              <Mail size={14} className="mr-2" />
              <span className="truncate max-w-[180px]">{user.email}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
              {user.role === 'Admin' ? <Shield size={12} className="mr-1" /> : <UserIcon size={12} className="mr-1" />}
              {user.role}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl border border-dashed border-white/10">
          <UserIcon size={48} className="mx-auto mb-4 opacity-20" />
          <p className="opacity-60 text-lg">
            {searchTerm ? 'No members match your search.' : 'No team members found.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Team;
