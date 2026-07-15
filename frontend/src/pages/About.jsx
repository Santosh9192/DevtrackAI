import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineSparkles, HiOutlineUsers, HiOutlineGlobeAlt } from 'react-icons/hi2'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-semibold text-white">DevTrack AI</span>
            </Link>
            <Link to="/login" className="btn-primary text-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About DevTrack AI</h1>
            <p className="text-lg text-gray-400">Empowering teams with AI-driven project management.</p>
          </motion.div>

          <div className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              DevTrack AI was built to revolutionize how development teams manage their projects. 
              We combine the power of artificial intelligence with intuitive project management tools 
              to help teams ship better software, faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: HiOutlineSparkles, title: 'AI-First', desc: 'Leveraging AI to automate repetitive tasks and generate insights.' },
              { icon: HiOutlineUsers, title: 'Team-Focused', desc: 'Built for collaboration with role-based access and clear workflows.' },
              { icon: HiOutlineGlobeAlt, title: 'Open Source', desc: 'Free and open-source. Transparent, customizable, and community-driven.' },
            ].map((item) => (
              <div key={item.title} className="glass-card p-6 text-center">
                <item.icon size={32} className="text-primary-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
