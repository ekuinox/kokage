import { createClient } from '@supabase/supabase-js';

const table = 'users';

const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export interface UserUpsert {
  id: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}

export const upsertUser = async ({
  id,
  name,
  accessToken,
  refreshToken,
}: UserUpsert): Promise<void> => {
  const resp = await client.from(table).upsert({
    id,
    name,
    access_token: accessToken,
    refresh_token: refreshToken,
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
  accessToken: string;
  refreshToken: string;
}

export const getUserById = async (id: string): Promise<UserDataPublic> => {
  const resp = await client.from(table).select('id, name').filter('id', 'eq', id);
  if (resp.error != null) {
    throw resp.error;
  }
  return resp.data[0];
};

export const getUserByIdPrivate = async (id: string): Promise<UserDataPrivate> => {
  const resp = await client.from(table).select('id, name, access_token, refresh_token').filter('id', 'eq', id);
  if (resp.error != null) {
    throw resp.error;
  }
  const { id: id_, name, access_token: accessToken, refresh_token: refreshToken } = resp.data[0];
  return {
    id: id_, name, accessToken, refreshToken,
  };
};