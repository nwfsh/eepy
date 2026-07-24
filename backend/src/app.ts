// load env first, must do this first
import "dotenv/config";

// to set up express 
import express from "express";
import cors from "cors";
import { requireAuth } from "./middleware/auth";
import userRouter from "./routes/user";
import scheduleRouter from "./routes/schedule"
import relationshipRouter from "./routes/relationship"
import messageRouter from "./routes/message"
import checkinRouter from "./routes/checkin"

const app = express();

// let your frontend talk to your backend 
// cors means cross-origin resource sharing 
// by default browsers and apps block requests between different origins, but this allows it 

app.use(cors());

// let express read JSON from request bodies
app.use(express.json());

// a public route, we dont want auth here 
app.get("/health", (req, res) => {
    res.json({ status: "ok"})
})

// this is a protected route so we need auth, requireAuth will run first, then the handler 
app.get("/protected", requireAuth, (req, res) => {
    res.json({ message : "you are logged in", user: (req as any).user});
});

// where you put all your routes for all other stuff 
app.use("/user", userRouter);
app.use("/schedule", scheduleRouter);
app.use("/relationship",relationshipRouter);
app.use("/message",messageRouter);
app.use("/checkin",checkinRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT  }`);
});

export default app;
