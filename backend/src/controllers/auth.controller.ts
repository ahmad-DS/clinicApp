import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";

export const login = async (
    req: Request,
    res: Response
) => {
    const { email, password } = req.body;

    const { data, error } =
        await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

    if (error) {
        return res.status(401).json({
            message: error.message,
        });
    }
    // res.json(data);
    console.log("before cookie");

    //production set up
    res.cookie(
        "access_token",
        data.session.access_token,
        {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE as "lax" | "strict" | "none",
            maxAge: 60 * 60 * 1000,
        });

    res.cookie(
        "refresh_token",
        data.session.refresh_token,
        {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE as "lax" | "strict" | "none",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

    console.log("after cookie");

    res.json({ success: true });
};

export const checkAuth = async (req: Request, res: Response) => {
    // If your 'authenticate' middleware succeeds, it means the cookie was valid
    // and you likely attached the user to req.user
    res.json({ authenticated: true, user: req.user });
};