import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Layers, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmModal from '../components/ConfirmModal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  
  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [formData, setFormData] = useState({ title: '', description: '', members: [], dueDate: '' });

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects'),
        user?.role === 'Admin' ? api.get('/auth/users') : Promise.resolve({ data: [] })
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || '',
        dueDate: project.dueDate ? format(new Date(project.dueDate), 'yyyy-MM-dd') : '',
        members: project.members.map(m => typeof m === 'object' ? m._id : m)
      });
    } else {
      setEditingProject(null);
      setFormData({ title: '', description: '', members: [], dueDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save project', error);
    }
  };

  const handleDelete = (id) => {
    setProjectToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/projects/${projectToDelete}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  if (loading) return <div className="animate-pulse">Loading projects...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-sm opacity-60">Manage your team's workspace and projects.</p>
        </div>
        <div className="flex w-full md:w-auto space-x-3">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          {user?.role === 'Admin' && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-primary/30"
            >
              <Plus size={20} />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => (
          <div key={project._id} className="glass p-6 rounded-2xl group hover:-translate-y-1 transition-all duration-300 relative border border-white/5 hover:border-primary/30">
            {user?.role === 'Admin' && (
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(project)}
                  className="text-primary bg-primary/10 p-2 rounded-lg hover:bg-primary/20"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(project._id)}
                  className="text-red-500 bg-red-500/10 p-2 rounded-lg hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <h3 className="text-xl font-semibold mb-2 pr-20">{project.title}</h3>
            <p className="opacity-70 text-sm mb-6 line-clamp-3 min-h-[4.5rem]">{project.description || 'No description provided.'}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2 overflow-hidden">
                {project.members.slice(0, 4).map((member, i) => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-[10px] text-white font-bold" title={member.name || 'Member'}>
                    {(member.name || 'M').charAt(0).toUpperCase()}
                  </div>
                ))}
                {project.members.length > 4 && (
                  <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-background bg-white/10 text-[10px] font-bold">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider opacity-50">Deadline</p>
                <p className={`text-xs font-medium ${project.dueDate && new Date(project.dueDate) < new Date() ? 'text-red-500' : ''}`}>
                  {project.dueDate ? format(new Date(project.dueDate), 'MMM dd, yyyy') : 'No deadline'}
                </p>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-20 glass rounded-3xl border border-dashed border-white/10">
            <Layers size={48} className="mx-auto mb-4 opacity-20" />
            <p className="opacity-60 text-lg">No projects found.</p>
            {user?.role === 'Admin' && <p className="text-sm opacity-40">Click "New Project" to create your first workspace.</p>}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass p-8 rounded-3xl w-full max-w-lg bg-[var(--background)] max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-white/10">
            <h3 className="text-2xl font-bold mb-6">{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold opacity-80 mb-2">Project Title</label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                  placeholder="e.g. E-Commerce Website"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold opacity-80 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all min-h-[120px]"
                  placeholder="Describe the project goals and scope..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold opacity-80 mb-2">Project Deadline</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold opacity-80 mb-3">Assign Team Members</label>
                <div className="mb-3">
                  <input 
                    type="text" 
                    placeholder="Search members..." 
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-2 rounded-2xl bg-black/10 custom-scrollbar">
                  {users
                    .filter(u => u.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(memberSearchTerm.toLowerCase()))
                    .map(u => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => toggleMember(u._id)}
                      className={`flex items-center p-3 rounded-xl border transition-all text-left ${
                        formData.members.includes(u._id)
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-white/5 bg-white/5 hover:bg-white/10 opacity-70'
                      }`}
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] mr-2">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium truncate">{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
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
        title="Delete Project"
        message="Are you sure you want to delete this project? All related tasks will also be permanently removed."
      />
    </div>
  );
};

export default Projects;
