'use client'

import { useState } from 'react'
import { createNote, updateNote } from '@/app/actions/notes'

interface Note {
  id: string
  title: string
  description: string
  due_date: string | null
  related_type: string | null
  related_id: string | null
}

interface NoteModalProps {
  note: Note | null
  onClose: () => void
}

export default function NoteModal({ note, onClose }: NoteModalProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    let result
    if (note) {
      result = await updateNote(note.id, formData)
    } else {
      result = await createNote(formData)
    }
    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">
          {note ? 'Not Düzenle' : 'Yeni Not'}
        </h2>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlık
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={note?.title || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={note?.description || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              name="due_date"
              defaultValue={
                note?.due_date
                  ? new Date(note.due_date).toISOString().split('T')[0]
                  : ''
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İlişkili Tür
            </label>
            <select
              name="related_type"
              defaultValue={note?.related_type || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Yok</option>
              <option value="lead">Potansiyel Müşteri</option>
              <option value="customer">Müşteri</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İlişkili ID
            </label>
            <input
              type="text"
              name="related_id"
              defaultValue={note?.related_id || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="İsteğe bağlı: İlişkili potansiyel müşteri veya müşteri ID'si"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {note ? 'Güncelle' : 'Oluştur'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
