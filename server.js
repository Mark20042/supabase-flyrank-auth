
    

import express from "express";
import dotenv from "dotenv";  
import { createClient } from "@supabase/supabase-js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

dotenv.config();   

const swaggerDocument = JSON.parse(
    fs.readFileSync(new URL("./openapi.json", import.meta.url), "utf-8")
);   


const PORT =  process.env.PORT || 3001;

const app = express();

app.use(express.json());

// Stage 5: Swagger UI documentation at /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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

// Stage 2: Public route & unverified protected route
app.get("/public/info", (req, res) => {
    return res.status(200).json({ message: "Welcome stranger! This info is public." });
});

// Stage 4: Reusable Authentication Middleware
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access token required" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    const { data: { user } = {}, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
};

// Stage 4: Protected profile using middleware
app.get("/protected/profile", authMiddleware, (req, res) => {
    return res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        created_at: req.user.created_at,
    });
});

// Stage 4: Protected logout route
app.post("/auth/logout", authMiddleware, async (req, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(204).send();
});

// Stage 4 Checkpoint: Second protected route proving middleware reusability
app.get("/protected/dashboard", authMiddleware, (req, res) => {
    return res.status(200).json({
        message: "Welcome to your protected dashboard!",
        user: {
            id: req.user.id,
            email: req.user.email,
        },
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} and connected to Supabase`);
});