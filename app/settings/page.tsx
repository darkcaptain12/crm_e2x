'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { changePassword } from '@/app/actions/auth'

export default function SettingsPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handlePasswordChange(formData: FormData) {
    setError(null)
    setSuccess(null)
    const result = await changePassword(formData)
    if (result?.error) {
      setError(result.error)
    } else {
                setSuccess('Şifre başarıyla değiştirildi!')
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Ayarlar</h1>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Şifre Değiştir</h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
            <form action={handlePasswordChange} className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Şifreyi Onayla
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Şifreyi Değiştir
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tema Rengi</h2>
            <p className="text-gray-600 mb-4">
              Tema rengi Turkuaz (Birincil) olarak ayarlanmıştır. Değiştirmek için
              Tailwind yapılandırmasını düzenleyin.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-500 rounded-lg"></div>
              <div>
                <p className="font-medium">Turkuaz</p>
                <p className="text-sm text-gray-500">Birincil Renk</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
