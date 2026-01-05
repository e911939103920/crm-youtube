'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const { setUser, fetchLeads, fetchPipelines } = useStore()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUser({
            id: user.id,
            name: profile.name || user.email?.split('@')[0] || 'User',
            email: profile.email || user.email || '',
            avatar: profile.avatar,
            role: profile.role || 'user',
          })
          
          // Fetch user data
          await fetchLeads()
          await fetchPipelines()
        }
      }
      
      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          // Only redirect to login if we're on a protected route (not on landing page or auth pages)
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password']
            const protectedRoutes = ['/dashboard', '/pipeline', '/leads', '/tasks', '/billing', '/settings']
            
            // Only redirect if we're on a protected route and not on a public route
            if (protectedRoutes.some(route => currentPath.startsWith(route)) && 
                !publicRoutes.includes(currentPath)) {
              router.push('/login')
            }
          }
        } else if (event === 'SIGNED_IN' && session.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: session.user.id,
              name: profile.name || session.user.email?.split('@')[0] || 'User',
              email: profile.email || session.user.email || '',
              avatar: profile.avatar,
              role: profile.role || 'user',
            })
            
            await fetchLeads()
            await fetchPipelines()
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, fetchLeads, fetchPipelines, router, supabase])

  return { loading }
}
