import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.101.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getCallerUid(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data } = await supabaseAdmin.auth.getUser(token);
  return data.user?.id ?? null;
}

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.role === 'admin';
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const callerId = await getCallerUid(req);
    if (!callerId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callerIsAdmin = await isAdmin(callerId);
    if (!callerIsAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // ── LIST USERS ──
    if (req.method === 'GET' && action === 'list') {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 100,
      });
      if (error) throw error;

      // Attach roles
      const { data: roles } = await supabaseAdmin.from('user_roles').select('user_id, role');
      const roleMap: Record<string, string> = {};
      for (const r of roles ?? []) {
        roleMap[r.user_id] = r.role;
      }

      const enriched = users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        role: roleMap[u.id] ?? 'editor',
      }));

      return new Response(JSON.stringify({ users: enriched }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── INVITE USER ──
    if (req.method === 'POST' && action === 'invite') {
      const { email, role } = await req.json();
      if (!email) throw new Error('email required');

      const siteUrl = Deno.env.get('SITE_URL') || 'https://sdy.vercel.app';
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/mn/admin`,
      });
      if (error) throw error;

      // Assign role
      if (data.user) {
        await supabaseAdmin.from('user_roles').upsert({
          user_id: data.user.id,
          role: role === 'admin' ? 'admin' : 'editor',
        }, { onConflict: 'user_id' });
      }

      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── UPDATE ROLE ──
    if (req.method === 'POST' && action === 'update-role') {
      const { userId, role } = await req.json();
      if (!userId || !role) throw new Error('userId and role required');

      // Prevent self-demotion
      if (userId === callerId && role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Cannot remove your own admin role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseAdmin.from('user_roles').upsert({
        user_id: userId,
        role: role === 'admin' ? 'admin' : 'editor',
      }, { onConflict: 'user_id' });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── DELETE USER ──
    if (req.method === 'POST' && action === 'delete') {
      const { userId } = await req.json();
      if (!userId) throw new Error('userId required');

      // Prevent self-delete
      if (userId === callerId) {
        return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Remove role first
      await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
      // Delete auth user
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
