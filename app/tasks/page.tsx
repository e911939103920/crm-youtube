'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit2, Trash2, Calendar, Flag, CheckCircle2, Circle } from 'lucide-react'
import { useStore, Task } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { NotificationContainer } from '@/components/Notification'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'

type FilterType = 'all' | 'active' | 'completed' | 'due-soon'
type SortType = 'priority' | 'due-date' | 'created'

export default function TasksPage() {
  const { tasks, isAuthenticated, fetchTasks, addTask, updateTask, deleteTask, toggleTaskComplete, leads } = useStore()
  const { notifications, success, error, dismissNotification } = useNotifications()
  const { loading: authLoading } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('due-date')

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTasks()
    }
  }, [authLoading, isAuthenticated, fetchTasks])

  if (authLoading) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-sm text-[#666666] dark:text-[#999999]">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.is_complete
    if (filter === 'active') return !task.is_complete
    if (filter === 'due-soon') {
      if (task.is_complete || !task.due_date) return false
      const dueDate = new Date(task.due_date)
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      return dueDate <= weekFromNow
    }
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    if (sort === 'due-date') {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData)
        success('Task updated successfully')
      } else {
        await addTask({
          title: taskData.title || '',
          description: taskData.description,
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date,
          related_lead_ids: taskData.related_lead_ids || [],
          is_complete: false,
        })
        success('Task created successfully')
      }
      setIsModalOpen(false)
      setEditingTask(null)
    } catch (err) {
      error('Failed to save task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id)
        success('Task deleted successfully')
      } catch (err) {
        error('Failed to delete task')
      }
    }
  }

  const handleToggleComplete = async (id: string) => {
    try {
      await toggleTaskComplete(id)
      const task = tasks.find(t => t.id === id)
      if (task?.is_complete) {
        success('Task completed!')
      }
    } catch (err) {
      error('Failed to update task')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-amber-500'
      case 'low': return 'border-l-blue-500'
      default: return 'border-l-[#E5E5E5]'
    }
  }

  const getRelatedLeads = (leadIds: string[]) => {
    return leads.filter(lead => leadIds.includes(lead.id))
  }

  return (
    <div className="min-h-screen pt-14 bg-white dark:bg-[#0A0A0A]">
      <Navbar />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8 lg:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Tasks</h1>
            <p className="text-sm text-[#666666] dark:text-[#999999]">Manage your to-dos and track progress</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              setEditingTask(null)
              setIsModalOpen(true)
            }}
            className="btn-primary px-4 py-2 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </motion.button>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex gap-2">
            {(['all', 'active', 'completed', 'due-soon'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  filter === f
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-[#FAFAFA] dark:bg-[#141414] text-[#666666] dark:text-[#999999] hover:bg-[#E5E5E5] dark:hover:bg-[#2A2A2A]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="px-3 py-1.5 text-sm card"
          >
            <option value="due-date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {sortedTasks.map((task) => {
            const relatedLeads = getRelatedLeads(task.related_lead_ids)
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: task.is_complete ? 0.6 : 1, y: 0 }}
                className={`card p-4 border-l-2 ${getPriorityColor(task.priority)} ${
                  task.is_complete ? 'line-through' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {task.is_complete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#999999]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className={`text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA] ${task.is_complete ? 'line-through' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingTask(task)
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#666666] dark:text-[#999999]" />
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-xs text-[#666666] dark:text-[#999999] mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-[#666666] dark:text-[#999999]">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-[#666666] dark:text-[#999999]">
                        <Flag className="w-3 h-3" />
                        {task.priority}
                      </div>
                      {relatedLeads.length > 0 && (
                        <div className="flex items-center gap-1">
                          {relatedLeads.slice(0, 3).map((lead) => (
                            <div
                              key={lead.id}
                              className="w-5 h-5 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium"
                              title={lead.name}
                            >
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {relatedLeads.length > 3 && (
                            <span className="text-xs text-[#666666] dark:text-[#999999]">
                              +{relatedLeads.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
          {sortedTasks.length === 0 && (
            <div className="text-center py-12 text-sm text-[#666666] dark:text-[#999999]">
              {filter === 'all' ? 'No tasks yet. Create your first task!' : `No ${filter} tasks.`}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal
            task={editingTask}
            onClose={() => {
              setIsModalOpen(false)
              setEditingTask(null)
            }}
            onSave={handleSaveTask}
          />
        )}
      </AnimatePresence>

      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  )
}

function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task | null
  onClose: () => void
  onSave: (data: Partial<Task>) => void
}) {
  const { leads } = useStore()
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium' as 'low' | 'medium' | 'high',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    related_lead_ids: task?.related_lead_ids || [],
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-md h-full overflow-y-auto"
      >
        <div className="sticky top-0 card border-b border-[#E5E5E5] dark:border-[#2A2A2A] p-4 sm:p-6 flex items-center justify-between bg-white dark:bg-[#0F0F0F]">
          <h3 className="text-base sm:text-lg font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
            {task ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
              placeholder="Task description"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Related Leads</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {leads.map((lead) => (
                <label key={lead.id} className="flex items-center gap-2 p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.related_lead_ids.includes(lead.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, related_lead_ids: [...formData.related_lead_ids, lead.id] })
                      } else {
                        setFormData({ ...formData, related_lead_ids: formData.related_lead_ids.filter(id => id !== lead.id) })
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#0A0A0A] dark:text-[#FAFAFA]">{lead.name} - {lead.company}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                onSave({
                  ...formData,
                  due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
                })
              }}
              className="flex-1 py-2.5 btn-primary"
            >
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onClose}
              className="flex-1 py-2.5 btn-secondary"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
