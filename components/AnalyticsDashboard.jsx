"use client"
import { useState, useEffect, useRef } from 'react'
import { LuTrendingUp, LuCalendar, LuPieChart, LuBarChart3, LuActivity } from 'react-icons/lu'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

console.log('📊 [AnalyticsDashboard] Module loaded')

// Dynamically import Recharts to avoid SSR issues
const LineChart = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading LineChart...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] LineChart loaded')
    return mod.LineChart
  })
}, { ssr: false })

const Line = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading Line...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] Line loaded')
    return mod.Line
  })
}, { ssr: false })

const BarChart = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading BarChart...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] BarChart loaded')
    return mod.BarChart
  })
}, { ssr: false })

const Bar = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading Bar...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] Bar loaded')
    return mod.Bar
  })
}, { ssr: false })

const PieChart = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading PieChart...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] PieChart loaded')
    return mod.PieChart
  })
}, { ssr: false })

const Pie = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading Pie...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] Pie loaded')
    return mod.Pie
  })
}, { ssr: false })

const Cell = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading Cell...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] Cell loaded')
    return mod.Cell
  })
}, { ssr: false })

const XAxis = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading XAxis...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] XAxis loaded')
    return mod.XAxis
  })
}, { ssr: false })

const YAxis = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading YAxis...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] YAxis loaded')
    return mod.YAxis
  })
}, { ssr: false })

const CartesianGrid = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading CartesianGrid...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] CartesianGrid loaded')
    return mod.CartesianGrid
  })
}, { ssr: false })

const Tooltip = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading Tooltip...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] Tooltip loaded')
    return mod.Tooltip
  })
}, { ssr: false })

const Legend = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading Legend...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] Legend loaded')
    return mod.Legend
  })
}, { ssr: false })

const ResponsiveContainer = dynamic(() => {
  console.log('📊 [AnalyticsDashboard] Loading ResponsiveContainer...')
  return import('recharts').then(mod => {
    console.log('✅ [AnalyticsDashboard] ResponsiveContainer loaded')
    return mod.ResponsiveContainer
  })
}, { ssr: false })

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

const moodEmojis = {
  1: '😢',
  2: '😞',
  3: '😐',
  4: '😊',
  5: '🎉'
}

const categoryColors = {
  Work: '#3b82f6',
  Personal: '#10b981',
  Health: '#ef4444',
  Learning: '#8b5cf6',
  Creative: '#ec4899',
  Social: '#f59e0b',
  Other: '#6366f1'
}

