import {SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY} from './supabase-config.js';

const SESSION_KEY = 'margin-cloud-session-v1';
const base = SUPABASE_URL.replace(/\/$/, '');
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base) && SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_');
let session = null;

function saveSession(value) {
  session = value;
  try {
    if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* Account sync still works for this open tab. */ }
}

async function request(path, {method='GET', body, token, headers={}}={}) {
  if (!configured) throw new Error('Cloud sync is not configured yet.');
  const response = await fetch(base + path, {
    method,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...(body ? {'Content-Type':'application/json'} : {}),
      ...headers,
    },
    ...(body ? {body:JSON.stringify(body)} : {}),
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || data?.error || `Cloud request failed (${response.status}).`);
  return data;
}

function setAuth(data) {
  if (!data?.access_token || !data?.refresh_token || !data?.user?.id) return false;
  saveSession({access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:Date.now() + (Number(data.expires_in) || 3600)*1000});
  return true;
}

export const cloud = {
  configured,
  get user() { return session?.user || null; },
  async restore() {
    if (!configured) return false;
    try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { session = null; }
    if (!session?.refresh_token) return false;
    try { await this.token(); return true; } catch { saveSession(null); return false; }
  },
  consumeRedirect() {
    if (!configured || !location.hash.startsWith('#access_token=')) return false;
    const params = new URLSearchParams(location.hash.slice(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = Number(params.get('expires_in') || 3600);
    if (access_token && refresh_token) {
      // The confirmation redirect does not include the user object. Get it before sync.
      saveSession({access_token,refresh_token,user:null,expires_at:Date.now()+expires_in*1000});
      history.replaceState(null,'',location.pathname + location.search + '#overview');
      return true;
    }
    return false;
  },
  async token() {
    if (!session?.access_token) throw new Error('Sign in to sync progress.');
    if (Date.now() >= session.expires_at - 60000) {
      const data = await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});
      setAuth(data);
    }
    if (!session.user) {
      const user = await request('/auth/v1/user',{token:session.access_token});
      saveSession({...session,user});
    }
    return session.access_token;
  },
  async signUp(email,password) {
    const redirect = encodeURIComponent(location.origin + location.pathname);
    const data = await request(`/auth/v1/signup?redirect_to=${redirect}`,{method:'POST',body:{email,password}});
    return setAuth(data);
  },
  async signIn(email,password) {
    const data = await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
    if (!setAuth(data)) throw new Error('Sign-in did not return a session.');
  },
  async signOut() {
    try { if (session) await request('/auth/v1/logout',{method:'POST',token:await this.token()}); } catch { /* Clear the local session regardless. */ }
    saveSession(null);
  },
  async loadProgress() {
    const token = await this.token();
    const rows = await request(`/rest/v1/margin_progress?user_id=eq.${encodeURIComponent(session.user.id)}&select=payload,updated_at`,{token});
    return rows?.[0] || null;
  },
  async saveProgress(payload) {
    const token = await this.token();
    await request('/rest/v1/margin_progress?on_conflict=user_id',{
      method:'POST',token,
      headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
      body:{user_id:session.user.id,payload,updated_at:new Date().toISOString()},
    });
  },
};
