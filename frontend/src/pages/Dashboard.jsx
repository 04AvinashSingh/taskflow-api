// ═══════════════════════════════════════════
// Dashboard Page — Task management UI
// ═══════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { tasksAPI } from '../api/axios.js';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const FILTERS = [
  { label: 'All Tasks', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'DONE' },
];

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // View Mode: kanban or list (defaults to kanban)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskflow_view_mode') || 'kanban';
  });

  // Custom Delete Confirm Dialog States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch tasks ──────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Only apply status filters in 'list' view mode;
      // In 'kanban' mode we want to show all tasks distributed across columns
      if (viewMode === 'list' && filter) {
        params.status = filter;
      }
      params.limit = 100;

      const { data } = await tasksAPI.getAll(params);
      setTasks(data.data.tasks);
    } catch (err) {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter, viewMode, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── View mode switcher ────────────────────
  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('taskflow_view_mode', mode);
  };

  // ── Create task ──────────────────────────
  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await tasksAPI.create(formData);
      toast.success('Task created successfully.');
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit task ────────────────────────────
  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleUpdate = async (formData) => {
    if (!editingTask) return;
    setSubmitting(true);
    try {
      await tasksAPI.update(editingTask.id, formData);
      toast.success('Task updated successfully.');
      setModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete confirmation ──────────────────
  const handleDeleteClick = (taskId) => {
    setTaskIdToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskIdToDelete) return;
    setDeleting(true);
    try {
      await tasksAPI.delete(taskIdToDelete);
      toast.success('Task deleted successfully.');
      setTasks((prev) => prev.filter((t) => t.id !== taskIdToDelete));
      setDeleteConfirmOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task.';
      toast.error(msg);
    } finally {
      setDeleting(false);
      setTaskIdToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setDeleteConfirmOpen(false);
    setTaskIdToDelete(null);
  };

  // ── Close modal ──────────────────────────
  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  // ── Stats calculation ────────────────────
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  // Split tasks for Kanban columns
  const kanbanColumns = {
    PENDING: tasks.filter((t) => t.status === 'PENDING'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  return (
    <div className="dashboard" id="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {isAdmin ? 'Workspace Tasks' : 'My Workspace'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)', fontSize: '0.875rem' }}>
            {isAdmin
              ? 'Administrator workspace. Monitor and organize team items.'
              : 'Keep track of your current task pipeline.'}
          </p>
        </div>

        <div className="dashboard-controls">
          {/* View Switcher Toggle */}
          <div className="view-toggle-container">
            <button
              className={`view-toggle-btn${viewMode === 'kanban' ? ' active' : ''}`}
              onClick={() => handleViewChange('kanban')}
              title="Kanban Board View"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              Board
            </button>
            <button
              className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => handleViewChange('list')}
              title="Grid List View"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Grid
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}
            id="new-task-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Stats Cards with Custom Progress Bars */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-progress-bar-container">
            <div
              className="stat-progress-bar"
              style={{
                width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {stats.pending}
          </div>
          <div className="stat-label">Pending</div>
          <div className="stat-progress-bar-container">
            <div
              className="stat-progress-bar"
              style={{
                width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%`,
                backgroundColor: 'var(--color-warning)',
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>
            {stats.inProgress}
          </div>
          <div className="stat-label">In Progress</div>
          <div className="stat-progress-bar-container">
            <div
              className="stat-progress-bar"
              style={{
                width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%`,
                backgroundColor: 'var(--color-info)',
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {stats.done}
          </div>
          <div className="stat-label">Completed</div>
          <div className="stat-progress-bar-container">
            <div
              className="stat-progress-bar"
              style={{
                width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%`,
                backgroundColor: 'var(--color-success)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Render Filter Bar ONLY in List view mode */}
      {viewMode === 'list' && (
        <div className="filter-bar" id="filter-bar">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-btn${filter === f.value ? ' active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Rendering based on loading state & selected view mode */}
      {loading ? (
        <div className="loading-overlay">
          <span className="spinner spinner-lg" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="empty-state-title">
            {filter ? 'No tasks match this filter' : 'No tasks created yet'}
          </div>
          <p className="empty-state-text">
            {filter
              ? 'Try selecting a different status filter.'
              : 'Create your first task card to begin tracking your work.'}
          </p>
          {!filter && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create First Task
            </button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="kanban-board" id="kanban-board">
          {/* Columns */}
          <div className="kanban-column" id="column-pending">
            <div className="kanban-column-header">
              <h3 className="kanban-column-title">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)' }}></span>
                Pending
              </h3>
              <span className="kanban-column-count">{kanbanColumns.PENDING.length}</span>
            </div>
            <div className="kanban-cards-container">
              {kanbanColumns.PENDING.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  showUser={isAdmin}
                />
              ))}
            </div>
          </div>

          <div className="kanban-column" id="column-progress">
            <div className="kanban-column-header">
              <h3 className="kanban-column-title">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-info)' }}></span>
                In Progress
              </h3>
              <span className="kanban-column-count">{kanbanColumns.IN_PROGRESS.length}</span>
            </div>
            <div className="kanban-cards-container">
              {kanbanColumns.IN_PROGRESS.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  showUser={isAdmin}
                />
              ))}
            </div>
          </div>

          <div className="kanban-column" id="column-done">
            <div className="kanban-column-header">
              <h3 className="kanban-column-title">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                Completed
              </h3>
              <span className="kanban-column-count">{kanbanColumns.DONE.length}</span>
            </div>
            <div className="kanban-cards-container">
              {kanbanColumns.DONE.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  showUser={isAdmin}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* GRID LIST VIEW */
        <div className="task-grid" id="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              showUser={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          loading={submitting}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}
