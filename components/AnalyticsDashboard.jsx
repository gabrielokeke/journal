"use client"
import { useState, useEffect, useRef } from 'react'
import { LuTrendingUp, LuCalendar, LuPieChart, LuBarChart, LuActivity } from 'react-icons/lu'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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
  const isMountedRef = useRef(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageMood: 0,
    entriesThisMonth: 0,
    mostUsedCategory: ''
  })

  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (isMountedRef.current && entries && entries.length > 0) {
      calculateStats()
    }
  }, [entries])

  const calculateStats = () => {
    if (!entries || entries.length === 0) return

    const totalEntries = entries.length
    const avgMood = (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1)

    const now = new Date()
    const thisMonth = entries.filter(e => {
      const entryDate = new Date(e.createdAt)
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear()
    }).length

    const categoryCounts = entries.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1
      return acc
    }, {})
    const mostUsed = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

    const { current, longest } = calculateStreaks(entries)

    if (isMountedRef.current) {
      setStats({
        totalEntries,
        currentStreak: current,
        longestStreak: longest,
        averageMood: avgMood,
        entriesThisMonth: thisMonth,
        mostUsedCategory: mostUsed
      })
    }
  }

  const calculateStreaks = (entries) => {
    if (!entries || entries.length === 0) return { current: 0, longest: 0 }

    const sortedDates = entries
      .map(e => new Date(e.createdAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a))

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      currentStreak = 1
      tempStreak = 1

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1])
        const currDate = new Date(sortedDates[i])
        const diffDays = Math.floor((prevDate - currDate) / 86400000)

        if (diffDays === 1) {
          currentStreak++
          tempStreak++
        } else {
          break
        }
      }
    }

    tempStreak = 1
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const diffDays = Math.floor((prevDate - currDate) / 86400000)

      if (diffDays === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak, 1)

    return { current: currentStreak, longest: longestStreak }
  }

  const getMoodTrendData = () => {
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayEntries = entries.filter(e => 
        new Date(e.createdAt).toISOString().split('T')[0] === dateStr
      )
      
      const avgMood = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length
        : null

      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: avgMood ? parseFloat(avgMood.toFixed(1)) : null
      })
    }
    return last30Days.filter(d => d.mood !== null)
  }

  const getCategoryData = () => {
    const categoryCounts = entries.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1
      return acc
    }, {})

    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#6366f1'
    }))
  }

  const getMonthlyData = () => {
    const monthlyData = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { entries: 0, totalMood: 0 }
      }
      
      monthlyData[monthKey].entries++
      monthlyData[monthKey].totalMood += entry.mood
    })

    return Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        entries: data.entries,
        avgMood: parseFloat((data.totalMood / data.entries).toFixed(1))
      }))
  }

  // Chart configurations
  const moodTrendChartData = {
    labels: getMoodTrendData().map(d => d.date),
    datasets: [
      {
        label: 'Mood',
        data: getMoodTrendData().map(d => d.mood),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const moodTrendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        displayColors: false
      }
    },
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  const categoryChartData = {
    labels: getCategoryData().map(d => d.name),
    datasets: [
      {
        data: getCategoryData().map(d => d.value),
        backgroundColor: getCategoryData().map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  }

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }

  const monthlyChartData = {
    labels: getMonthlyData().map(d => d.month),
    datasets: [
      {
        label: 'Entries',
        data: getMonthlyData().map(d => d.entries),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  }

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <LuBarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Yet</h3>
        <p className="text-gray-600">Start writing entries to see your analytics and insights!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white"
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
                onClick={() => setActiveTab(tab)}
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <LuTrendingUp className="w-5 h-5" />
                  <span>Mood Trend (Last 30 Days)</span>
                </h3>
                <div className="h-[300px]">
                  <Line data={moodTrendChartData} options={moodTrendChartOptions} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <LuPieChart className="w-5 h-5" />
                    <span>Category Distribution</span>
                  </h3>
                  <div className="h-[250px]">
                    <Pie data={categoryChartData} options={categoryChartOptions} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <LuBarChart className="w-5 h-5" />
                    <span>Monthly Activity</span>
                  </h3>
                  <div className="h-[250px]">
                    <Bar data={monthlyChartData} options={monthlyChartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mood Tab */}
          {activeTab === 'mood' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Over Time</h3>
                <div className="h-[400px]">
                  <Line data={moodTrendChartData} options={{
                    ...moodTrendChartOptions,
                    plugins: {
                      ...moodTrendChartOptions.plugins,
                      legend: {
                        display: true,
                        position: 'top'
                      }
                    }
                  }} />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(mood => {
                  const count = entries.filter(e => e.mood === mood).length
                  const percentage = ((count / entries.length) * 100).toFixed(1)
                  return (
                    <div key={mood} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-4xl mb-2">{moodEmojis[mood]}</div>
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">{percentage}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
                <div className="h-[400px] flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <Pie data={categoryChartData} options={categoryChartOptions} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {getCategoryData()
                  .sort((a, b) => b.value - a.value)
                  .map(cat => (
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
                          {((cat.value / entries.length) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Entries Per Month</h3>
                <div className="h-[400px]">
                  <Bar data={monthlyChartData} options={{
                    ...monthlyChartOptions,
                    plugins: {
                      ...monthlyChartOptions.plugins,
                      legend: {
                        display: true,
                        position: 'top'
                      }
                    }
                  }} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Writing Patterns</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Most productive month:</span>
                      <span className="font-semibold">
                        {getMonthlyData().sort((a, b) => b.entries - a.entries)[0]?.month || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average entries/month:</span>
                      <span className="font-semibold">
                        {(entries.length / Math.max(getMonthlyData().length, 1)).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current streak:</span>
                      <span className="font-semibold">{stats.currentStreak} days 🔥</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longest streak:</span>
                      <span className="font-semibold">{stats.longestStreak} days 🏆</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Mood Insights</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average mood:</span>
                      <span className="font-semibold">
                        {stats.averageMood} {moodEmojis[Math.round(stats.averageMood)]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best month mood:</span>
                      <span className="font-semibold">
                        {getMonthlyData().length > 0 
                          ? Math.max(...getMonthlyData().map(m => m.avgMood)).toFixed(1)
                          : '0'} 🎉
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Happiest category:</span>
                      <span className="font-semibold">
                        {Object.entries(
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
                          .sort((a, b) => b.avg - a.avg)[0]?.cat || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}