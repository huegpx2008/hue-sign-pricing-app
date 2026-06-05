const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/pricing/screenprint": ["./data/private/apparel/SanMar_SDL_hue.csv"],
      "/api/pricing/embroidery": ["./data/private/apparel/SanMar_SDL_hue.csv"],
    },
  },
};

export default nextConfig;
