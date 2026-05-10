import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmModal from '../components/ConfirmModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterMember, setFilterMember] = useState('All');

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
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      
      if (user?.role === 'Admin') {
        const usersRes = await api.get('/auth/users');
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
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

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        project: task.project?._id || task.project,
        assignedTo: task.assignedTo?._id || task.assignedTo || ''
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', project: '', assignedTo: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save task', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post(`/tasks/${selectedTask._id}/comments`, { text: commentText });
      setCommentText('');
      // Refresh selected task to show new comment
      const { data } = await api.get(`/tasks/${selectedTask._id}`);
      setSelectedTask(data);
      fetchData();
    } catch (error) {
      console.error('Failed to add comment', error);
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

  const handleDelete = (id) => {
    setTaskToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
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
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Tasks</h2>
            <p className="text-sm opacity-60">Track progress and collaborate on project tasks.</p>
          </div>
          {user?.role === 'Admin' && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-primary/30"
            >
              <Plus size={20} />
              <span>New Task</span>
            </button>
          )}
        </div>

        {/* Filters bar */}
        <div className="glass p-4 rounded-2xl flex flex-wrap gap-4 items-center border border-white/5">
          <div className="flex-1 min-w-[200px]">
             <input 
               type="text" 
               placeholder="Search tasks..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
             />
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            <option value="All" className="bg-[var(--background)]">All Status</option>
            <option value="Todo" className="bg-[var(--background)]">Todo</option>
            <option value="In Progress" className="bg-[var(--background)]">In Progress</option>
            <option value="Completed" className="bg-[var(--background)]">Completed</option>
            <option value="Overdue" className="bg-[var(--background)]">Overdue</option>
          </select>

          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            <option value="All" className="bg-[var(--background)]">All Priority</option>
            <option value="High" className="bg-[var(--background)]">High</option>
            <option value="Medium" className="bg-[var(--background)]">Medium</option>
            <option value="Low" className="bg-[var(--background)]">Low</option>
          </select>

          {user?.role === 'Admin' && (
            <select 
              value={filterMember} 
              onChange={(e) => setFilterMember(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="All" className="bg-[var(--background)]">All Members</option>
              {(users || []).map(u => <option key={u._id} value={u._id} className="bg-[var(--background)]">{u.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['Todo', 'In Progress', 'Completed'].map(status => (
          <div key={status} className="glass p-6 rounded-2xl flex flex-col h-[70vh] border border-white/5">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-white/10 flex justify-between items-center">
              {status}
              <span className="text-xs py-1 px-2 rounded-full bg-black/10 dark:bg-white/10">
                {(tasks || []).filter(t => t.status === status).length}
              </span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {(tasks || [])
                .filter(t => (status === 'All' || t.status === status))
                .filter(t => {
                  if (filterStatus === 'All') return true;
                  if (filterStatus === 'Overdue') {
                    return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed';
                  }
                  return t.status === filterStatus;
                })
                .filter(t => (filterPriority === 'All' || t.priority === filterPriority))
                .filter(t => (filterMember === 'All' || t.assignedTo?._id === filterMember || t.assignedTo === filterMember))
                .filter(t => t.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(t => status !== 'All' ? t.status === status : true)
                .map(task => (
                <div 
                  key={task._id} 
                  onClick={() => openTaskDetails(task)}
                  className="bg-white/5 dark:bg-black/20 border border-white/5 p-4 rounded-xl group relative hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5"
                >
                  {user?.role === 'Admin' && (
                    <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(task); }}
                        className="text-primary p-1 rounded-md hover:bg-primary/10"
                      >
                        <Calendar size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}
                        className="text-red-500 p-1 rounded-md hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3 pr-10">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 uppercase tracking-wider font-semibold animate-pulse">
                        Overdue
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary uppercase tracking-wider font-semibold">
                      {task.project?.title || 'No Project'}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{task.title}</h4>
                  <p className="text-xs opacity-60 mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-[10px] mt-auto">
                    <div className="flex items-center space-x-1 opacity-50">
                      <Calendar size={12} />
                      <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No date'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                       <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold" title={task.assignedTo?.name || 'Unassigned'}>
                        {(task.assignedTo?.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <select 
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="bg-black/20 border border-white/10 rounded px-1.5 py-0.5 focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="Todo" className="bg-[var(--background)]">Todo</option>
                        <option value="In Progress" className="bg-[var(--background)]">In Progress</option>
                        <option value="Completed" className="bg-[var(--background)]">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="glass p-8 rounded-3xl w-full max-w-lg bg-[var(--background)] max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/10">
            <h3 className="text-2xl font-bold mb-6">{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold opacity-70 mb-1.5">Task Title</label>
                <input
                  type="text" required
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 px-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold opacity-70 mb-1.5">Description</label>
                <textarea
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 px-4 focus:outline-none focus:border-primary focus:bg-white/10 transition-all min-h-[100px]"
                  placeholder="Provide more context..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold opacity-70 mb-1.5">Project</label>
                  <select required value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary">
                    <option value="">Select Project</option>
                    {(projects || []).map(p => <option key={p._id} value={p._id} className="bg-[var(--background)]">{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold opacity-70 mb-1.5">Assign To</label>
                  <select value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary">
                    <option value="">Select User</option>
                    {(users || []).map(u => <option key={u._id} value={u._id} className="bg-[var(--background)]">{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold opacity-70 mb-1.5">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary">
                    <option value="Low" className="bg-[var(--background)]">Low</option>
                    <option value="Medium" className="bg-[var(--background)]">Medium</option>
                    <option value="High" className="bg-[var(--background)]">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold opacity-70 mb-1.5">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary" />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 font-medium transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-100">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal with Comments */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass p-8 rounded-3xl w-full max-w-2xl bg-[var(--background)] max-h-[90vh] flex flex-col border border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">
                    {selectedTask.project?.title}
                  </span>
                </div>
                <h3 className="text-2xl font-bold">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-2xl opacity-50 hover:opacity-100">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
              <div>
                <h4 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2">Description</h4>
                <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                <div>
                  <h4 className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Assignee</h4>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                      {selectedTask.assignedTo?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-medium">{selectedTask.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Due Date</h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar size={14} className="opacity-50" />
                    <span>{selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'MMMM dd, yyyy') : 'No deadline'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold opacity-50 uppercase tracking-widest">Comments</h4>
                <div className="space-y-4">
                  {(selectedTask.comments || []).map((comment, i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold shrink-0">
                         {comment.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 bg-white/5 rounded-2xl p-3">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-xs font-bold">{comment.user?.name || 'User'}</span>
                           <span className="text-[10px] opacity-40">{format(new Date(comment.createdAt), 'MMM dd, HH:mm')}</span>
                        </div>
                        <p className="text-xs opacity-80">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  {(selectedTask.comments || []).length === 0 && (
                    <p className="text-xs opacity-40 text-center py-4 italic">No comments yet.</p>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleAddComment} className="mt-6 pt-4 border-t border-white/5">
               <div className="flex space-x-2">
                 <input 
                   type="text" 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   placeholder="Add a comment..."
                   className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                 />
                 <button 
                   type="submit"
                   className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors"
                 >
                   Post
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
};

export default Tasks;
