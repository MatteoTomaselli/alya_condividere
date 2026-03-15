'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Salva le credenziali nel localStorage
        localStorage.setItem('admin_email', email);
        localStorage.setItem('admin_session', 'true');
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Errore di autenticazione');
      }
    } catch (error) {
      setError('Errore di connessione');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center justify-center gap-2 mb-8 cursor-pointer hover:opacity-80">
              <div className="w-12 h-12 bg-pink-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">A</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Alya Admin</h1>
            </div>
          </Link>

          <p className="text-center text-black mb-8">Accedi all'area amministrativa</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="example@example.it"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-black pr-12"
                  placeholder="Inserisci la password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition"
                >
                  <i className={`mdi ${showPassword ? 'mdi-eye-off' : 'mdi-eye'} text-xl`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-400 hover:bg-pink-500 disabled:bg-gray-400 text-black font-semibold py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <Link href="/" className="block text-center text-sm text-black hover:text-gray-700 mt-10 underline">
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
