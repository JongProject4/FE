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
    // PWA / FCM Service Worker headers
    // SW 는 한 번 등록되면 브라우저가 끈질기게 캐시하므로, 새 버전 배포 시 강제 갱신을 위해 no-cache 를 명시한다.
    // (이전엔 존재하지 않는 /sw.js 를 가리키고 있어 무효 설정이었음)
    async headers() {
        return [
            {
                source: '/firebase-messaging-sw.js',
                headers: [
                    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
                    { key: 'Content-Type', value: 'application/javascript' },
                ],
            },
        ]
    },
    // Proxy /api/chat to Spring Boot backend
    async rewrites() {
        return [
            {
                source: '/api/chat',
                destination: 'http://localhost:8080/api/chat',
            },
            {
                source: '/api/chat/:path*',
                destination: 'http://localhost:8080/api/chat/:path*',
            },
        ]
    },
};

export default nextConfig;
