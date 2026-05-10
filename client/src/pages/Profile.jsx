import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-8">My Profile</h2>
      
      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-5xl shadow-2xl ring-4 ring-[var(--background)]">
            {(user.name?.charAt(0) || '?').toUpperCase()}
          </div>
          
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
