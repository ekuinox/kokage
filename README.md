# kokage

最近Spotifyで聴いた曲を共有するためのもの。ログインしていれば、人の共有したリストからプレイリストを作ったりできる。

## セットアップ

以下の環境変数が必要。`.env.local`とかに保存しておく。

```
SPOTIFY_CLIENT_SECRET=
SPOTIFY_CLIENT_ID=
SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

- `SPOTIFY_CLIENT_*` ... [Dashboard](https://developer.spotify.com/dashboard)に行けば発行できる
  + [next-auth](https://next-auth.js.org)がリダイレクトを捌けるように、`/api/auth/callback/spotify`を許可するようにしておくこと
- `SUPABASE_*` ... [supabase](https://supabase.com)で適当にプロジェクト作る必要がある
  + id, name, tokens, created_at, updated_atのカラムがある。
- `NEXT_AUTH_SECRET` ... `openssl rand -base64 32` でもしたものを指定する

pnpmを使っているので、`pnpm install`でパッケージをインストールする。

- `pnpm dev` ... ローカル開発サーバー起動
- `pnpm build` ... 本番ビルド
