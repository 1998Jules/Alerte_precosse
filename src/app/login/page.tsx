'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, LockKeyhole, UserRound } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-green-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-xl bg-green-600 p-3 text-white"><Home className="h-6 w-6" /></div>
          <div><h1 className="text-2xl font-bold text-gray-900">SysLAP</h1><p className="text-sm text-gray-500">Connexion à la plateforme</p></div>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom d’utilisateur ou e-mail</label>
        <div className="relative mb-4"><UserRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
        <div className="relative mb-6"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></div>
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">{submitting ? 'Connexion...' : 'Se connecter'}</button>
        <p className="mt-4 text-center text-sm text-gray-600">Pas encore de compte ? <Link href="/register" className="font-semibold text-green-700 hover:underline">Créer un compte</Link></p>
      </form>
    </main>
  )
}
