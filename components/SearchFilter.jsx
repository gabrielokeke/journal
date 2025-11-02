"use client"
import { useState, useEffect } from 'react'
import { LuSearch, LuX, LuFilter, LuCalendar, LuSmile, LuTag, LuArrowUpDown } from 'react-icons/lu'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchFilter({ entries, onFilteredResults }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMood, setSelectedMood] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['All', 'Work', 'Personal', 'Health', 'Learning', 'Creative', 'Social', 'Other']
  const moods = ['All', '1', '2', '3', '4', '5']
  const moodLabels = {
    'All': 'All Moods',
    '1': '😢 Very Low',
    '2': '😞 Low',
    '3': '😐 Neutral',
    '4': '😊 Good',
    '5': '🎉 Excellent'
  }
  const dateFilters = ['All', 'Today', 'This Week', 'This Month']
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'best-mood', label: 'Best Mood' },
    { value: 'worst-mood', label: 'Worst Mood' },
    { value: 'a-z', label: 'A-Z' },
    { value: 'z-a', label: 'Z-A' }
  ]

  useEffect(() => {
    filterAndSortEntries()
  }, [searchQuery, selectedCategory, selectedMood, dateFilter, sortBy, entries])

  const filterAndSortEntries = () => {
    let filtered = [...entries]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(entry => entry.category === selectedCategory)
    }

    // Mood filter
    if (selectedMood !== 'All') {
      filtered = filtered.filter(entry => entry.mood === parseInt(selectedMood))
    }

    // Date filter
    if (dateFilter !== 'All') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.createdAt)
        
        if (dateFilter === 'Today') {
          return entryDate >= today
        } else if (dateFilter === 'This Week') {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return entryDate >= weekAgo
        } else if (dateFilter === 'This Month') {
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return entryDate >= monthAgo
        }
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'best-mood':
          return b.mood - a.mood
        case 'worst-mood':
          return a.mood - b.mood
        case 'a-z':
          return a.title.localeCompare(b.title)
        case 'z-a':
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    onFilteredResults(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedMood('All')
    setDateFilter('All')
    setSortBy('newest')
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedMood !== 'All' || dateFilter !== 'All' || sortBy !== 'newest'

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1 relative">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search entries by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <LuX className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <LuFilter className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && !showFilters && (
            <span className="bg-white text-purple-600 text-xs px-2 py-0.5 rounded-full font-bold">
              •
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-200 space-y-4">
              {/* Category Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <LuTag className="w-4 h-4" />
                  <span>Category</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <LuSmile className="w-4 h-4" />
                  <span>Mood</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {moods.map(mood => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedMood === mood
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {moodLabels[mood]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <LuCalendar className="w-4 h-4" />
                  <span>Date Range</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {dateFilters.map(filter => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        dateFilter === filter
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <LuArrowUpDown className="w-4 h-4" />
                  <span>Sort By</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <LuX className="w-4 h-4" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {hasActiveFilters && !showFilters && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              <span>Search: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-purple-900">
                <LuX className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <span>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory('All')} className="hover:text-blue-900">
                <LuX className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedMood !== 'All' && (
            <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <span>Mood: {moodLabels[selectedMood]}</span>
              <button onClick={() => setSelectedMood('All')} className="hover:text-green-900">
                <LuX className="w-3 h-3" />
              </button>
            </span>
          )}
          {dateFilter !== 'All' && (
            <span className="inline-flex items-center space-x-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              <span>{dateFilter}</span>
              <button onClick={() => setDateFilter('All')} className="hover:text-orange-900">
                <LuX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}