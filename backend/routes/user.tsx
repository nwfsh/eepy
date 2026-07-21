import { Router, Request, Response } from "express";
import { requireAuth } from "../src/middleware/auth";
import sql from "../src/db";

// routes i need for user

const router = Router();



// no need INSERT user as supabase does it for you when user sign up, but they dont fill in extra details, need PATCH
// route to PATCH a user -> need UUID, email, preferred_name, pronouns (possibly enum), timezone, created_at( might not need to include)

router.patch("/me", requireAuth, async ( req: Request, res:Response) => {
    try {

        const userId = (req as any).user.id;
        const { preferred_name, pronouns, timezone } = req.body;
        
        // making sure at least one field is sent

        if(!preferred_name && !pronouns && !timezone) {
            res.status(400).json({error: "no updates been made"})
            return;
        }

        // remember thawt coalesce means that use the first value, or use the already existing value 
        // already stored in the database <3 
        const[user] = await sql `
        UPDATE users
        SET preferred_name = COALESCE(${preferred_name}, preferred_name),
        pronouns = COALESCE(${pronouns}, pronouns),
        timezone = COALESCE(${timezone}, timezone)
        WHERE id = ${userId}
        RETURNING id, email, preferred_name, pronouns, timezone`;

        res.status(200).json({user})
        
    } catch (error) {
        res.status(500).json({error: "internal server error"})
    }
});



// route to GET their preferred_name, timezone, email (used twice)
router.get("/me", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        // this is to represents an array of 
        const [user] = await sql` 
        SELECT id, email, preferred_name, pronouns, timezone, created_at
        FROM users
        WHERE id = ${userId}`

        if (!user) {
            res.status(404).json({ error: "user not found"})
            return;
        }

        res.status(200).json({user})
    } catch ( error ) {
        res.status(500).json({error: "internal server error"})
        return;

    }
});




export default router;






// no update, we want multiple sleep schdules running, until like one expires something like that 

