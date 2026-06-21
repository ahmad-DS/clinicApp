import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const login = async (
    req: Request,
    res: Response
) => {
    const { email, password } = req.body;

    const { data, error } =
        await supabase.auth.signInWithPassword({
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
    // local set up
    // res.cookie(
    //     "access_token",
    //     data.session.access_token,
    //     {
    //         httpOnly: true,
    //         secure: false,
    //         sameSite: "lax",
    //         maxAge: 60 * 60 * 1000
    //     }
    // );

    // res.cookie(
    //     "refresh_token",
    //     data.session.refresh_token,
    //     {
    //         httpOnly: true,
    //         secure: false,
    //         sameSite: "lax",
    //         maxAge: 30 * 24 * 60 * 60 * 1000
    //     }
    // );

    //production set up
    res.cookie(
        "access_token",
        data.session.access_token,
        {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 60 * 60 * 1000,
        });

    res.cookie(
        "refresh_token",
        data.session.refresh_token,
        {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

    console.log("after cookie");

    res.json({ success: true });
};