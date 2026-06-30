import { supabaseAdmin } from "./config/supabase";

async function createAdmin() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@clinic.com",
    password: "Admin@123",
    email_confirm: true,
  });

  if (error) {
    console.log(error);
    return;
  }

  await supabaseAdmin
    .from("users")
    .insert({
      id: data.user.id,
      full_name: "System Admin",
      role: "admin",
    });

  console.log("Admin created");
}

createAdmin();