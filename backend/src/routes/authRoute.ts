import { Hono } from 'hono';
import { postGithubAuth, postGoogleAuth } from '../controllers/authController.js';

type Bindings = {
    PASTE_KV: KVNamespace,
    GITHUB_CLIENT_ID: string,
    GITHUB_CLIENT_SECRET: string,
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>();

app.post('/github', postGithubAuth);
app.post('/google', postGoogleAuth);

export const authRouter = app;