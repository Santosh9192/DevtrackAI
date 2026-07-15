import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import {
  HiOutlineSparkles, HiOutlineDocumentText, HiOutlineBugAnt,
  HiOutlineChartBar, HiOutlineClipboardDocumentList,
  HiOutlineCalendar, HiOutlineSpeakerWave,
} from 'react-icons/hi2'

const features = [
  {
    id: 'generate_task',
    name: 'Generate Task Description',
    description: 'AI generates detailed task descriptions with requirements and acceptance criteria',
    icon: HiOutlineClipboardDocumentList,
    color: 'from-blue-500/20 to-blue-600/10',
    textColor: 'text-blue-400',
    prompt: 'Generate a detailed task description for: ',
  },
  {
    id: 'generate_sprint',
    name: 'Generate Sprint Summary',
    description: 'Create comprehensive sprint summaries with achievements and blockers',
    icon: HiOutlineCalendar,
    color: 'from-emerald-500/20 to-emerald-600/10',
    textColor: 'text-emerald-400',
    prompt: 'Generate a sprint summary for the current sprint. ',
  },
  {
    id: 'rewrite_bug',
    name: 'Rewrite Bug Report',
    description: 'Improve and restructure bug reports for clarity',
    icon: HiOutlineBugAnt,
    color: 'from-red-500/20 to-red-600/10',
    textColor: 'text-red-400',
    prompt: 'Rewrite and improve this bug report: ',
  },
  {
    id: 'generate_report',
    name: 'Generate Weekly Report',
    description: 'Auto-generate weekly progress reports for stakeholders',
    icon: HiOutlineChartBar,
    color: 'from-purple-500/20 to-purple-600/10',
    textColor: 'text-purple-400',
    prompt: 'Generate a weekly progress report. ',
  },
  {
    id: 'estimate_complexity',
    name: 'Estimate Task Complexity',
    description: 'AI analyzes tasks and estimates complexity and story points',
    icon: HiOutlineDocumentText,
    color: 'from-amber-500/20 to-amber-600/10',
    textColor: 'text-amber-400',
    prompt: 'Estimate the complexity of this task. ',
  },
  {
    id: 'daily_standup',
    name: 'Daily Standup Report',
    description: 'Create daily standup reports with yesterday, today, and blockers',
    icon: HiOutlineSpeakerWave,
    color: 'from-primary-500/20 to-primary-600/10',
    textColor: 'text-primary-400',
    prompt: 'Generate a daily standup report. ',
  },
]

export default function AIFeatures() {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [mockMode, setMockMode] = useState(true)
  const [context, setContext] = useState('')

  useEffect(() => {
    api.get('/api/ai/features').then(res => setMockMode(res.data.mock_mode)).catch(() => {})
  }, [])

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature)
    setInput('')
    setResponse('')
    setContext('')
  }

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please enter some input')
      return
    }

    setLoading(true)
    try {
      let prompt = selectedFeature.prompt + input
      let contextData = {}

      if (context) {
        const ctx = context.split(':')
        if (ctx[0] === 'project' && ctx[1]) contextData.project = parseInt(ctx[1].trim())
        if (ctx[0] === 'task' && ctx[1]) contextData.task = parseInt(ctx[1].trim())
      }

      const res = await api.post('/api/ai/generate', {
        prompt,
        context: Object.keys(contextData).length > 0 ? contextData : undefined,
      })
      setResponse(res.data.response)
      toast.success('AI generated content!')
    } catch (error) {
      toast.error('Failed to generate AI content')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <HiOutlineSparkles size={28} className="text-primary-400" />
            AI Features
          </h1>
          <p className="text-gray-400 mt-1">
            {mockMode ? 'Running in Mock AI mode. Add GEMINI_API_KEY for real AI responses.' : 'Powered by Gemini AI'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Features List */}
        <div className="space-y-3">
          {features.map((feature) => {
            const Icon = feature.icon
            const isSelected = selectedFeature?.id === feature.id

            return (
              <motion.button
                key={feature.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFeatureSelect(feature)}
                className={`w-full glass-card p-4 text-left transition-all ${
                  isSelected ? 'border-primary-500/50 bg-primary-500/5' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                    <Icon size={20} className={feature.textColor} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white">{feature.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{feature.description}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* AI Chat/Input Area */}
        <div className="lg:col-span-2">
          {selectedFeature ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">{selectedFeature.name}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Input for AI generation
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="glass-input min-h-[120px]"
                    placeholder="Enter your content here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Context (optional - format: "type:id" e.g., "project:1")
                  </label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="glass-input"
                    placeholder="project:1, task:5"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiOutlineSparkles size={18} />
                  )}
                  {loading ? 'Generating...' : 'Generate'}
                </button>

                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <HiOutlineSparkles size={18} className="text-primary-400" />
                      <h3 className="font-medium text-white">AI Response</h3>
                    </div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">
                      {response}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(response)}
                      className="btn-ghost text-xs mt-3"
                    >
                      Copy to clipboard
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-12 text-center">
              <HiOutlineSparkles size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select an AI Feature</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Choose from the features on the left to get started with AI-powered content generation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
