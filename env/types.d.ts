declare namespace NodeJS {
  interface ProcessEnv extends Env {
    readonly SUPABASE_ANON_KEY: string;
    readonly SUPABASE_URL: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly SPOTIFY_CLIENT_ID: string;
    readonly SPOTIFY_CLIENT_SECRET: string;
  }
}
