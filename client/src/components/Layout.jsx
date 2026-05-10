import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, User, Moon, Sun, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    ...(user?.role === 'Admin' ? [{ name: 'Team', path: '/team', icon: <Users size={20} /> }] : []),
  ];

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    const segment = location.pathname.split('/')[1];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 glass border-r flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              TeamSync
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-[var(--color-glass-border)]'}`}
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6 border-t border-[var(--color-glass-border)] space-y-4">
          <Link to="/profile" className="flex items-center space-x-3 px-4 py-2 hover:bg-[var(--color-glass-border)] rounded-xl transition-colors">
            <User size={20} />
            <span>Profile</span>
          </Link>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[var(--color-glass-border)] rounded-xl transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        
        <header className="flex justify-between items-center mb-8 glass px-4 lg:px-6 py-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Menu size={22} />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs opacity-70">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        </header>

        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
