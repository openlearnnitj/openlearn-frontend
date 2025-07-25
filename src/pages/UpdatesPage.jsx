import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft, GitCommit, ChevronDown, ExternalLink } from 'lucide-react'
import { getAllUpdates, getUniqueContributors } from '../utils/updatesService'

const UpdatesPage = () => {
  const [allUpdates, setAllUpdates] = useState([])
  const [displayedUpdates, setDisplayedUpdates] = useState([])
  const [contributors, setContributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  
  const updatesPerPage = 15

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true)
        const [data, contributorsData] = await Promise.all([
          getAllUpdates(),
          getUniqueContributors()
        ])
        setAllUpdates(data)
        setDisplayedUpdates(data.slice(0, updatesPerPage))
        setContributors(contributorsData)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching updates:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [])

  const loadMoreUpdates = () => {
    setLoadingMore(true)
    setTimeout(() => {
      const nextPage = currentPage + 1
      const newDisplayCount = nextPage * updatesPerPage
      setDisplayedUpdates(allUpdates.slice(0, newDisplayCount))
      setCurrentPage(nextPage)
      setLoadingMore(false)
    }, 500) // Small delay for better UX
  }

  const hasMoreUpdates = displayedUpdates.length < allUpdates.length

  const formatDetailedDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getTypeBgColor = (type) => {
    switch (type) {
      // Core development types
      case 'feature': return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'fix': return 'bg-red-100 text-red-800 border-red-300'
      case 'hotfix': return 'bg-red-200 text-red-900 border-red-400'
      case 'improvement': return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'update': return 'bg-cyan-100 text-cyan-800 border-cyan-300'
      
      // Code quality and maintenance
      case 'refactor': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'chore': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'performance': return 'bg-lime-100 text-lime-800 border-lime-300'
      case 'cleanup': return 'bg-slate-100 text-slate-800 border-slate-300'
      
      // Documentation and testing
      case 'docs': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'test': return 'bg-orange-100 text-orange-800 border-orange-300'
      
      // Design and styling
      case 'style': return 'bg-pink-100 text-pink-800 border-pink-300'
      case 'ui': return 'bg-rose-100 text-rose-800 border-rose-300'
      
      // DevOps and deployment
      case 'deploy': return 'bg-violet-100 text-violet-800 border-violet-300'
      case 'ci': return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'config': return 'bg-amber-100 text-amber-800 border-amber-300'
      
      // Security and critical changes
      case 'security': return 'bg-red-200 text-red-900 border-red-400'
      case 'critical': return 'bg-red-300 text-red-950 border-red-500'
      case 'breaking': return 'bg-yellow-200 text-yellow-900 border-yellow-400'
      
      // Version control and collaboration
      case 'merge': return 'bg-teal-100 text-teal-800 border-teal-300'
      case 'revert': return 'bg-orange-200 text-orange-900 border-orange-400'
      
      // Project lifecycle
      case 'init': return 'bg-green-100 text-green-800 border-green-300'
      case 'release': return 'bg-purple-200 text-purple-900 border-purple-400'
      case 'deps': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'wip': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      
      // Default fallback
      default: return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  const getRepoBgColor = (repo) => {
    switch (repo) {
      case 'frontend': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'backend': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getCategoryBgColor = (category) => {
    switch (category) {
      // Development domains
      case 'DevOps': return 'bg-violet-50 text-violet-700 border-violet-200'
      case 'Database': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Authentication': return 'bg-red-50 text-red-700 border-red-200'
      case 'Admin Panel': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'Learning Platform': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Gamification': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'UI Components': return 'bg-pink-50 text-pink-700 border-pink-200'
      case 'Backend API': return 'bg-green-50 text-green-700 border-green-200'
      
      // Quality and maintenance
      case 'Code Quality': return 'bg-cyan-50 text-cyan-700 border-cyan-200'
      case 'Documentation': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Quality Assurance': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'Performance': return 'bg-lime-50 text-lime-700 border-lime-200'
      case 'Configuration': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      
      // User experience
      case 'Design & Styling': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'User Experience': return 'bg-teal-50 text-teal-700 border-teal-200'
      case 'Navigation': return 'bg-slate-50 text-slate-700 border-slate-200'
      case 'Search & Filtering': return 'bg-sky-50 text-sky-700 border-sky-200'
      
      // Integration and external
      case 'Integrations': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
      case 'Version Control': return 'bg-stone-50 text-stone-700 border-stone-200'
      case 'Legal & Privacy': return 'bg-neutral-50 text-neutral-700 border-neutral-200'
      
      // Special categories
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'Features': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Bug Fixes': return 'bg-red-50 text-red-700 border-red-200'
      case 'Maintenance': return 'bg-gray-50 text-gray-700 border-gray-200'
      
      // Default fallback
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getDotColor = (type) => {
    switch (type) {
      // Core development types
      case 'feature': return 'border-emerald-300 group-hover:border-emerald-500'
      case 'fix': return 'border-red-300 group-hover:border-red-500'
      case 'hotfix': return 'border-red-400 group-hover:border-red-600'
      case 'improvement': return 'border-indigo-300 group-hover:border-indigo-500'
      case 'update': return 'border-cyan-300 group-hover:border-cyan-500'
      
      // Code quality and maintenance
      case 'refactor': return 'border-blue-300 group-hover:border-blue-500'
      case 'chore': return 'border-gray-300 group-hover:border-gray-500'
      case 'performance': return 'border-lime-300 group-hover:border-lime-500'
      
      // Documentation and testing
      case 'docs': return 'border-purple-300 group-hover:border-purple-500'
      case 'test': return 'border-orange-300 group-hover:border-orange-500'
      
      // Design and styling
      case 'style': return 'border-pink-300 group-hover:border-pink-500'
      case 'ui': return 'border-rose-300 group-hover:border-rose-500'
      
      // DevOps and deployment
      case 'deploy': return 'border-violet-300 group-hover:border-violet-500'
      case 'ci': return 'border-indigo-300 group-hover:border-indigo-500'
      case 'config': return 'border-amber-300 group-hover:border-amber-500'
      
      // Security and critical changes
      case 'security': return 'border-red-400 group-hover:border-red-600'
      case 'critical': return 'border-red-500 group-hover:border-red-700'
      case 'breaking': return 'border-yellow-400 group-hover:border-yellow-600'
      
      // Version control and collaboration
      case 'merge': return 'border-teal-300 group-hover:border-teal-500'
      case 'revert': return 'border-orange-400 group-hover:border-orange-600'
      
      // Project lifecycle
      case 'init': return 'border-green-300 group-hover:border-green-500'
      case 'release': return 'border-purple-400 group-hover:border-purple-600'
      case 'deps': return 'border-blue-200 group-hover:border-blue-400'
      case 'wip': return 'border-yellow-300 group-hover:border-yellow-500'
      
      default: return 'border-gray-200 group-hover:border-[#FFDE59]'
    }
  }

  const getHoverBorderColor = (type) => {
    switch (type) {
      // Core development types
      case 'feature': return 'hover:border-l-emerald-300'
      case 'fix': return 'hover:border-l-red-300'
      case 'hotfix': return 'hover:border-l-red-400'
      case 'improvement': return 'hover:border-l-indigo-300'
      case 'update': return 'hover:border-l-cyan-300'
      
      // Code quality and maintenance
      case 'refactor': return 'hover:border-l-blue-300'
      case 'chore': return 'hover:border-l-gray-300'
      case 'performance': return 'hover:border-l-lime-300'
      
      // Documentation and testing
      case 'docs': return 'hover:border-l-purple-300'
      case 'test': return 'hover:border-l-orange-300'
      
      // Design and styling
      case 'style': return 'hover:border-l-pink-300'
      case 'ui': return 'hover:border-l-rose-300'
      
      // DevOps and deployment
      case 'deploy': return 'hover:border-l-violet-300'
      case 'ci': return 'hover:border-l-indigo-300'
      case 'config': return 'hover:border-l-amber-300'
      
      // Security and critical changes
      case 'security': return 'hover:border-l-red-400'
      case 'critical': return 'hover:border-l-red-500'
      case 'breaking': return 'hover:border-l-yellow-400'
      
      // Version control and collaboration
      case 'merge': return 'hover:border-l-teal-300'
      case 'revert': return 'hover:border-l-orange-400'
      
      // Project lifecycle
      case 'init': return 'hover:border-l-green-300'
      case 'release': return 'hover:border-l-purple-400'
      case 'deps': return 'hover:border-l-blue-200'
      case 'wip': return 'hover:border-l-yellow-300'
      
      default: return 'hover:border-l-[#FFDE59]'
    }
  }

  const getDotFillColor = (type) => {
    switch (type) {
      // Core development types
      case 'feature': return 'bg-emerald-100 group-hover:bg-emerald-300'
      case 'fix': return 'bg-red-100 group-hover:bg-red-300'
      case 'hotfix': return 'bg-red-200 group-hover:bg-red-400'
      case 'improvement': return 'bg-indigo-100 group-hover:bg-indigo-300'
      case 'update': return 'bg-cyan-100 group-hover:bg-cyan-300'
      
      // Code quality and maintenance
      case 'refactor': return 'bg-blue-100 group-hover:bg-blue-300'
      case 'chore': return 'bg-gray-100 group-hover:bg-gray-300'
      case 'performance': return 'bg-lime-100 group-hover:bg-lime-300'
      
      // Documentation and testing
      case 'docs': return 'bg-purple-100 group-hover:bg-purple-300'
      case 'test': return 'bg-orange-100 group-hover:bg-orange-300'
      
      // Design and styling
      case 'style': return 'bg-pink-100 group-hover:bg-pink-300'
      case 'ui': return 'bg-rose-100 group-hover:bg-rose-300'
      
      // DevOps and deployment
      case 'deploy': return 'bg-violet-100 group-hover:bg-violet-300'
      case 'ci': return 'bg-indigo-100 group-hover:bg-indigo-300'
      case 'config': return 'bg-amber-100 group-hover:bg-amber-300'
      
      // Security and critical changes
      case 'security': return 'bg-red-200 group-hover:bg-red-400'
      case 'critical': return 'bg-red-300 group-hover:bg-red-500'
      case 'breaking': return 'bg-yellow-200 group-hover:bg-yellow-400'
      
      // Version control and collaboration
      case 'merge': return 'bg-teal-100 group-hover:bg-teal-300'
      case 'revert': return 'bg-orange-200 group-hover:bg-orange-400'
      
      // Project lifecycle
      case 'init': return 'bg-green-100 group-hover:bg-green-300'
      case 'release': return 'bg-purple-200 group-hover:bg-purple-400'
      case 'deps': return 'bg-blue-50 group-hover:bg-blue-200'
      case 'wip': return 'bg-yellow-100 group-hover:bg-yellow-300'
      
      default: return 'bg-gray-100 group-hover:bg-[#FFDE59]'
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#FFDE59] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading updates...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <h2 className="text-sm font-medium text-gray-900 mb-1">Unable to load updates</h2>
          <p className="text-xs text-gray-500 mb-3">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link 
              to="/" 
              className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Home
            </Link>
            <div className="text-xs text-gray-400">
              {allUpdates.length} total commits
            </div>
          </div>
          
          <div className="mb-3">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Platform Updates</h1>
            <p className="text-xs text-gray-500">
              Real-time development progress from git history
            </p>
          </div>

          {/* Contributors Section */}
          {contributors.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <h3 className="text-xs font-medium text-gray-700 mb-2">Contributors</h3>
              <div className="flex flex-wrap gap-2">
                {contributors.map((contributor, index) => (
                  <a
                    key={index}
                    href={`https://github.com/${contributor.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs bg-white hover:bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 transition-colors"
                    title={`${contributor.commitCount} commits`}
                  >
                    <span className="font-medium">@{contributor.username}</span>
                    <span className="ml-1 text-gray-500">({contributor.commitCount})</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thread-like Timeline */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-0">
          {displayedUpdates.map((update, index) => (
            <div 
              key={update.id} 
              className="relative group"
            >
              {/* Thread line */}
              {index < displayedUpdates.length - 1 && (
                <div className="absolute left-2 top-8 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-100 to-transparent"></div>
              )}
              
              {/* Update item */}
              <div className={`relative flex items-start space-x-3 py-3 hover:bg-gray-50 transition-all duration-200 rounded-md px-2 -mx-2 border-l-2 border-l-transparent ${getHoverBorderColor(update.type)}`}>
                {/* Commit dot */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-4 h-4 bg-white border-2 rounded-full relative z-10 transition-colors ${getDotColor(update.type)}`}>
                    <div className={`absolute inset-0.5 rounded-full transition-colors ${getDotFillColor(update.type)}`}></div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      {/* Type badge */}
                      {update.type && (
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${getTypeBgColor(update.type)} mb-1`}>
                          {update.type}
                        </span>
                      )}
                      
                      {/* Summary */}
                      <p className="text-sm text-gray-900 leading-relaxed mb-1">
                        {update.summary}
                      </p>
                      
                      {/* Meta info */}
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {/* Repo tag */}
                        {update.repo && (
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${getRepoBgColor(update.repo)}`}>
                            {update.repo}
                          </span>
                        )}
                        
                        {/* Clickable commit hash */}
                        <a
                          href={`https://github.com/openlearnnitj/openlearn-${update.repo || 'frontend'}/commit/${update.commitHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full transition-colors hover:text-gray-700"
                          title={`View commit ${update.commitHash} on GitHub`}
                        >
                          <GitCommit className="w-3 h-3 mr-1" />
                          <span className="font-mono">{update.commitHash}</span>
                          <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                        </a>
                        
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${getCategoryBgColor(update.category)}`}>
                          {update.category}
                        </span>
                        <span>by {update.author}</span>
                      </div>
                    </div>
                    
                    {/* Time */}
                    <div className="text-xs text-gray-400 text-right min-w-0 ml-2">
                      <div className="bg-gray-50 px-2 py-1 rounded text-gray-600 mb-1">
                        {formatDetailedDate(update.date)}
                      </div>
                      <div className="flex items-center justify-end">
                        <Clock className="w-3 h-3 mr-1" />
                        {update.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreUpdates && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMoreUpdates}
              disabled={loadingMore}
              className="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-[#FFDE59] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  View More ({allUpdates.length - displayedUpdates.length} remaining)
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        {!hasMoreUpdates && (
          <div className="mt-12 pt-6 border-t border-gray-100 text-center">
            <div className="inline-flex items-center text-xs text-gray-500">
              <GitCommit className="w-3 h-3 mr-2" />
              <span>
                All updates loaded • Auto-synced with git history
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UpdatesPage
