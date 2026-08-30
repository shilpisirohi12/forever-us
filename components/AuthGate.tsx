'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { Heart, Loader2, LogIn, Mail, ShieldCheck, Users } from 'lucide-react';
import { createBrowserSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AuthGate({ children }: { children: ReactNode }) {
  const inactivityTimer = useRef<number | undefined>(undefined);
  const lastActivityAt = useRef<number>(Date.now());
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [signedIn, setSignedIn] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<'partner1' | 'partner2'>('partner1');
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadMembership = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    setSignedIn(Boolean(user));
    if (!user) {
      setEnrolled(false);
      return;
    }
    const { data } = await supabase.from('profiles').select('couple_id').eq('id', user.id).maybeSingle();
    setEnrolled(Boolean(data?.couple_id));
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    loadMembership().finally(() => setLoading(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadMembership().finally(() => setLoading(false));
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!signedIn || !enrolled) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    const inactivityLimit = 60 * 60 * 1000;
    const savedActivity = Number(localStorage.getItem('forever_last_activity_at'));
    lastActivityAt.current = Number.isFinite(savedActivity) && savedActivity > 0 ? savedActivity : Date.now();
    let isSigningOut = false;
    const signOutForInactivity = async () => {
      if (isSigningOut) return;
      isSigningOut = true;
      await supabase.auth.signOut();
      localStorage.removeItem('forever_last_activity_at');
      setMessage('You were signed out after one hour of inactivity.');
    };
    const checkInactivity = () => {
      const remaining = inactivityLimit - (Date.now() - lastActivityAt.current);
      if (remaining <= 0) {
        void signOutForInactivity();
        return;
      }
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
      inactivityTimer.current = window.setTimeout(checkInactivity, remaining);
    };
    const recordActivity = () => {
      lastActivityAt.current = Date.now();
      localStorage.setItem('forever_last_activity_at', String(lastActivityAt.current));
      checkInactivity();
    };
    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible') checkInactivity();
    };
    const activityEvents: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    window.addEventListener('focus', checkInactivity);
    document.addEventListener('visibilitychange', checkWhenVisible);
    checkInactivity();
    const interval = window.setInterval(checkInactivity, 60_000);
    return () => {
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
      window.clearInterval(interval);
      activityEvents.forEach((event) => window.removeEventListener(event, recordActivity));
      window.removeEventListener('focus', checkInactivity);
      document.removeEventListener('visibilitychange', checkWhenVisible);
    };
  }, [signedIn, enrolled]);

  const sendMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !email.trim()) return;
    setSubmitting(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSubmitting(false);
    setMessage(error ? error.message : 'Check your inbox for the secure sign-in link.');
  };

  const signInWithGoogle = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    setSubmitting(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setSubmitting(false);
      setMessage(error.message);
    }
  };

  const enroll = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !code.trim()) return;
    const expectedName = role === 'partner1' ? 'Gautam' : 'Shilpi';
    if (name.trim().toLocaleLowerCase() !== expectedName.toLocaleLowerCase()) {
      setMessage(`${role === 'partner1' ? 'Partner 1' : 'Partner 2'} must enter the name ${expectedName}.`);
      return;
    }
    setSubmitting(true);
    setMessage('');
    const { data: coupleId, error } = await supabase.rpc(mode === 'create' ? 'create_couple_space' : 'join_couple_space', {
      requested_code: code.trim(),
      requested_role: role,
      display_name: name.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (mode === 'create' && coupleId) {
      await supabase.from('couples').update({ partner1_name: 'Gautam', partner2_name: 'Shilpi' }).eq('id', coupleId);
    }
    await loadMembership();
  };

  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV !== 'production') return <>{children}</>;
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-red-500/30 bg-zinc-900/90 p-6 text-center shadow-2xl">
          <ShieldCheck className="mx-auto h-8 w-8 text-red-300" />
          <h1 className="mt-3 text-xl font-black text-white">Secure setup required</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">This deployment is locked until its Supabase environment variables are configured in Vercel.</p>
        </section>
      </main>
    );
  }

  if (signedIn && enrolled) return <>{children}</>;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-rose-500/30 bg-zinc-900/90 p-6 shadow-2xl shadow-rose-950/30">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600"><Heart className="h-6 w-6 fill-white text-white" /></div>
          <h1 className="mt-3 text-2xl font-black text-white">Forever Us</h1>
          <p className="mt-1 text-sm text-zinc-400">A private space for the two of you.</p>
        </div>

        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-pink-400" /></div> : !signedIn ? (
          <div className="space-y-4">
            <button type="button" onClick={signInWithGoogle} disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-white px-4 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-60"><span className="text-base font-black text-red-500">G</span>Continue with Google</button>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600"><span className="h-px flex-1 bg-zinc-800" />or email<span className="h-px flex-1 bg-zinc-800" /></div>
            <form onSubmit={sendMagicLink} className="space-y-4">
              <label className="block text-xs font-bold text-zinc-300">Email address
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-pink-400" placeholder="you@example.com" />
              </label>
              <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><Mail className="h-4 w-4" />{submitting ? 'Sending…' : 'Email me a secure sign-in link'}</button>
            </form>
          </div>
        ) : (
          <form onSubmit={enroll} className="space-y-4">
            <div className="grid grid-cols-2 rounded-xl border border-zinc-700 bg-zinc-950 p-1 text-xs font-bold"><button type="button" onClick={() => setMode('join')} className={`rounded-lg py-2 ${mode === 'join' ? 'bg-rose-600 text-white' : 'text-zinc-400'}`}>Join partner</button><button type="button" onClick={() => setMode('create')} className={`rounded-lg py-2 ${mode === 'create' ? 'bg-rose-600 text-white' : 'text-zinc-400'}`}>Create space</button></div>
            <label className="block text-xs font-bold text-zinc-300">Your name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-pink-400" placeholder={role === 'partner1' ? 'Gautam' : 'Shilpi'} /></label>
            <label className="block text-xs font-bold text-zinc-300">{mode === 'create' ? 'Choose a private couple code' : 'Partner’s couple code'}<input required minLength={6} value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 font-mono text-sm uppercase text-white outline-none focus:border-pink-400" placeholder="AT-LEAST-6-CHARS" /></label>
            <label className="block text-xs font-bold text-zinc-300">I am<select value={role} onChange={(event) => setRole(event.target.value as 'partner1' | 'partner2')} className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-pink-400"><option value="partner1">Gautam — Partner 1</option><option value="partner2">Shilpi — Partner 2</option></select></label>
            <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{mode === 'create' ? <Users className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}{submitting ? 'Saving…' : mode === 'create' ? 'Create our private space' : 'Join our private space'}</button>
          </form>
        )}
        {message && <p className="mt-4 rounded-xl border border-pink-500/25 bg-pink-950/30 p-3 text-center text-xs text-pink-200">{message}</p>}
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />Only authenticated couple members can access shared data.</p>
      </section>
    </main>
  );
}
