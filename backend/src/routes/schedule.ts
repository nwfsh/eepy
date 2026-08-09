import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import sql from "../db"

const scheduleRouter = Router();


// route to INSERT a sleep schedule -> need all details 

// need to POST a new sleep scedule 
// why not PUT? cus u wanted to keep the time stamp, aka the history of it 
scheduleRouter.post("/", requireAuth, async (req: Request, res: Response) => {
    try {
        console.log("BACKEND RECEIVED BODY:", req.body);
        const userId = (req as any).user.id;
        const { wake_time, sleep_time, thewindow} = req.body;
        console.log("PARSED:", { wake_time, sleep_time, thewindow });
        console.log("CHECK RESULT:", !wake_time || !sleep_time || !thewindow);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const effective_date = tomorrow.toISOString().split('T')[0]; // gives "2026-07-22"

        if (!wake_time || !sleep_time || !thewindow) {
            res.status(400).json({ error: "missing fields" });
            return;
        }

        // need to return actual column name
        const [schedule] = await sql`
            INSERT INTO sleep_schedule (user_id, effective_date, wake_time, sleep_time, thewindow)
            VALUES (${userId}, ${effective_date}, ${wake_time}, ${sleep_time}, ${thewindow})
            RETURNING user_id, effective_date, wake_time, sleep_time, thewindow
        `;

        res.status(201).json({schedule});
    } catch (error) {
        console.error("INSERT ERROR:", error);
        console.error("ERROR MESSAGE:", (error as any).message);
        res.status(500).json({error: "internal server error"})
    }
});


// get the CURRENT schedule 
// will be mounted to route /schedule using app.use("/schedule", scheduleRouter); later 

scheduleRouter.get("/current", requireAuth, async( req: Request , res: Response) => {
    try {
        const userId = (req as any).user.id;

        const[schedule] = await sql`
            SELECT user_id, effective_date, wake_time, sleep_time, thewindow
            FROM sleep_schedule
            WHERE user_id = ${userId} AND effective_date <= CURRENT_DATE
            ORDER BY effective_date DESC
            LIMIT 1
        `;
        if(!schedule) {
            res.status(404).json({error: "no schedule found"})
            return;
        }
        return schedule;
    } catch(error) {
        res.status(500).json({error: "internal server error"})
    }
})

export default scheduleRouter; 


// no need delete route for now for mvp 

