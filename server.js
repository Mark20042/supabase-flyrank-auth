
    

import express from "express";
import dotenv from "dotenv";  
import { createClient } from "@supabase/supabase-js";


dotenv.config();   


const PORT =  process.env.PORT || 3001;

const app = express();

app.use(express.json());
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} and connected to Supabase`);
});