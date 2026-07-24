/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_ALLOWED_EMAIL?: string;
  readonly NEXT_PUBLIC_ALLOWED_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
