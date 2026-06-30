import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.access_token;
    console.log("Token from cookies:", req.cookies);
    if (!token) {
      return res.status(401).json({
        message: "Missing token"
      });
    }

    const { data, error } =
      await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const { data: appUser, error: userError } =
      await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

    if (userError || !appUser) {
      return res.status(403).json({
        message: "User not found",
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email || "",
      role: appUser.role,
    };

    next();
  } catch (err) {
    next(err);
  }
};