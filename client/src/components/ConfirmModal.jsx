import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass p-8 rounded-3xl w-full max-w-sm bg-[var(--background)] shadow-2xl border border-white/10 text-center">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="opacity-70 text-sm mb-8">{message}</p>
        
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-100 ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary-dark shadow-primary/20'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
