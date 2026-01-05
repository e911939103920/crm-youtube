import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  value: number
  stage: string
  tags: string[]
  assignedTo?: string
  createdAt: string
  updatedAt: string
  notes?: string
  user_id?: string
}

export interface Pipeline {
  id: string
  title: string
  order_index: number
  user_id?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  related_lead_ids: string[]
  is_complete: boolean
  assigned_to?: string
  created_at: string
  updated_at: string
  user_id?: string
}

export interface SavedList {
  id: string
  name: string
  description?: string
  lead_ids: string[]
  created_at: string
  updated_at: string
  user_id?: string
}

interface AppState {
  user: User | null
  leads: Lead[]
  pipelines: Pipeline[]
  tasks: Task[]
  savedLists: SavedList[]
  isAuthenticated: boolean
  loading: boolean
  deletedLeadCache: { lead: Lead; timestamp: number } | null
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  fetchLeads: () => Promise<void>
  fetchPipelines: () => Promise<void>
  fetchTasks: () => Promise<void>
  fetchSavedLists: () => Promise<void>
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => Promise<void>
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  undoDeleteLead: () => Promise<void>
  addPipeline: (pipeline: Omit<Pipeline, 'id' | 'user_id'>) => Promise<void>
  updatePipeline: (id: string, updates: Partial<Pipeline>) => Promise<void>
  moveLeadToStage: (leadId: string, newStage: string) => Promise<void>
  importLeads: (leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>[]) => Promise<void>
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskComplete: (id: string) => Promise<void>
  // Saved Lists
  addSavedList: (list: Omit<SavedList, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>
  updateSavedList: (id: string, updates: Partial<SavedList>) => Promise<void>
  deleteSavedList: (id: string) => Promise<void>
  logout: () => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  leads: [],
  pipelines: [],
  tasks: [],
  savedLists: [],
  isAuthenticated: false,
  loading: false,
  deletedLeadCache: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setLoading: (loading) => set({ loading }),

  fetchLeads: async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        return
      }
      
      if (!user) {
        console.log('No user found')
        return
      }

      // Try to fetch with is_deleted filter first, fallback if column doesn't exist
      let query = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        // If error is about is_deleted column, try without it
        if (error.message?.includes('is_deleted') || error.code === '42703') {
          const { data: dataWithoutFilter, error: errorWithoutFilter } = await supabase
            .from('leads')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          
          if (errorWithoutFilter) {
            console.error('Error fetching leads:', errorWithoutFilter)
            return
          }

          // Filter out deleted leads in memory if column doesn't exist
          const filteredData = dataWithoutFilter?.filter((lead: any) => !lead.is_deleted) || []
          
          set({
            leads: filteredData.map((lead: any) => ({
              id: lead.id,
              name: lead.name,
              company: lead.company,
              email: lead.email,
              phone: lead.phone,
              value: Number(lead.value || 0),
              stage: lead.stage,
              tags: lead.tags || [],
              assignedTo: lead.assigned_to,
              notes: lead.notes,
              createdAt: lead.created_at,
              updatedAt: lead.updated_at,
              user_id: lead.user_id,
            })),
          })
          return
        }
        
