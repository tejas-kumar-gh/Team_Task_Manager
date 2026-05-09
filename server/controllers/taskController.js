import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  let tasks;
  if (req.user.role === 'Admin') {
    tasks = await Task.find({}).populate('assignedTo', 'name').populate('project', 'title');
  } else {
    tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name').populate('project', 'title');
  }
  res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  const task = new Task({
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo,
    project,
    createdBy: req.user._id
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
});

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('assignedTo', 'name').populate('project', 'title');

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
      task.title = title || task.title;
      task.description = description || task.description;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
      task.assignedTo = assignedTo || task.assignedTo;
      task.project = project || task.project;
    }
    
    // Both Admin and Member can update status
    task.status = status || task.status;

    const updatedTask = await task.save();
    res.json(updatedTask);
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
    totalProjects = await import('../models/Project.js').then(m => m.default.countDocuments({}));
  } else {
    totalProjects = await import('../models/Project.js').then(m => m.default.countDocuments({ members: req.user._id }));
  }

  res.json({
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks
  });
});

export { getTasks, createTask, getTaskById, updateTask, deleteTask, getDashboardStats };
