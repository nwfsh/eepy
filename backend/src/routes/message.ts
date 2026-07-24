import { Request, Response, Router} from "express";
import { requireAuth } from "../middleware/auth";
import sql from "../db";


const messageRouter = Router();

// POST /message — send a drop to your partner
messageRouter.post("/", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { phase, special_request_text } = req.body;

        if (!phase) {
            res.status(400).json({ error: "Phase is required" });
            return;
        }

        // get the relationship and figure out who the partner is
        const [relationship] = await sql`
            SELECT id,
                CASE
                    WHEN user1_id = ${userId} THEN user2_id
                    WHEN user2_id = ${userId} THEN user1_id
                END AS partner_id
            FROM relationship
            WHERE user1_id = ${userId} OR user2_id = ${userId}
        `;

        if (!relationship) {
            res.status(404).json({ error: "You are not in a relationship yet" });
            return;
        }

        if (!relationship.partner_id) {
            res.status(400).json({ error: "Your partner has not joined yet" });
            return;
        }

        const [message] = await sql`
            INSERT INTO message (relationship_id, from_id, to_id, phase, special_request_text)
            VALUES (
                ${relationship.id},
                ${userId},
                ${relationship.partner_id},
                ${phase},
                ${special_request_text ?? null}
            )
            RETURNING id, phase, sent_at, special_request_text, unlocked
        `;

        res.status(201).json({ message });

    } catch (error) {
        console.error("POST /message error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// GET /message/incoming — get your latest drop
messageRouter.get("/incoming", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { phase } = req.query as day_phase;

        if (!phase) {
            res.status(400).json({ error: "Phase is required" });
            return;
        }

        const [message] = await sql`
            SELECT 
                m.id,
                m.phase,
                m.sent_at,
                m.special_request_text,
                m.unlocked,
                m.spent_coins,
                mm.url AS media_url,
                mm.media_type
            FROM message m
            LEFT JOIN message_media mm ON mm.message_id = m.id
            WHERE m.to_id = ${userId}
            AND m.phase = ${phase}
            ORDER BY m.sent_at DESC
            LIMIT 1
        `;

        if (!message) {
            res.status(404).json({ error: "No incoming drops found" });
            return;
        }

        res.status(200).json({ message });

    } catch (error) {
        console.error("GET /message/incoming error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default messageRouter;


// req will decide and give you information whether its morning or night base on timezone, 
// from calculaing from user databse table 

// viewing my morning/night message (no need to update the unlocked or coins rn, thats checkin's job)




// GET -> the message 
// WHERE -> to_id = user_id, PHASE = morning/night, 
// return SLICE 1, desc order from sent_at

// sending partner morning/night  message + possibly sending a special request with it too ->
// POST -> put timestamp, set to_id base on relationship_id.user2 or user1, special request if exist, ulocked to 0, phase given by req by user backend
