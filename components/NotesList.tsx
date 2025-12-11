'use client'

import { useState } from 'react'
import { deleteNote } from '@/app/actions/notes'
import NoteModal from './NoteModal'

interface Note {
  id: string
  title: string
  description: string
  due_date: string | null
  related_type: string | null
  related_id: string | null
  created_at: string
}

interface NotesListProps {
  notes: Note[]
}

export default function NotesList({ notes: initialNotes }: NotesListProps) {
  const [notes, setNotes] = useState(initialNotes || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      const result = await deleteNote(id)
      if (result?.error) {
        setError(result.error)
      } else {
        setNotes(notes.filter((note) => note.id !== id))
      }
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const isDueToday = (dueDate: string | null) => {
    if (!dueDate) return false
    const today = new Date()
    const due = new Date(dueDate)
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    )
  }

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEditingNote(null)
            setIsModalOpen(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Yeni Not
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Not bulunamadı. &quot;Yeni Not&quot; butonuna tıklayarak ekleyebilirsiniz.
          </div>
        ) : (
          notes.map((note) => (
          <div
            key={note.id}
            className={`bg-white rounded-lg shadow p-6 border-l-4 ${
              isOverdue(note.due_date)
                ? 'border-red-500'
                : isDueToday(note.due_date)
                ? 'border-yellow-500'
                : 'border-primary-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {note.title}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(note)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Düzenle"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Sil"
                >
                  🗑️
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{note.description}</p>
            <div className="flex items-center justify-between text-sm">
              {note.due_date && (
                <span
                  className={`px-2 py-1 rounded ${
                    isOverdue(note.due_date)
                      ? 'bg-red-100 text-red-800'
                      : isDueToday(note.due_date)
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Bitiş: {new Date(note.due_date).toLocaleDateString('tr-TR')}
                </span>
              )}
              {note.related_type && (
                <span className="px-2 py-1 rounded bg-primary-100 text-primary-800">
                  {note.related_type}
                </span>
              )}
            </div>
          </div>
          ))
        )}
      </div>
      {isModalOpen && (
        <NoteModal
          note={editingNote}
          onClose={() => {
            setIsModalOpen(false)
            setEditingNote(null)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
