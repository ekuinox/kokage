declare namespace NodeJS {
  interface ProcessEnv extends Env {
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
  }
}
