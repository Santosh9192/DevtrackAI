import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  HiOutlineSparkles, HiOutlineBriefcase, HiOutlineUsers,
  HiOutlineClipboardDocumentList, HiOutlineBugAnt, HiOutlineBell,
  HiOutlineChartBar, HiOutlineShieldCheck, HiOutlineArrowRight,
  HiOutlineCheckCircle, HiOutlineMoon,
} from 'react-icons/hi2'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const features = [
  { icon: HiOutlineBriefcase, title: 'Project Management', desc: 'Create, manage, and track projects with ease. Kanban boards, priorities, and deadlines.' },
  { icon: HiOutlineClipboardDocumentList, title: 'Task Management', desc: 'Drag-and-drop kanban boards. Assign tasks, set priorities, and track progress.' },
  { icon: HiOutlineUsers, title: 'Team Management', desc: 'Manage your team with roles, departments, and detailed developer profiles.' },
  { icon: HiOutlineBugAnt, title: 'Bug Tracker', desc: 'Track bugs with severity levels, assignments, and resolution workflows.' },
  { icon: HiOutlineSparkles, title: 'AI-Powered', desc: 'AI-generated task descriptions, sprint summaries, bug reports, and standup notes.' },
  { icon: HiOutlineBell, title: 'Notifications', desc: 'Real-time notifications for task assignments, deadlines, and updates.' },
  { icon: HiOutlineChartBar, title: 'Analytics Dashboard', desc: 'Beautiful charts and metrics. Track progress, productivity, and completion rates.' },
  { icon: HiOutlineShieldCheck, title: 'Role-Based Access', desc: 'Secure authentication with JWT. Admin, Manager, and Developer roles.' },
]

const stats = [
  { value: '100%', label: 'Open Source' },
  { value: '8+', label: 'Core Modules' },
  { value: '3', label: 'User Roles' },
  { value: '100%', label: 'Customizable' },
]

const pricing = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    features: ['Up to 5 projects', 'Up to 10 team members', 'Kanban board', 'Basic dashboard', 'Task management'],
    popular: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    features: ['Unlimited projects', 'Unlimited team members', 'AI features', 'Advanced analytics', 'Priority support'],
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'White-label option'],
    popular: false,
    cta: 'Contact Sales',
  },
]

export default function Landing() {
  const { isAuthenticated } = useAuth()

  const handleScroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const NavBar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-white">DevTrack AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleScroll('features')} className="text-sm text-gray-400 hover:text-white transition-colors">Features</button>
            <button onClick={() => handleScroll('pricing')} className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</button>
            <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )

  return (
    <div className="bg-gray-950 min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center relative"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400">
              <HiOutlineSparkles size={16} />
              AI-Powered Project Management
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Manage Projects with{' '}
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            The all-in-one platform for project management, team collaboration, and AI-powered development tracking. 
            Built for modern teams.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Get Started Free
              <HiOutlineArrowRight size={20} />
            </Link>
            <button
              onClick={() => handleScroll('features')}
              className="btn-secondary text-lg px-8 py-4"
            >
              Learn More
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Powerful features to manage your projects, team, and development workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card-hover p-6 group"
                >
                  <div className="p-3 bg-primary-500/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-gray-400">
              Start for free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -5 }}
                className={`glass-card p-8 relative ${plan.popular ? 'border-primary-500/40' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <HiOutlineCheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-3 rounded-xl font-medium transition-all ${
                  plan.popular ? 'btn-primary' : 'btn-secondary'
                }`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-transparent" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of developers and teams using DevTrack AI to manage their projects smarter.
              </p>
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
                <HiOutlineArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-semibold text-white">DevTrack AI</span>
            </div>
            <p className="text-sm text-gray-400">AI-Powered Project & Developer Management Platform</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => handleScroll('features')} className="hover:text-white transition-colors">Features</button></li>
              <li><button onClick={() => handleScroll('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
          &copy; 2026 DevTrack AI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
