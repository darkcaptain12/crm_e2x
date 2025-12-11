'use client'

import { useState } from 'react'
import { createNote } from '@/app/actions/notes'
import { useRouter } from 'next/navigation'

interface Note {
  id: string
  title: string
  description: string | null
  category?: string
  due_date: string | null
  created_at: string
}

interface CustomerTimelineProps {
  customerId: string
  initialNotes: Note[]
}

const NOTE_CATEGORIES = [
  { value: 'Arama', label: '📞 Arama' },
  { value: 'WhatsApp', label: '💬 WhatsApp' },
  { value: 'Mail', label: '📧 Mail' },
  { value: 'Not', label: '📝 Not' },
]

export default function CustomerTimeline({ customerId, initialNotes }: CustomerTimelineProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes || [])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [formData, setFormData] = useState({
    category: 'Not',
    description: '',
    next_action_date: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.category)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('related_type', 'customer')
      formDataToSend.append('related_id', customerId)
      if (formData.next_action_date) {
        formDataToSend.append('due_date', new Date(formData.next_action_date).toISOString())
      }

      const result = await createNote(formDataToSend)
      if (result?.error) {
        alert(result.error)
      } else {
        setFormData({ category: 'Not', description: '', next_action_date: '' })
        setIsAddingNote(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating note:', error)
      alert('Not eklenirken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryIcon = (category: string) => {
    const cat = NOTE_CATEGORIES.find(c => c.value === category)
    return cat ? cat.label.split(' ')[0] : '📝'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Zaman Çizelgesi</h2>
        <button
          onClick={() => setIsAddingNote(!isAddingNote)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          {isAddingNote ? 'İptal' : '+ Yeni Not Ekle'}
        </button>
      </div>

      {isAddingNote && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                {NOTE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Not
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                required
                placeholder="Notunuzu buraya yazın..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sonraki İşlem Tarihi (Opsiyonel)
              </label>
              <input
                type="datetime-local"
                value={formData.next_action_date}
                onChange={(e) => setFormData({ ...formData, next_action_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Henüz not eklenmemiş. İlk notunuzu ekleyerek başlayın!
        </p>
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <div key={note.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                  {getCategoryIcon(note.title || 'Not')}
                </div>
                {index < notes.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900">{note.title}</h3>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(note.created_at)}
                  </span>
                </div>
                {note.description && (
                  <p className="text-gray-600 text-sm mb-2">{note.description}</p>
                )}
                {note.due_date && (
                  <p className="text-xs text-gray-500">
                    📅 Sonraki işlem: {formatDateTime(note.due_date)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
