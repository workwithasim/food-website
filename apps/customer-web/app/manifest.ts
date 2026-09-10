import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cheezious | World of Flavors & Cheezy Treats',
    short_name: 'Cheezious',
    description: 'Order fresh pizzas, crunchy bazinga burgers, and cheesy treats delivered hot to your doorstep.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F9FA',
    theme_color: '#F15B25',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: 'https://cheezious.com/cheezious.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: 'https://cheezious.com/cheezious.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
