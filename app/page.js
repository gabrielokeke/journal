"use client"
import { useState, useEffect } from 'react'
import Head from 'next/head'
import EntryForm from '../components/EntryForm'
import EntryCard from '../components/EntryCard'

export default function Home() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/entries')
      const data = await response.json()
      if (data.success) {
        setEntries(data.data)
        setError('')
      } else {
        setError(data.error || 'Failed to fetch entries')
      }
    } catch (err) {
      setError('Failed to fetch entries: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      const method = editingEntry ? 'PUT' : 'POST'
      const url = editingEntry ? `/api/entries/${editingEntry._id}` : '/api/entries'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage(editingEntry ? 'Entry updated!' : 'Entry created!')
        setEditingEntry(null)
        fetchEntries()
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Error submitting entry: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchEntries()
      } else {
        setError(data.error || 'Failed to delete entry')
      }
    } catch (err) {
      setError('Error deleting entry: ' + err.message)
    }
  }

  return (
    <>
      <Head>
        <title>Daily Journal</title>
      </Head>
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">My Daily Journal</h1>
        {successMessage && <div className="text-green-500 mb-2">{successMessage}</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <EntryForm onSubmit={handleSubmit} editingEntry={editingEntry} />
        {loading ? (
          <p>Loading...</p>
        ) : (
          entries.map((entry) => (
            <EntryCard
              key={entry._id}
              entry={entry}
              onEdit={() => setEditingEntry(entry)}
              onDelete={() => handleDelete(entry._id)}
            />
          ))
        )}
      </main>
    </>
  )
}
