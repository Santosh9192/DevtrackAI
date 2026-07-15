import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineChevronDown } from 'react-icons/hi2'

const faqs = [
  {
    q: 'What is DevTrack AI?',
    a: 'DevTrack AI is an AI-powered project and developer management platform designed for modern development teams. It combines project management, task tracking, bug tracking, and AI-powered features to streamline your workflow.',
  },
  {
    q: 'Is DevTrack AI free?',
    a: 'Yes! DevTrack AI is open-source and free to use. We offer a generous free tier that includes up to 5 projects and 10 team members. Premium plans with additional features are available for growing teams.',
  },
  {
    q: 'How does the AI feature work?',
    a: 'DevTrack AI integrates with Google\'s Gemini API to provide AI-powered features like task description generation, sprint summaries, bug report rewriting, and daily standup generation. If no API key is configured, it gracefully falls back to mock AI responses.',
  },
  {
    q: 'Can I self-host DevTrack AI?',
    a: 'Absolutely! Since DevTrack AI is open-source, you can self-host it on your own infrastructure. We provide deployment guides for Vercel (frontend) and Render (backend).',
  },
  {
    q: 'What technologies does DevTrack AI use?',
    a: 'The frontend is built with React 19, Vite, Tailwind CSS, and Framer Motion. The backend uses Python FastAPI with SQLAlchemy ORM and JWT authentication. The database is MySQL.',
  },
  {
    q: 'How do I get started?',
    a: 'Simply create an account, set up your first project, invite team members, and start managing tasks. The AI features are available immediately, even without an API key.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

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
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-400">Everything you need to know about DevTrack AI.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white pr-4">{faq.q}</span>
                  <HiOutlineChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