export default function AnalyticsDashboard({ entries }) {
  console.log('📊 [AnalyticsDashboard] Component rendered with entries:', entries?.length || 0)
  
  const isMountedRef = useRef(true)
  const isInitializedRef = useRef(false)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageMood: 0,
    entriesThisMonth: 0,
    mostUsedCategory: ''
  })

  useEffect(() => {
    console.log('📊 [AnalyticsDashboard] Mount effect running')
    
    if (!isMountedRef.current) {
      console.log('⚠️ [AnalyticsDashboard] Component not mounted, skipping')
      return
    }
    
    if (isInitializedRef.current) {
      console.log('⚠️ [AnalyticsDashboard] Already initialized, skipping')
      return
    }
    
    console.log('✅ [AnalyticsDashboard] Setting isClient to true')
    setIsClient(true)
    isInitializedRef.current = true
    
    return () => {
      console.log('🧹 [AnalyticsDashboard] Cleanup running')
      isMountedRef.current = false
      isInitializedRef.current = false
    }
  }, [])

  useEffect(() => {
    console.log('📊 [AnalyticsDashboard] Entries changed, recalculating stats')
    console.log('📊 [AnalyticsDashboard] Entries count:', entries?.length || 0)
    
    if (!isMountedRef.current) {
      console.log('⚠️ [AnalyticsDashboard] Component not mounted, skipping stats calculation')
      return
    }
    
    try {
      calculateStats()
    } catch (error) {
      console.error('❌ [AnalyticsDashboard] Error calculating stats:', error)
    }
  }, [entries])

  const calculateStats = () => {
    console.log('📊 [AnalyticsDashboard] calculateStats() called')
    
    if (!entries || entries.length === 0) {
      console.log('⚠️ [AnalyticsDashboard] No entries, skipping calculation')
      return
    }

    try {
      // Total entries
      const totalEntries = entries.length
      console.log('📊 [AnalyticsDashboard] Total entries:', totalEntries)

      // Average mood
      const moodSum = entries.reduce((sum, e) => {
        console.log('📊 [AnalyticsDashboard] Processing entry mood:', e.mood)
        return sum + e.mood
      }, 0)
      const avgMood = (moodSum / entries.length).toFixed(1)
      console.log('📊 [AnalyticsDashboard] Average mood:', avgMood)

      // Entries this month
      const now = new Date()
      console.log('📊 [AnalyticsDashboard] Current date:', now)
      
      const thisMonth = entries.filter(e => {
        const entryDate = new Date(e.createdAt)
        const isThisMonth = entryDate.getMonth() === now.getMonth() && 
               entryDate.getFullYear() === now.getFullYear()
        console.log('📊 [AnalyticsDashboard] Entry date:', entryDate, 'Is this month:', isThisMonth)
        return isThisMonth
      }).length
      console.log('📊 [AnalyticsDashboard] Entries this month:', thisMonth)

      // Most used category
      const categoryCounts = entries.reduce((acc, e) => {
        console.log('📊 [AnalyticsDashboard] Processing category:', e.category)
        acc[e.category] = (acc[e.category] || 0) + 1
        return acc
      }, {})
      console.log('📊 [AnalyticsDashboard] Category counts:', categoryCounts)
      
      const mostUsed = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
      console.log('📊 [AnalyticsDashboard] Most used category:', mostUsed)

      // Calculate streaks
      console.log('📊 [AnalyticsDashboard] Calculating streaks...')
      const { current, longest } = calculateStreaks(entries)
      console.log('📊 [AnalyticsDashboard] Streaks calculated - Current:', current, 'Longest:', longest)

      const newStats = {
        totalEntries,
        currentStreak: current,
        longestStreak: longest,
        averageMood: avgMood,
        entriesThisMonth: thisMonth,
        mostUsedCategory: mostUsed
      }
      
      console.log('📊 [AnalyticsDashboard] Setting new stats:', newStats)
      
      if (isMountedRef.current) {
        setStats(newStats)
        console.log('✅ [AnalyticsDashboard] Stats updated successfully')
      } else {
        console.log('⚠️ [AnalyticsDashboard] Component unmounted, skipping state update')
      }
    } catch (error) {
      console.error('❌ [AnalyticsDashboard] Error in calculateStats:', error)
      console.error('❌ [AnalyticsDashboard] Error stack:', error.stack)
    }
  }

  const calculateStreaks = (entries) => {
    console.log('📊 [AnalyticsDashboard] calculateStreaks() called with', entries.length, 'entries')
    
    if (!entries || entries.length === 0) {
      console.log('⚠️ [AnalyticsDashboard] No entries for streak calculation')
      return { current: 0, longest: 0 }
    }

    try {
      // Sort entries by date
      console.log('📊 [AnalyticsDashboard] Sorting entries by date...')
      const sortedDates = entries
        .map(e => {
          const dateStr = new Date(e.createdAt).toDateString()
          console.log('📊 [AnalyticsDashboard] Entry date:', dateStr)
          return dateStr
        })
        .filter((date, index, self) => {
          const isUnique = self.indexOf(date) === index
          console.log('📊 [AnalyticsDashboard] Date', date, 'is unique:', isUnique)
          return isUnique
        })
        .sort((a, b) => {
          const comparison = new Date(b) - new Date(a)
          console.log('📊 [AnalyticsDashboard] Comparing dates:', a, 'vs', b, '=', comparison)
          return comparison
        })

      console.log('📊 [AnalyticsDashboard] Sorted unique dates:', sortedDates)

      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0

      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      console.log('📊 [AnalyticsDashboard] Today:', today)
      console.log('📊 [AnalyticsDashboard] Yesterday:', yesterday)
      console.log('📊 [AnalyticsDashboard] Most recent entry:', sortedDates[0])

      // Check if streak is active (entry today or yesterday)
      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        console.log('✅ [AnalyticsDashboard] Streak is active!')
        currentStreak = 1
        tempStreak = 1

        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1])
          const currDate = new Date(sortedDates[i])
          const diffDays = Math.floor((prevDate - currDate) / 86400000)
          
          console.log('📊 [AnalyticsDashboard] Checking streak:', sortedDates[i-1], 'to', sortedDates[i], '=', diffDays, 'days')

          if (diffDays === 1) {
            currentStreak++
            tempStreak++
            console.log('✅ [AnalyticsDashboard] Streak continues! Current:', currentStreak)
          } else {
            console.log('❌ [AnalyticsDashboard] Streak broken at', sortedDates[i])
            break
          }
        }
      } else {
        console.log('⚠️ [AnalyticsDashboard] No active streak (last entry not recent)')
      }

      // Calculate longest streak
      console.log('📊 [AnalyticsDashboard] Calculating longest streak...')
      tempStreak = 1
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1])
        const currDate = new Date(sortedDates[i])
        const diffDays = Math.floor((prevDate - currDate) / 86400000)
        
        console.log('📊 [AnalyticsDashboard] Longest streak check:', sortedDates[i-1], 'to', sortedDates[i], '=', diffDays, 'days')

        if (diffDays === 1) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
          console.log('📊 [AnalyticsDashboard] Longest streak updated:', longestStreak)
        } else {
          tempStreak = 1
          console.log('📊 [AnalyticsDashboard] Longest streak reset')
        }
      }

      longestStreak = Math.max(longestStreak, currentStreak, 1)
      console.log('✅ [AnalyticsDashboard] Final streaks - Current:', currentStreak, 'Longest:', longestStreak)

      return { current: currentStreak, longest: longestStreak }
    } catch (error) {
      console.error('❌ [AnalyticsDashboard] Error in calculateStreaks:', error)
      console.error('❌ [AnalyticsDashboard] Error stack:', error.stack)
      return { current: 0, longest: 0 }
    }
  }

  // Prepare mood trend data (last 30 days)
  const getMoodTrendData = () => {
    console.log('📊 [AnalyticsDashboard] getMoodTrendData() called')
    
    try {
      const last30Days = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        console.log('📊 [AnalyticsDashboard] Processing date:', dateStr)
        
        const dayEntries = entries.filter(e => {
          const entryDateStr = new Date(e.createdAt).toISOString().split('T')[0]
          const matches = entryDateStr === dateStr
          console.log('📊 [AnalyticsDashboard] Entry', e._id, 'date:', entryDateStr, 'matches:', matches)
          return matches
        })
        
        console.log('📊 [AnalyticsDashboard] Entries for', dateStr, ':', dayEntries.length)
        
        const avgMood = dayEntries.length > 0
          ? dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length
          : null

        console.log('📊 [AnalyticsDashboard] Average mood for', dateStr, ':', avgMood)

        last30Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          mood: avgMood ? parseFloat(avgMood.toFixed(1)) : null,
          count: dayEntries.length
        })
      }
      
      const filteredData = last30Days.filter(d => d.mood !== null)
      console.log('✅ [AnalyticsDashboard] Mood trend data:', filteredData.length, 'days with data')
      return filteredData
    } catch (error) {
      console.error('❌ [AnalyticsDashboard] Error in getMoodTrendData:', error)
      console.error('❌ [AnalyticsDashboard] Error stack:', error.stack)
      return []
    }
  }

  // Prepare category distribution data
  const getCategoryData = () => {
    console.log('📊 [AnalyticsDashboard] getCategoryData() called')
    
    try {
      const categoryCounts = entries.reduce((acc, e) => {
        console.log('📊 [AnalyticsDashboard] Processing category:', e.category)
        acc[e.category] = (acc[e.category] || 0) + 1
        return acc
      }, {})

      console.log('📊 [AnalyticsDashboard] Category counts:', categoryCounts)

      const categoryData = Object.entries(categoryCounts).map(([name, value]) => {
        const data = {
          name,
          value,
          color: categoryColors[name] || '#6366f1'
        }
        console.log('📊 [AnalyticsDashboard] Category data:', data)
        return data
      })
      
      console.log('✅ [AnalyticsDashboard] Category data prepared:', categoryData.length, 'categories')
      return categoryData
    } catch (error) {
      console.error('❌ [AnalyticsDashboard] Error in getCategoryData:', error)
      console.error('❌ [AnalyticsDashboard] Error stack:', error.stack)
      return []
    }
  }

  // Prepare entries per month data
  const getMonthlyData = () => {
    console.log('📊 [AnalyticsDashboard] getMonthlyData() called')
    
    try {
      const monthlyData = {}
      
      entries.forEach(entry => {
        const date = new Date(entry.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        console.log('📊 [AnalyticsDashboard] Entry date:', date, 'Month key:', monthKey)
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { entries: 0, totalMood: 0 }
          console.log('📊 [AnalyticsDashboard] Created new month entry:', monthKey)
        }
        
        monthlyData[monthKey].entries++
        monthlyData[monthKey].totalMood += entry.mood
        console.log('📊 [AnalyticsDashboard] Updated month', monthKey, ':', monthlyData[monthKey])
      })

      console.log('📊 [AnalyticsDashboard] Monthly data:', monthlyData)

      const sortedData = Object.entries(monthlyData)
        .sort((a, b) => {
          const comparison = a[0].localeCompare(b[0])
          console.log('📊 [AnalyticsDashboard] Sorting months:', a[0], 'vs', b[0], '=', comparison)
          return comparison
        })
        .slice(-6) // Last 6 months
        .map(([month, data]) => {
          const formattedData = {
            month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            entries: data.entries,
            avgMood: parseFloat((data.totalMood / data.entries).toFixed(1))
          }
          console.log('📊 [AnalyticsDashboard] Formatted month data:', formattedData)
          return formattedData
        })
      
      console.log('✅ [AnalyticsDashboard] Monthly data prepared:', sortedData.length, 'months')
      return sortedData
    } catch (error) {
      console.error('❌ [AnalyticsDashboard] Error in getMonthlyData:', error)
      console.error('❌ [AnalyticsDashboard] Error stack:', error.stack)
      return []
    }
  }

  if (!entries || entries.length === 0) {
    console.log('⚠️ [AnalyticsDashboard] No entries, showing empty state')
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <LuBarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Yet</h3>
        <p className="text-gray-600">Start writing entries to see your analytics and insights!</p>
      </div>
    )
  }

  console.log('📊 [AnalyticsDashboard] Rendering full dashboard')
  console.log('📊 [AnalyticsDashboard] Active tab:', activeTab)
  console.log('📊 [AnalyticsDashboard] Is client:', isClient)
  console.log('📊 [AnalyticsDashboard] Stats:', stats)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white"
          onAnimationStart={() => console.log('📊 [AnalyticsDashboard] Total Entries card animating')}
          onAnimationComplete={() => console.log('✅ [AnalyticsDashboard] Total Entries card animation complete')}
        >
          <div className="flex items-center justify-between mb-2">
            <LuActivity className="w-5 h-5" />
            <span className="text-2xl font-bold">{stats.totalEntries}</span>
          </div>
          <p className="text-purple-100 text-sm">Total Entries</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white"
          onAnimationStart={() => console.log('📊 [AnalyticsDashboard] Avg Mood card animating')}
          onAnimationComplete={() => console.log('✅ [AnalyticsDashboard] Avg Mood card animation complete')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{moodEmojis[Math.round(stats.averageMood)] || '😐'}</span>
            <span className="text-2xl font-bold">{stats.averageMood}</span>
          </div>
          <p className="text-blue-100 text-sm">Avg Mood</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white"
          onAnimationStart={() => console.log('📊 [AnalyticsDashboard] This Month card animating')}
          onAnimationComplete={() => console.log('✅ [AnalyticsDashboard] This Month card animation complete')}
        >
          <div className="flex items-center justify-between mb-2">
            <LuCalendar className="w-5 h-5" />
            <span className="text-2xl font-bold">{stats.entriesThisMonth}</span>
          </div>
          <p className="text-green-100 text-sm">This Month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white"
          onAnimationStart={() => console.log('📊 [AnalyticsDashboard] Current Streak card animating')}
          onAnimationComplete={() => console.log('✅ [AnalyticsDashboard] Current Streak card animation complete')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">🔥</span>
            <span className="text-2xl font-bold">{stats.currentStreak}</span>
          </div>
          <p className="text-orange-100 text-sm">Current Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white"
          onAnimationStart={() => console.log('📊 [AnalyticsDashboard] Longest Streak card animating')}
          onAnimationComplete={() => console.log('✅ [AnalyticsDashboard] Longest Streak card animation complete')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">🏆</span>
            <span className="text-2xl font-bold">{stats.longestStreak}</span>
          </div>
          <p className="text-red-100 text-sm">Longest Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-white"
          onAnimationStart={() => console.log('📊 [AnalyticsDashboard] Top Category card animating')}
          onAnimationComplete={() => console.log('✅ [AnalyticsDashboard] Top Category card animation complete')}
        >
          <div className="flex items-center justify-between mb-2">
            <LuPieChart className="w-5 h-5" />
            <span className="text-sm font-bold truncate">{stats.mostUsedCategory}</span>
          </div>
          <p className="text-pink-100 text-sm">Top Category</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {['overview', 'mood', 'categories', 'activity'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  console.log('📊 [AnalyticsDashboard] Tab clicked:', tab)
                  setActiveTab(tab)
                }}
                className={`px-6 py-4 font-medium capitalize whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Only render charts on client side */}
          {!isClient ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {console.log('📊 [AnalyticsDashboard] Rendering tab content:', activeTab)}
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {console.log('📊 [AnalyticsDashboard] Rendering Overview tab')}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <LuTrendingUp className="w-5 h-5" />
                      <span>Mood Trend (Last 30 Days)</span>
                    </h3>
                    {console.log('📊 [AnalyticsDashboard] Rendering Mood Trend chart')}
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getMoodTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    {console.log('✅ [AnalyticsDashboard] Mood Trend chart rendered')}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <LuPieChart className="w-5 h-5" />
                        <span>Category Distribution</span>
                      </h3>
                      {console.log('📊 [AnalyticsDashboard] Rendering Category Distribution chart')}
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={getCategoryData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => {
                              console.log('📊 [AnalyticsDashboard] Rendering pie label:', name, percent)
                              return `${name} ${(percent * 100).toFixed(0)}%`
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getCategoryData().map((entry, index) => {
                              console.log('📊 [AnalyticsDashboard] Rendering pie cell:', entry.name, entry.color)
                              return <Cell key={`cell-${index}`} fill={entry.color} />
                            })}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      {console.log('✅ [AnalyticsDashboard] Category Distribution chart rendered')}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <LuBarChart3 className="w-5 h-5" />
                        <span>Monthly Activity</span>
                      </h3>
                      {console.log('📊 [AnalyticsDashboard] Rendering Monthly Activity chart')}
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={getMonthlyData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="entries" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                      {console.log('✅ [AnalyticsDashboard] Monthly Activity chart rendered')}
                    </div>
                  </div>
                </div>
              )}

              {/* Mood Tab */}
              {activeTab === 'mood' && (
                <div className="space-y-6">
                  {console.log('📊 [AnalyticsDashboard] Rendering Mood tab')}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Over Time</h3>
                    {console.log('📊 [AnalyticsDashboard] Rendering Mood Over Time chart')}
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={getMoodTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          name="Average Mood"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    {console.log('✅ [AnalyticsDashboard] Mood Over Time chart rendered')}
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    {console.log('📊 [AnalyticsDashboard] Rendering mood distribution cards')}
                    {[1, 2, 3, 4, 5].map(mood => {
                      const count = entries.filter(e => e.mood === mood).length
                      const percentage = ((count / entries.length) * 100).toFixed(1)
                      console.log('📊 [AnalyticsDashboard] Mood', mood, '- Count:', count, 'Percentage:', percentage)
                      return (
                        <div key={mood} className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-4xl mb-2">{moodEmojis[mood]}</div>
                          <div className="text-2xl font-bold text-gray-900">{count}</div>
                          <div className="text-sm text-gray-600">{percentage}%</div>
                        </div>
                      )
                    })}
                    {console.log('✅ [AnalyticsDashboard] Mood distribution cards rendered')}
                  </div>
                </div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {console.log('📊 [AnalyticsDashboard] Rendering Categories tab')}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
                    {console.log('📊 [AnalyticsDashboard] Rendering large Category Distribution chart')}
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={getCategoryData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value, percent }) => {
                            const label = `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                            console.log('📊 [AnalyticsDashboard] Rendering detailed pie label:', label)
                            return label
                          }}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getCategoryData().map((entry, index) => {
                            console.log('📊 [AnalyticsDashboard] Rendering detailed pie cell:', entry.name, entry.color)
                            return <Cell key={`cell-${index}`} fill={entry.color} />
                          })}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {console.log('✅ [AnalyticsDashboard] Large Category Distribution chart rendered')}
                  </div>

                  <div className="space-y-3">
                    {console.log('📊 [AnalyticsDashboard] Rendering category list')}
                    {getCategoryData()
                      .sort((a, b) => {
                        console.log('📊 [AnalyticsDashboard] Sorting categories:', a.name, 'vs', b.name)
                        return b.value - a.value
                      })
                      .map(cat => {
                        const percentage = ((cat.value / entries.length) * 100).toFixed(1)
                        console.log('📊 [AnalyticsDashboard] Category item:', cat.name, '- Value:', cat.value, 'Percentage:', percentage)
                        return (
                          <div key={cat.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="font-medium">{cat.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-gray-600">{cat.value} entries</span>
                              <span className="font-bold text-purple-600">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    {console.log('✅ [AnalyticsDashboard] Category list rendered')}
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  {console.log('📊 [AnalyticsDashboard] Rendering Activity tab')}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Entries Per Month</h3>
                    {console.log('📊 [AnalyticsDashboard] Rendering Entries Per Month chart')}
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={getMonthlyData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="entries" fill="#8b5cf6" name="Entries" />
                      </BarChart>
                    </ResponsiveContainer>
                    {console.log('✅ [AnalyticsDashboard] Entries Per Month chart rendered')}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                      {console.log('📊 [AnalyticsDashboard] Rendering Writing Patterns card')}
                      <h4 className="font-semibold text-gray-900 mb-4">Writing Patterns</h4>
                      <div className="space-y-3">
                        {(() => {
                          const monthlyData = getMonthlyData()
                          const mostProductiveMonth = monthlyData.sort((a, b) => b.entries - a.entries)[0]?.month || 'N/A'
                          const avgEntriesPerMonth = (entries.length / Math.max(monthlyData.length, 1)).toFixed(1)
                          
                          console.log('📊 [AnalyticsDashboard] Most productive month:', mostProductiveMonth)
                          console.log('📊 [AnalyticsDashboard] Average entries/month:', avgEntriesPerMonth)
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Most productive month:</span>
                                <span className="font-semibold">{mostProductiveMonth}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Average entries/month:</span>
                                <span className="font-semibold">{avgEntriesPerMonth}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Current streak:</span>
                                <span className="font-semibold">{stats.currentStreak} days 🔥</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Longest streak:</span>
                                <span className="font-semibold">{stats.longestStreak} days 🏆</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                      {console.log('✅ [AnalyticsDashboard] Writing Patterns card rendered')}
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      {console.log('📊 [AnalyticsDashboard] Rendering Mood Insights card')}
                      <h4 className="font-semibold text-gray-900 mb-4">Mood Insights</h4>
                      <div className="space-y-3">
                        {(() => {
                          const monthlyData = getMonthlyData()
                          const bestMonthMood = monthlyData.length > 0 
                            ? Math.max(...monthlyData.map(m => m.avgMood)).toFixed(1)
                            : '0'
                          
                          const happiestCategory = Object.entries(
                            entries.reduce((acc, e) => {
                              if (!acc[e.category]) acc[e.category] = []
                              acc[e.category].push(e.mood)
                              return acc
                            }, {})
                          )
                            .map(([cat, moods]) => ({
                              cat,
                              avg: moods.reduce((a, b) => a + b) / moods.length
                            }))
                            .sort((a, b) => b.avg - a.avg)[0]?.cat || 'N/A'
                          
                          console.log('📊 [AnalyticsDashboard] Best month mood:', bestMonthMood)
                          console.log('📊 [AnalyticsDashboard] Happiest category:', happiestCategory)
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Average mood:</span>
                                <span className="font-semibold">
                                  {stats.averageMood} {moodEmojis[Math.round(stats.averageMood)]}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Best month mood:</span>
                                <span className="font-semibold">{bestMonthMood} 🎉</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Happiest category:</span>
                                <span className="font-semibold">{happiestCategory}</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                      {console.log('✅ [AnalyticsDashboard] Mood Insights card rendered')}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {console.log('✅ [AnalyticsDashboard] Full dashboard rendered')}
    </div>
  )
}