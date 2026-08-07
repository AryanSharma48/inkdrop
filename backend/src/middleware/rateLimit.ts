import { Context} from 'hono'
import type { Next } from 'hono'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis/cloudflare'
  
export function rateLimit(limit: number, window: string = '1 m'){
    return async (c: Context, next: Next) => {
        if(!c.env.UPSTASH_REDIS_REST_URL || !c.env.UPSTASH_REDIS_REST_TOKEN){
            return c.json({
                error: "Redis keys missing"
            }, 401)
        }

        const redis = new Redis({
            url: c.env.UPSTASH_REDIS_REST_URL,
            token: c.env.UPSTASH_REDIS_REST_TOKEN,
        });

        const rateLimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, window as any),
            analytics: true,
        })

        const ip = c.req.header('CF-Connecting-IP') || '127.0.0.1';
        const check = await rateLimit.limit(ip);

        c.header('x-ratelimit-limit', check.limit.toString());
        c.header('x-ratelimit-remaining', check.remaining.toString());
        c.header('x-ratelimit-reset', Math.ceil(check.reset / 1000).toString());

        if(!check.success){
            return c.json({
                error: "Rate limit exceeded",
            }, 429);
        } else {
            await next();
        }

        
        
    }
}