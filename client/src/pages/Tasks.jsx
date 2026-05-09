import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium',
    dueDate: '', project: '', assignedTo: ''
  });

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      
      if (user?.role === 'Admin') {
        const usersRes = await api.get('/auth/users');
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', project: '', assignedTo: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return '';
    }
  };

  if (loading) return <div className="animate-pulse">Loading tasks...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-primary/30"
          >
            <Plus size={20} />
            <span>New Task</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['Todo', 'In Progress', 'Completed'].map(status => (
          <div key={status} className="glass p-6 rounded-2xl flex flex-col h-[70vh]">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-[var(--color-glass-border)] flex justify-between items-center">
              {status}
              <span className="text-xs py-1 px-2 rounded-full bg-black/10 dark:bg-white/10">
                {tasks.filter(t => t.status === status).length}
              </span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} className="bg-white/5 dark:bg-black/20 border border-white/10 p-4 rounded-xl group relative hover:border-primary/50 transition-colors">
                  {user?.role === 'Admin' && (
                    <button 
                      onClick={() => handleDelete(task._id)}
                      className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3 pr-6">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary uppercase tracking-wider font-semibold">
                      {task.project?.title || 'No Project'}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1">{task.title}</h4>
                  <p className="text-sm opacity-70 mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs mt-auto">
                    <div className="flex items-center space-x-1 opacity-70">
                      <Calendar size={14} />
                      <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No date'}</span>
                    </div>
                    
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="bg-transparent border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-primary cursor-pointer text-xs"
                    >
                      <option value="Todo" className="bg-[var(--background)]">Todo</option>
                      <option value="In Progress" className="bg-[var(--background)]">In Progress</option>
                      <option value="Completed" className="bg-[var(--background)]">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass p-8 rounded-3xl w-full max-w-lg bg-[var(--background)] max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Create New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium opacity-80 mb-1">Title</label>
                <input
                  type="text" required
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium opacity-80 mb-1">Description</label>
                <textarea
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-1">Project</label>
                  <select required value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id} className="bg-[var(--background)]">{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-1">Assign To</label>
                  <select value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary">
                    <option value="">Select User</option>
                    {users.map(u => <option key={u._id} value={u._id} className="bg-[var(--background)]">{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-1">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary">
                    <option value="Low" className="bg-[var(--background)]">Low</option>
                    <option value="Medium" className="bg-[var(--background)]">Medium</option>
                    <option value="High" className="bg-[var(--background)]">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-1">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-primary" />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/30">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
