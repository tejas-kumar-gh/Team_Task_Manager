import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const payload = { name: formData.name, email: formData.email };
      if (formData.password) payload.password = formData.password;
      await updateProfile(payload);
      setEditing(false);
      setFormData(prev => ({ ...prev, password: '' }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ name: user.name, email: user.email, password: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">My Profile</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-primary/30 text-sm font-medium"
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-all"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-5xl shadow-2xl ring-4 ring-[var(--background)] shrink-0">
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          
          {editing ? (
            <form onSubmit={handleSave} className="flex-1 space-y-5 w-full">
              <div>
                <label className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1 block">New Password <span className="opacity-50">(leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Min 6 characters"
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all disabled:opacity-60 w-full"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner loading-spinner-sm border-white/30 border-t-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex-1 space-y-6 w-full">
              <div>
                <h3 className="text-3xl font-bold mb-1 text-center md:text-left">{user.name}</h3>
                <p className="text-primary font-medium text-center md:text-left">{user.role}</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-[var(--color-glass-border)]">
                <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 bg-primary/20 text-primary rounded-lg mr-4">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-60">Full Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 bg-primary/20 text-primary rounded-lg mr-4">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-60">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="p-2 bg-primary/20 text-primary rounded-lg mr-4">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs opacity-60">Role & Permissions</p>
                    <p className="font-medium">{user.role} Access Level</p>
                  </div>
                </div>

                {user.createdAt && (
                  <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="p-2 bg-primary/20 text-primary rounded-lg mr-4">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs opacity-60">Member Since</p>
                      <p className="font-medium">{format(new Date(user.createdAt), 'MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