        console.error('Error fetching leads:', error)
        return
      }

      // Filter out deleted leads
      const filteredData = data?.filter((lead: any) => !lead.is_deleted) || []

      set({
        leads: filteredData.map((lead: any) => ({
          id: lead.id,
          name: lead.name,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          value: Number(lead.value || 0),
          stage: lead.stage,
          tags: lead.tags || [],
          assignedTo: lead.assigned_to,
          notes: lead.notes,
          createdAt: lead.created_at,
          updatedAt: lead.updated_at,
          user_id: lead.user_id,
        })),
      })
    } catch (err) {
      console.error('Unexpected error fetching leads:', err)
    }
  },

  fetchPipelines: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching pipelines:', error)
      return
    }

    set({
      pipelines: data?.map((pipeline) => ({
        id: pipeline.id,
        title: pipeline.title,
        order_index: pipeline.order_index,
        user_id: pipeline.user_id,
      })) || [],
    })
  },

  addLead: async (leadData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        name: leadData.name,
        company: leadData.company,
        email: leadData.email,
        phone: leadData.phone,
        value: leadData.value,
        stage: leadData.stage,
        tags: leadData.tags || [],
        notes: leadData.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding lead:', error)
      throw error
    }

    await get().fetchLeads()
  },

  updateLead: async (id, updates) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('leads')
      .update({
        name: updates.name,
        company: updates.company,
        email: updates.email,
        phone: updates.phone,
        value: updates.value,
        stage: updates.stage,
        tags: updates.tags,
        notes: updates.notes,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating lead:', error)
      throw error
    }

    await get().fetchLeads()
  },

  deleteLead: async (id) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    // Cache the lead for undo
    const lead = get().leads.find(l => l.id === id)
    if (lead) {
      set({ deletedLeadCache: { lead, timestamp: Date.now() } })
    }

    // Soft delete
    const { error } = await supabase
      .from('leads')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting lead:', error)
      throw error
    }

    await get().fetchLeads()
  },

  undoDeleteLead: async () => {
    const cache = get().deletedLeadCache
    if (!cache) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('leads')
      .update({ is_deleted: false })
      .eq('id', cache.lead.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error undoing delete:', error)
      throw error
    }

    set({ deletedLeadCache: null })
    await get().fetchLeads()
  },

  addPipeline: async (pipelineData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('pipelines')
      .insert({
        user_id: user.id,
        title: pipelineData.title,
        order_index: pipelineData.order_index,
      })

    if (error) {
      console.error('Error adding pipeline:', error)
      throw error
    }

    await get().fetchPipelines()
  },

  updatePipeline: async (id, updates) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('pipelines')
      .update({
        title: updates.title,
        order_index: updates.order_index,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating pipeline:', error)
      throw error
    }

    await get().fetchPipelines()
  },

  moveLeadToStage: async (leadId, newStage) => {
    await get().updateLead(leadId, { stage: newStage })
  },

  importLeads: async (leadsData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const leadsToInsert = leadsData.map((lead) => ({
      user_id: user.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      value: lead.value,
      stage: lead.stage,
      tags: lead.tags || [],
      notes: lead.notes,
    }))

    const { error } = await supabase
      .from('leads')
      .insert(leadsToInsert)

    if (error) {
      console.error('Error importing leads:', error)
      throw error
    }

    await get().fetchLeads()
  },

  fetchTasks: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return
    }

    set({
      tasks: data?.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        related_lead_ids: task.related_lead_ids || [],
        is_complete: task.is_complete,
        assigned_to: task.assigned_to,
        created_at: task.created_at,
        updated_at: task.updated_at,
        user_id: task.user_id,
      })) || [],
    })
  },

  addTask: async (taskData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date,
        related_lead_ids: taskData.related_lead_ids || [],
        is_complete: taskData.is_complete || false,
        assigned_to: taskData.assigned_to,
      })

    if (error) {
      console.error('Error adding task:', error)
      throw error
    }

    await get().fetchTasks()
  },

  updateTask: async (id, updates) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        due_date: updates.due_date,
        related_lead_ids: updates.related_lead_ids,
        is_complete: updates.is_complete,
        assigned_to: updates.assigned_to,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating task:', error)
      throw error
    }

    await get().fetchTasks()
  },

  deleteTask: async (id) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting task:', error)
      throw error
    }

    await get().fetchTasks()
  },

  toggleTaskComplete: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return

    await get().updateTask(id, { is_complete: !task.is_complete })
  },

  fetchSavedLists: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data, error } = await supabase
      .from('saved_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved lists:', error)
      return
    }

    set({
      savedLists: data?.map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        lead_ids: list.lead_ids || [],
        created_at: list.created_at,
        updated_at: list.updated_at,
        user_id: list.user_id,
      })) || [],
    })
  },

  addSavedList: async (listData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('saved_lists')
      .insert({
        user_id: user.id,
        name: listData.name,
        description: listData.description,
        lead_ids: listData.lead_ids || [],
      })

    if (error) {
      console.error('Error adding saved list:', error)
      throw error
    }

    await get().fetchSavedLists()
  },

  updateSavedList: async (id, updates) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('saved_lists')
      .update({
        name: updates.name,
        description: updates.description,
        lead_ids: updates.lead_ids,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating saved list:', error)
      throw error
    }

    await get().fetchSavedLists()
  },

  deleteSavedList: async (id) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('saved_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting saved list:', error)
      throw error
    }

    await get().fetchSavedLists()
  },

  logout: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false, leads: [], pipelines: [], tasks: [], savedLists: [], deletedLeadCache: null })
  },
}))
