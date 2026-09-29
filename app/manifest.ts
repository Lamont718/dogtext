import type { MetadataRoute } from 'next';

// Lets DogText be added to a phone's Home Screen. On iPhone that is required
// for notifications (iOS 16.4+); on Android it's optional.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DogText',
    short_name: 'DogText',
    description: 'Letters from your dog to your kids.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#FFF8F0',
    theme_color: '#FF8C42',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
