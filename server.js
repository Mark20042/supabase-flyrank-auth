
    

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

// Stage 1: Auth routes (Sign Up & Log In)
app.post("/auth/signup", async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
        message: "User registered successfully",
        user: data.user,
    });
});

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !data.session) {
        return res.status(401).json({ error: "Invalid login credentials" });
    }

    return res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.user,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} and connected to Supabase`);
});