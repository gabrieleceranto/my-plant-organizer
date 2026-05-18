'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Email o password non corretti.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>🌿 Catalogo Piante</h1>
      <p style={styles.subtitle}>Accedi al tuo catalogo</p>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Accesso…' : 'Accedi'}
        </button>
      </form>
      <p style={styles.link}>
        Non hai un account?{' '}
        <a href="/register" style={{ color: '#2d4a2d' }}>Registrati con codice invito</a>
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
