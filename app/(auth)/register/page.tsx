'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, code }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Registrazione fallita.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Registrazione riuscita, ma login fallito. Prova ad accedere.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>🌿 Registrati</h1>
      <p style={styles.subtitle}>Hai bisogno di un codice invito</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password (min. 6 caratteri)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Codice invito"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Registrazione…' : 'Registrati'}
        </button>
      </form>
      <p style={styles.link}>
        Hai già un account?{' '}
        <a href="/login" style={{ color: '#2d4a2d' }}>Accedi</a>
      </p>
    </div>
  );
}

const styles = {
  card: { background: 'white', borderRadius: 12, padding: '40px 36px', width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  title: { fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#2d4a2d', marginBottom: 4 },
  subtitle: { color: '#6b6b6b', fontSize: '0.85rem', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  input: { border: '1.5px solid #e0d8ce', borderRadius: 8, padding: '10px 14px', fontSize: '0.9rem', outline: 'none' },
  error: { color: '#c04040', fontSize: '0.82rem', margin: 0 },
  btn: { background: '#2d4a2d', color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontSize: '0.9rem', cursor: 'pointer', marginTop: 4 },
  link: { marginTop: 20, textAlign: 'center' as const, fontSize: '0.82rem', color: '#6b6b6b' },
};
