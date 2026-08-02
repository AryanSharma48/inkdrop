import { Context } from 'hono'
import type { Next } from 'hono' 
import { jwt, verify } from 'hono/jwt'

export async function requireAuth(c: Context, next: Next) {
    const jwtMiddleware = jwt({
        secret: c.env.JWT_SECRET,
        alg: 'HS256' ,
    })
    return jwtMiddleware(c, next);
}

export async function optionalAuth(c: Context, next: Next){
    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
            const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
            c.set('jwtPayload', payload)
        } catch (error) {
            // Ignore error and treat as anonymous guest
        }
    }
    await next();
}