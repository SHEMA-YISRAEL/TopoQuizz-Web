/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_STORE_URL: string;
  readonly PUBLIC_PLAY_STORE_URL: string;
  readonly PUBLIC_WEB_URL: string;
  readonly PUBLIC_TIKTOK_URL: string;
  readonly PUBLIC_FACEBOOK_URL: string;
  readonly PUBLIC_INSTAGRAM_URL: string;
  readonly PUBLIC_YOUTUBE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
