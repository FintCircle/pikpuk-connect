import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", context.userId);
    if (rolesError) throw new Error(rolesError.message);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", context.userId);
    if (profileError) throw new Error(profileError.message);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (deleteError) throw new Error(deleteError.message);

    return { ok: true };
  });
