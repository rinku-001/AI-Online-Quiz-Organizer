import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import quizzesRoutes from './routes/quizzes.js';
import questionsRoutes from './routes/questions.js';
import attemptsRoutes from './routes/attempts.js';
import profilesRoutes from './routes/profiles.js';
import aiRoutes from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const localOrigins = [
    /^https?:\/\/localhost:\d+$/,
    /^https?:\/\/127\.0\.0\.1:\d+$/,
    /^https?:\/\/192\.168\.56\.1:\d+$/,
];

const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGINS,
]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [...new Set(configuredOrigins)];

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser clients and same-origin requests with no Origin header.
        if (!origin) {
            return callback(null, true);
        }

        const isLocalAllowed = localOrigins.some((pattern) => pattern.test(origin));
        const isConfiguredAllowed = allowedOrigins.includes(origin);

        if (isLocalAllowed || isConfiguredAllowed) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Connect to MongoDB (optional for now)
connectDB();
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/attempts', attemptsRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/ai', aiRoutes);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use(errorHandler);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api`);
    console.log(`📦 Database connection initialized`);
});
//# sourceMappingURL=server.js.map