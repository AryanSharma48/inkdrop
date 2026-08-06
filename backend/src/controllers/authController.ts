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

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

export async function postGithubAuth(c: Context){
  try {
    const { code } = await c.req.json<{ code: string }>()
    
    if (!code) {
      return c.json({ error: 'Authorization code is required' }, 400)
    }
    const clientId = c.env.GITHUB_CLIENT_ID
    const clientSecret = c.env.GITHUB_CLIENT_SECRET

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

    const user = await upsertUser(c.env, 'github', githubUser.id.toString(), githubUser.login, githubUser.avatar_url)

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
    console.error("GitHub Auth controller failed:", error);
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export async function postGoogleAuth(c: Context) {
  try {
    const { code, redirectUri } = await c.req.json<{ code: string; redirectUri: string }>()
    
    if (!code) {
      return c.json({ error: 'Authorization code is required' }, 400)
    }
    if (!redirectUri) {
      return c.json({ error: 'Redirect URI is required' }, 400)
    }

    const googleResponse = await fetch(`https://oauth2.googleapis.com/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    })

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error("Google token exchange error:", errorText);
      return c.json({ error: 'Failed to connect to Google OAuth' }, 500)
    }

    const data = (await googleResponse.json()) as GoogleTokenResponse;

    if (data.error) {
      return c.json({ error: data.error_description || data.error }, 400)
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${data.access_token}`,
            "Accept": "application/json"
        }
    })

    if (!userResponse.ok) {
      return c.json({ error: 'Failed to fetch user profile from Google' }, 500)
    }

    const googleUser = await userResponse.json() as {
        sub: string,
        name: string,
        picture: string,
    }

    const user = await upsertUser(c.env, 'google', googleUser.sub, googleUser.name, googleUser.picture)

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
    console.error("Google Auth controller failed:", error);
    return c.json({ error: 'Internal server error' }, 500)
  }
}
