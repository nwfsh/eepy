// middleware checks if the token is valid, and if the person is actually logged in
// policies assumed you are correctly logged in, but makes sure that you only see your data 

// its two different layers of protection

import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";

export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction

) => {
    // grab the token from the request header
    const authHeader = req.headers.authorization;

    if( !authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header"});
        return;
    }


    // pull the actual token out， remove the "Bearer " starting 
    const token = authHeader.split("")[1];

    const { data, error} = await supabase.auth.getUser(token)

    if (error || !data.user) {
        res.status(401).json({ error: "Invalid or expired token"})
    }

    // attaches the user's logged in information to the request 
    (req as any).user = data.user;

    next();

};




