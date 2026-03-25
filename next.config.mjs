/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            { protocol: 'https', hostname: 'k.kakaocdn.net' },
        ],
    },
    experimental: {
        serverActions: { allowedOrigins: ['localhost:3000'] },
    },
    // PWA headers
    async headers() {
        return [
            {
                source: '/sw.js',
                headers: [
                    { key: 'Cache-Control', value: 'no-cache' },
                    { key: 'Content-Type', value: 'application/javascript' },
                ],
            },
        ]
    },
};

export default nextConfig;
