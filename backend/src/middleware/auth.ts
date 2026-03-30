import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt"

// protect routes 
// grab → check → verify → next
// bearer" literally means "the person carrying this token" — as in "grant access to whoever is bearing this token.
// when checking for bearer it means only accept token based AUTHENTICATION 
// this happens every single request 

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({error:"Missing token"})
    }

    try {
        const payload = verifyAccessToken(header.split(" ")[1]); // verify the token
        res.locals.userId = payload.sub; // extract the userID
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" }); 
    }
}

