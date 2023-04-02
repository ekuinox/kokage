import { createClient } from '@supabase/supabase-js';

const table = process.env.SUPABASE_USERS_TABLE;

const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export interface UserTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string[];
}

export interface UserUpsert {
  id: string;
  name: string;
  tokens: UserTokens;
}

export const upsertUser = async ({
  id,
  name,
  tokens,
}: UserUpsert): Promise<void> => {
  const resp = await client.from(table).upsert({
    id,
    name,
    tokens,
  });
  if (resp.error != null) {
    throw resp.error;
  }
};

export interface UserDataPublic {
  id: string;
  name: string;
}

export interface UserDataPrivate {
  id: string;
  name: string;
  tokens: UserTokens;
}

export const getUserById = async (id: string): Promise<UserDataPublic> => {
  const resp = await client
    .from(table)
    .select('id, name')
    .filter('id', 'eq', id);
  if (resp.error != null) {
    throw resp.error;
  }
  return resp.data[0];
};

export const getUserByIdPrivate = async (
  id: string
): Promise<UserDataPrivate> => {
  const resp = await client
    .from(table)
    .select('id, name, tokens')
    .filter('id', 'eq', id);
  if (resp.error != null) {
    throw resp.error;
  }

  const data = resp.data[0];

  const {
    accessToken,
    refreshToken,
    expiresAt,
    scopes,
  }: Omit<UserTokens, 'expiresAt'> & { expiresAt: string } = data.tokens;

  const { id: id_, name } = resp.data[0];
  return {
    id: id_,
    name,
    tokens: {
      accessToken,
      refreshToken,
      expiresAt: new Date(expiresAt),
      scopes,
    },
  };
};
