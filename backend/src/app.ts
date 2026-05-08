// to set up express 
import express from "express";
import cors from "cors";



const app = express();

// let your frontend talk to your backend 
// cors means cross-origin resource sharing 
// by default browsers and apps block requests between different origins, but this allows it 
app.use(cors());

// let express read JSON from request bodies
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;