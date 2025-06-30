const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const REDIRECT_IN = process.env.NEXT_PUBLIC_REDIRECT_IN;
const REDIRECT_OUT = process.env.NEXT_PUBLIC_REDIRECT_OUT;

const TOKEN_KEY = "intelli_tokens";

interface Tokens {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  obtained_at: number;
}

export function loginWithCognito() {
  const scope = encodeURIComponent("openid email phone");
  const url = `https://${DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(
    REDIRECT_IN
  )}`;
  window.location.href = url;
}

export function logout() {
  // clear local tokens
  localStorage.removeItem(TOKEN_KEY);
  const url = `https://${DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(
    REDIRECT_OUT
  )}`;
  window.location.href = url;
}

export function getIdToken(): string | null {
  if (typeof window === "undefined") return null; // ⛔ server-side check

  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;

  const t: Tokens = JSON.parse(raw);
  const exp = t.obtained_at + t.expires_in - 30;
  if (Date.now() / 1000 > exp) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  return t.id_token;
}

export async function handleAuthRedirect() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (!code) return;

  try {
    const tokens = await exchangeCodeForTokens(code);
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    window.history.replaceState({}, "", REDIRECT_IN);
  } catch (e) {
    console.error("OIDC token exchange failed", e);
  }
}

async function exchangeCodeForTokens(code: string): Promise<Tokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT_IN,
  });

  const res = await fetch(`https://${DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Token request failed: ${await res.text()}`);
  }
  const data = await res.json();
  return { ...data, obtained_at: Math.floor(Date.now() / 1000) } as Tokens;
}
