// @ts-check
/**
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: { remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
      port: '',
      pathname: '**'
      
    },
  ], formats: ['image/avif', 'image/webp'], },
};
export default config;
