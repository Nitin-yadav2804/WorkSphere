// REST and Socket.IO must accept the same explicitly configured frontend origins.
export function getAllowedOrigins(env = process.env) {
    return [...new Set([
        'http://localhost:5173',
        env.FRONTEND_URL,
        ...(env.FRONTEND_URLS || '').split(','),
    ].map(value => value?.trim().replace(/\/+$/, '')).filter(Boolean))];
}
