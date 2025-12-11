import { getNotes } from '@/app/actions/notes'
import Sidebar from '@/components/Sidebar'
import NotesList from '@/components/NotesList'

export default async function NotesPage() {
  let notes = []
  try {
    notes = await getNotes()
  } catch (error) {
    console.error('Error loading notes page:', error)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Notlar</h1>
          </div>
          <NotesList notes={notes} />
        </div>
      </main>
    </div>
  )
}
