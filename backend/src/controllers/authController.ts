import { Context } from 'hono'
import { sign } from 'hono/jwt'
import { upsertUser } from '../services/userService.js'

interface GitHubTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}


export async function postGithubAuth(c: Context){

  try {
    const { code } = await c.req.json<{ code: string }>()
    
    if (!code) {
      return c.json({ error: 'Authorization code is required' }, 400)
    }
    const clientId = c.env.CLIENT_ID
    const clientSecret = c.env.CLIENT_SECRET

    const githubResponse = await fetch(`https://github.com/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret : clientSecret,
        code: code,
      })
    })

    if (!githubResponse.ok) {
      return c.json({ error: 'Failed to connect to GitHub' }, 500)
    }

    const data = (await githubResponse.json()) as GitHubTokenResponse;

    if (data.error) {
      return c.json({ error: data.error_description || data.error }, 400)
    }

    const userResponse = await fetch("https://api.github.com/user", {
        method : "GET",
        headers : {
            "Authorization": `Bearer ${data.access_token}`,
            "User-Agent" : "ink-drop-api",
            "Accept" : "application/json"
        }
    })

    if (!userResponse.ok) {
      return c.json({ error: 'Failed to connect to GitHub' }, 500)
    }

    const githubUser = await userResponse.json() as {
        id: number,
        login: string,
        avatar_url: string,
    }

    const user = await upsertUser(c.env, githubUser)

    const jwtPayload = {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 1 week
      username: user.userName,
    }
    const token = await sign(jwtPayload, c.env.JWT_SECRET)

    return c.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        userName: user.userName,
        avatarUrl: user.avatarUrl
      }
    })

  } catch (error) {
    console.error("Auth controller failed:", error);
    return c.json({ error: 'Internal server error' }, 500)
  }


}
