import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as any }),
  actions: {
    async init() {
      const mod = await import('../lib/supabase')
      const supabase = mod.supabase
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      this.user = user
      supabase.auth.onAuthStateChange((_event, session) => {
        this.user = session?.user || null
      })
    },
    async signUp(email: string, password: string) {
      const mod = await import('../lib/supabase')
      const supabase = mod.supabase
      if (!supabase) throw new Error('Supabase 未配置')
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    },
    async signIn(email: string, password: string) {
      const mod = await import('../lib/supabase')
      const supabase = mod.supabase
      if (!supabase) throw new Error('Supabase 未配置')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signOut() {
      const mod = await import('../lib/supabase')
      const supabase = mod.supabase
      if (!supabase) return
      await supabase.auth.signOut()
    },
    async resetPassword(email: string) {
      const mod = await import('../lib/supabase')
      const supabase = mod.supabase
      if (!supabase) throw new Error('Supabase 未配置')
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    }
  }
})

