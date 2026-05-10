import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  let tasks;
  if (req.user.role === 'Admin') {
    tasks = await Task.find({})
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });
  } else {
    tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });
  }
  res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Task title is required');
  }

  if (!project) {
    res.status(400);
    throw new Error('Project is required');
  }

  const task = new Task({
    title: title.trim(),
    description: description?.trim(),
    status,
    priority,
    dueDate,
    assignedTo: assignedTo || undefined,
    project,
    createdBy: req.user._id
  });

  const createdTask = await task.save();
  
  // Return populated task
  const populatedTask = await Task.findById(createdTask._id)
    .populate('assignedTo', 'name email')
    .populate('project', 'title');
  
  res.status(201).json(populatedTask);
});

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('project', 'title')
    .populate('comments.user', 'name email');

  if (task) {
    if (req.user.role !== 'Admin' && (!task.assignedTo || !task.assignedTo._id.equals(req.user._id))) {
      res.status(403);
      throw new Error('Not authorized to view this task');
    }
    res.json(task);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  const task = await Task.findById(req.params.id);

  if (task) {
    if (req.user.role !== 'Admin' && (!task.assignedTo || !task.assignedTo.equals(req.user._id))) {
       res.status(403);
       throw new Error('Not authorized to update this task');
    }

    if (req.user.role === 'Admin') {
      task.title = title?.trim() || task.title;
      task.description = description !== undefined ? description.trim() : task.description;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
      task.assignedTo = assignedTo || task.assignedTo;
      task.project = project || task.project;
    }
    
    // Both Admin and Member can update status
    if (status) {
      task.status = status;
    }

    const updatedTask = await task.save();
    
    // Return populated task
    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('comments.user', 'name');
    
    res.json(populatedTask);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role !== 'Admin') {
    query.assignedTo = req.user._id;
  }

  const tasks = await Task.find(query);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Todo' || t.status === 'In Progress').length;
  
  const now = new Date();
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed').length;

  let totalProjects = 0;
  if (req.user.role === 'Admin') {
    totalProjects = await Project.countDocuments({});
  } else {
    totalProjects = await Project.countDocuments({ members: req.user._id });
  }

  // Calculate real completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate average completion time (days) for completed tasks
  const completedTaskDocs = tasks.filter(t => t.status === 'Completed' && t.createdAt);
  let avgCompletionDays = 0;
  if (completedTaskDocs.length > 0) {
    const totalDays = completedTaskDocs.reduce((sum, t) => {
      const created = new Date(t.createdAt);
      const updated = new Date(t.updatedAt);
      return sum + (updated - created) / (1000 * 60 * 60 * 24);
    }, 0);
    avgCompletionDays = Math.round((totalDays / completedTaskDocs.length) * 10) / 10;
  }

  let stats = {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    completionRate,
    avgCompletionDays,
  };

  if (req.user.role === 'Admin') {
    stats.totalUsers = await User.countDocuments({});
  }

  res.json(stats);
});

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const task = await Task.findById(req.params.id);

  if (task) {
    const comment = {
      text: text.trim(),
      user: req.user._id
    };

    task.comments.push(comment);
    await task.save();

    // Return the full task with populated comments
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('comments.user', 'name email');

    res.status(201).json(populatedTask);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

export { getTasks, createTask, getTaskById, updateTask, deleteTask, getDashboardStats, addComment };
