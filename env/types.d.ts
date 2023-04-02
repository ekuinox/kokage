declare namespace NodeJS {
  interface ProcessEnv extends Env {
    readonly SUPABASE_ANON_KEY: string;
    readonly SUPABASE_URL: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly SUPABASE_USERS_TABLE: string;
    readonly SPOTIFY_CLIENT_ID: string;
    readonly SPOTIFY_CLIENT_SECRET: string;
    readonly NEXT_PUBLIC_ORIGIN: string;
  }
}
