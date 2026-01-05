'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { 
  ArrowRight, 
  ChevronDown, 
  Workflow, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  CreditCard, 
  Settings,
  Upload,
  FileText,
  Sparkles,
  Quote,
  Plus,
  Minus,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react'

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroY = useTransform(scrollY, [0, 300], [0, -50])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      quote: "GlassCRM transformed how we manage our pipeline. The minimalist design keeps us focused on what matters.",
      name: "Sarah Chen",
      role: "Sales Director, TechCorp",
      avatar: "SC"
    },
    {
      quote: "Finally, a CRM that doesn't feel like work. The glass UI and smooth animations make every interaction delightful.",
      name: "Marcus Johnson",
      role: "Founder, StartupXYZ",
      avatar: "MJ"
    },
    {
      quote: "The task linking feature is a game-changer. We can now connect our to-dos directly to leads and never miss a follow-up.",
      name: "Emily Rodriguez",
      role: "Account Manager, GrowthCo",
      avatar: "ER"
    }
  ]

  const features = [
    {
      icon: Workflow,
      title: "Pipeline Board",
      description: "Visual Kanban with drag-and-drop. See your entire sales process at a glance.",
      snippet: "Kanban"
    },
    {
      icon: Users,
      title: "Lead Management",
      description: "Import, organize, and track leads with CSV mapping and saved lists.",
      snippet: "Leads"
    },
    {
      icon: CheckCircle2,
      title: "Task Linking",
      description: "Create tasks linked to leads. Never lose track of what needs to be done.",
      snippet: "Tasks"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time insights with beautiful charts. Make data-driven decisions.",
      snippet: "Charts"
    },
    {
      icon: CreditCard,
      title: "Billing & Settings",
      description: "Manage subscriptions and customize your workspace to fit your needs.",
      snippet: "Settings"
    },
    {
      icon: Sparkles,
      title: "Supabase Ready",
      description: "Built on modern infrastructure. Scalable, secure, and always available.",
      snippet: "Cloud"
    }
  ]

  const faqs = [
    {
      question: "How does the free trial work?",
      answer: "Start with a 14-day free trial. No credit card required. Full access to all features during the trial period."
    },
    {
      question: "Can I import my existing leads?",
      answer: "Yes! Use our enhanced CSV import with column mapping. We support all common CRM formats and will help you map your data correctly."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use Supabase with Row Level Security, ensuring your data is encrypted and only accessible by you. We never share your information."
    },
    {
      question: "Can I link tasks to multiple leads?",
      answer: "Yes, tasks can be linked to one or more leads. This helps you track follow-ups and actions across your entire pipeline."
    },
    {
      question: "What happens if I delete a lead by mistake?",
      answer: "Don't worry! We use soft deletion with a 10-second undo window. You can restore deleted leads instantly."
    },
    {
      question: "Do you offer team collaboration?",
      answer: "Team features are coming soon. For now, GlassCRM is optimized for individual use with full data privacy."
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] overflow-x-hidden">
      {/* Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-[#666666] dark:text-[#999999] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm btn-primary"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-16">
        {/* Background Orbital Lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-white/10 rounded-full animate-orbital" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 border border-white/10 rounded-full animate-orbital" style={{ animationDirection: 'reverse', animationDuration: '180s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 border border-white/10 rounded-full animate-orbital" style={{ animationDuration: '200s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ opacity: heroOpacity, y: heroY }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-thin mb-6 text-white tracking-tight leading-tight">
                A calmer way to sell
              </h1>
              <p className="text-lg sm:text-xl text-white/80 mb-8 font-light leading-relaxed max-w-xl">
                A minimalist CRM for modern teams. Manage your pipeline, leads, and tasks in one beautiful, glassy surface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="glass px-8 py-4 flex items-center justify-center gap-2 text-base font-medium text-black hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start free trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#demo"
                  className="glass-dark px-8 py-4 flex items-center justify-center gap-2 text-base font-medium text-white border border-white/20 hover:border-white/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Book a demo
                </Link>
              </div>
            </motion.div>

            {/* Right: Mockups */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="relative"
            >
              <div className="relative animate-float">
                {/* Dashboard Mockup */}
                <div className="glass p-6 mb-4 transform rotate-[-2deg] shadow-2xl">
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 bg-black/10 rounded" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-black/5 rounded" />
                      <div className="h-16 bg-black/5 rounded" />
                      <div className="h-16 bg-black/5 rounded" />
                    </div>
                  </div>
                </div>
                {/* Pipeline Mockup */}
                <div className="glass p-6 transform rotate-[2deg] translate-x-8 shadow-2xl">
                  <div className="flex gap-2">
                    <div className="w-24 h-32 bg-black/10 rounded" />
                    <div className="w-24 h-32 bg-black/10 rounded" />
                    <div className="w-24 h-32 bg-black/10 rounded" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-6 h-6 text-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass p-6 rounded-lg">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-40">
              {['TechCorp', 'StartupXYZ', 'GrowthCo', 'InnovateLab', 'ScaleUp'].map((logo, i) => (
                <motion.div
                  key={logo}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 0.4, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]"
                >
                  {logo}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Story */}
      <section className="py-20 sm:py-32 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-thin mb-6 text-[#0A0A0A] dark:text-[#FAFAFA] tracking-tight">
                Your whole pipeline, in one glassy surface
              </h2>
              <p className="text-base sm:text-lg text-[#666666] dark:text-[#999999] mb-6 font-light leading-relaxed">
                GlassCRM brings together everything you need to manage your sales process. From initial contact to closed deal, 
                every interaction lives in one beautifully organized workspace.
              </p>
              <p className="text-base sm:text-lg text-[#666666] dark:text-[#999999] font-light leading-relaxed">
                Built with attention to detail. Every animation, every interaction, every pixel is crafted to reduce friction 
                and help you focus on what matters: closing deals.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="relative h-[500px]"
            >
              {/* Stacked Screenshots */}
              <div className="absolute inset-0 space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                  className="glass p-6 transform rotate-[-1deg] shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="h-4 w-1/2 bg-black/10 rounded" />
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-20 bg-black/5 rounded" />
                      ))}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                  className="glass p-6 transform rotate-[1deg] translate-x-4 shadow-lg"
                >
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex-1 h-40 bg-black/5 rounded" />
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                  className="glass p-6 transform rotate-[-0.5deg] translate-x-8 shadow-lg"
                >
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-black/5 rounded" />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 sm:py-32 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-thin mb-4 text-[#0A0A0A] dark:text-[#FAFAFA] tracking-tight">
              Everything you need
            </h2>
            <p className="text-base text-[#666666] dark:text-[#999999] font-light max-w-2xl mx-auto">
              A complete CRM solution designed for modern sales teams
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(0,0,0,0.2)' }}
                  className="glass p-6 group cursor-pointer"
                >
                  <Icon className="w-6 h-6 mb-4 text-[#0A0A0A] dark:text-[#FAFAFA] group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-medium mb-2 text-[#0A0A0A] dark:text-[#FAFAFA]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#666666] dark:text-[#999999] mb-4 font-light leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="text-xs text-[#999999] dark:text-[#666666] font-light">
                    {feature.snippet}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-32 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-thin mb-4 text-[#0A0A0A] dark:text-[#FAFAFA] tracking-tight">
              How it works
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative">
            {[
              { step: '1', title: 'Import leads', desc: 'Upload CSV or add manually' },
              { step: '2', title: 'Organize pipeline', desc: 'Drag and drop between stages' },
              { step: '3', title: 'Act with tasks', desc: 'Link to-dos to leads' }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center max-w-xs relative"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute left-full top-8 w-16 h-px bg-[#E5E5E5] dark:bg-[#2A2A2A]" />
                )}
                <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4 text-xl font-thin text-[#0A0A0A] dark:text-[#FAFAFA]">
                  {item.step}
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#0A0A0A] dark:text-[#FAFAFA]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#666666] dark:text-[#999999] font-light">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Moments */}
      <section className="py-20 sm:py-32 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Pipeline Moment */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-8"
          >
            <h3 className="text-2xl font-thin mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">
              Pipeline management, reimagined
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {['New', 'Contacted', 'Proposal', 'Won'].map((stage, i) => (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="min-w-[200px] p-4 bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#2A2A2A]"
                >
                  <div className="text-xs text-[#666666] dark:text-[#999999] mb-3 font-medium">{stage}</div>
                  <div className="space-y-2">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="p-3 bg-[#FAFAFA] dark:bg-[#141414] text-sm">
                        <div className="font-medium mb-1">Lead {j + 1}</div>
                        <div className="text-xs text-[#666666] dark:text-[#999999]">$5,000</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tasks Moment */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-8"
          >
            <h3 className="text-2xl font-thin mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">
              Tasks that connect to your leads
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Follow up with Sarah', priority: 'high', lead: 'Sarah Chen' },
                { title: 'Send proposal to TechCorp', priority: 'medium', lead: 'TechCorp' },
                { title: 'Schedule demo call', priority: 'low', lead: 'GrowthCo' }
              ].map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#2A2A2A]"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#999999]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">{task.title}</div>
                    <div className="text-xs text-[#666666] dark:text-[#999999]">{task.lead}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 ${
                    task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                    task.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {task.priority}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-32 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-thin mb-4 text-[#0A0A0A] dark:text-[#FAFAFA] tracking-tight">
              Loved by teams
            </h2>
          </motion.div>

          <div className="relative h-64">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ 
                  opacity: activeTestimonial === i ? 1 : 0,
                  x: activeTestimonial === i ? 0 : 50,
                  scale: activeTestimonial === i ? 1 : 0.95
                }}
                className="absolute inset-0 glass p-8 flex flex-col justify-center"
              >
                <Quote className="w-8 h-8 mb-4 text-[#999999]" />
                <p className="text-lg text-[#0A0A0A] dark:text-[#FAFAFA] mb-6 font-light leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">{testimonial.name}</div>
                    <div className="text-sm text-[#666666] dark:text-[#999999]">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeTestimonial === i 
                    ? 'bg-black dark:bg-white w-8' 
                    : 'bg-[#E5E5E5] dark:bg-[#2A2A2A]'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-32 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-thin mb-4 text-[#0A0A0A] dark:text-[#FAFAFA] tracking-tight">
              Simple pricing
            </h2>
            <p className="text-base text-[#666666] dark:text-[#999999] font-light">
              Start free, scale as you grow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="glass p-8 max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="text-sm text-[#666666] dark:text-[#999999] mb-2">Founders Plan</div>
              <div className="text-5xl font-thin mb-2 text-[#0A0A0A] dark:text-[#FAFAFA]">
                $29
                <span className="text-xl text-[#666666] dark:text-[#999999]">/month</span>
              </div>
              <div className="text-sm text-[#666666] dark:text-[#999999]">Per user</div>
            </div>
            <ul className="space-y-4 mb-8">
              {['Unlimited leads', 'Full pipeline access', 'Task management', 'CSV import/export', 'Analytics dashboard', 'Priority support'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-[#0A0A0A] dark:text-[#FAFAFA]">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block w-full btn-primary py-3 text-center font-medium hover:opacity-90 transition-opacity"
            >
              Start free trial
            </Link>
            <p className="text-xs text-center text-[#666666] dark:text-[#999999] mt-4">
              Backed by Supabase-ready infrastructure
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-32 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-thin mb-4 text-[#0A0A0A] dark:text-[#FAFAFA] tracking-tight">
              Frequently asked
            </h2>
          </motion.div>

          <div className="space-y-1">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-[#E5E5E5] dark:border-[#2A2A2A]"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full py-6 flex items-center justify-between text-left"
                >
                  <span className="text-base font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFAQ === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {openFAQ === i ? (
                      <Minus className="w-5 h-5 text-[#666666] dark:text-[#999999]" />
                    ) : (
                      <Plus className="w-5 h-5 text-[#666666] dark:text-[#999999]" />
                    )}
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ 
                    height: openFAQ === i ? 'auto' : 0,
                    opacity: openFAQ === i ? 1 : 0
                  }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 text-sm text-[#666666] dark:text-[#999999] font-light leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0A0A0A] dark:bg-black border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">GlassCRM</h3>
              <p className="text-sm text-white/60 font-light">
                A calmer way to sell. Built for teams who care about craft.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-white/60 font-light">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-white/60 font-light">
                <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="#privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#2A2A2A]">
            <p className="text-sm text-white/60 font-light mb-4 sm:mb-0">
              Made for teams who care about craft.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
