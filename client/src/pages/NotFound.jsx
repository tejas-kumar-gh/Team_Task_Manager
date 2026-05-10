import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] relative overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-70"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] opacity-70"></div>
      
      <div className="text-center z-10 px-6">
        <h1 className="text-[120px] font-extrabold leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
        <p className="opacity-60 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-medium"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 transition-all font-medium"
          >
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
