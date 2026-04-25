import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";



const app = express();

// let your frontend talk to your backend 
// cors means cross-origin resource sharing 
// by default browsers and apps block requests between different origins, but this allows it 
app.use(cors());

// let express read JSON from request bodies
app.use(express.json());

//  attach all your auth routes under /auth
// so /auth/register, /auth/signin, /auth/refresh, /auth/signout
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;