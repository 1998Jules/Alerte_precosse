'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', email: '', secteur_activite: '', whatsapp: '', password: '', password_confirm: '', recevoir_alertes: true })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const update = (key: string, value: string | boolean) => setForm(current => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription impossible')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl border border-green-100">
        <div className="flex items-center gap-3 mb-6"><div className="rounded-xl bg-green-600 p-3 text-white"><Home className="h-6 w-6" /></div><div><h1 className="text-2xl font-bold text-gray-900">Créer un compte SysLAP</h1><p className="text-sm text-gray-500">Les champs marqués d’un astérisque sont obligatoires.</p></div></div>
        <div className="grid gap-4 md:grid-cols-2">
          <input required placeholder="Prénom *" value={form.first_name} onChange={e => update('first_name', e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5" />
          <input required placeholder="Nom *" value={form.last_name} onChange={e => update('last_name', e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5" />
          <input required placeholder="Nom d’utilisateur *" value={form.username} onChange={e => update('username', e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5" />
          <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required type="email" placeholder="E-mail *" value={form.email} onChange={e => update('email', e.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></div>
          <input placeholder="Secteur d’activité" value={form.secteur_activite} onChange={e => update('secteur_activite', e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2.5" />
          <div className="relative"><Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="tel" placeholder="Numéro WhatsApp" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></div>
          <div className="relative"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required minLength={8} type="password" placeholder="Mot de passe *" value={form.password} onChange={e => update('password', e.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></div>
          <div className="relative"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required minLength={8} type="password" placeholder="Confirmer le mot de passe *" value={form.password_confirm} onChange={e => update('password_confirm', e.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></div>
        </div>
        <label className="mt-5 flex items-start gap-3 rounded-lg bg-green-50 p-3 text-sm text-gray-700"><input type="checkbox" checked={form.recevoir_alertes} onChange={e => update('recevoir_alertes', e.target.checked)} className="mt-1 h-4 w-4 accent-green-600" /><span>Je souhaite recevoir les alertes SysLAP par les canaux disponibles.</span></label>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="mt-6 w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">{submitting ? 'Création...' : 'Créer mon compte'}</button>
        <p className="mt-4 text-center text-sm text-gray-600">Déjà inscrit ? <Link href="/login" className="font-semibold text-green-700 hover:underline">Se connecter</Link></p>
      </form>
    </main>
  )
}
