import { Request, Response } from "express";
import { register, signIn } from "../services/auth.service";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import sql from "../db";

export const registerHandler = async (req: Request, res: Response) => {
    try {
        const { email, password, first_name, last_name, preferred_name, pronouns, timezone } = req.body;
        const user = await register(email, password, first_name, last_name, preferred_name, pronouns, timezone); // will return user without password rmb
        res.status(201).json({user});
    } catch (e: any) {
        res.status(400).json({error: e.message})
    }
};

export const signInHandler = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        const user = await signIn(email,password);

        // now use authentication

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        await sql` INSERT INTO refresh_tokens (user_id, token) VALUES (${user.id}, ${refreshToken})`;
        res.status(201).json({user, accessToken, refreshToken});
    }catch(e:any) {
        res.status(400).json({error: e.message})
    }
}


export const refreshHandler = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Missing refresh token" });

    try {
        const payload = verifyRefreshToken(refreshToken);
        const [stored] = await sql`
      SELECT * FROM refresh_tokens WHERE token = ${refreshToken} AND user_id = ${payload.sub}`;

        if (!stored) return res.status(401).json({ error: "Token revoked or invalid" });

        // rolling refresh — replace old token with new one
        const newAccessToken = signAccessToken(payload.sub);
        const newRefreshToken = signRefreshToken(payload.sub);

        await sql`DELETE FROM refresh_tokens WHERE token = ${refreshToken}`;
        await sql`INSERT INTO refresh_tokens (user_id, token) VALUES (${payload.sub}, ${newRefreshToken})`;

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch {
        res.status(401).json({ error: "Invalid or expired refresh token" });
    }
};

export const signOutHandler = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        await sql`DELETE FROM refresh_tokens WHERE token = ${refreshToken}`;
    }
    res.json({message: "Signed out"});
};




