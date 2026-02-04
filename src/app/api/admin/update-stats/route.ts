import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymcjoloqemofuhiomdgk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Service key not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    const totalUsers = usersError ? 0 : usersData.users.length;

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const activeUsers = usersError ? 0 : usersData.users.filter(
      u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(thirtyMinutesAgo)
    ).length;

    const { data: viewsData } = await supabase
      .from('drama_stats')
      .select('view_count');
    const totalViews = viewsData?.reduce((sum, d) => sum + (d.view_count || 0), 0) || 0;

    const { count: dramaCount } = await supabase
      .from('drama_stats')
      .select('*', { count: 'exact', head: true });
    const totalDramas = dramaCount || 0;

    const { error: updateError } = await supabase
      .from('statistics')
      .update({
        total_views: totalViews,
        total_users: totalUsers,
        active_users: activeUsers,
        total_dramas: totalDramas,
        updated_at: new Date().toISOString(),
      })
      .eq('id', (await supabase.from('statistics').select('id').single()).data?.id);

    if (updateError) {
      const { error: insertError } = await supabase.from('statistics').upsert({
        total_views: totalViews,
        total_users: totalUsers,
        active_users: activeUsers,
        total_dramas: totalDramas,
      });
      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      stats: { total_views: totalViews, total_users: totalUsers, active_users: activeUsers, total_dramas: totalDramas }
    });
  } catch (error: any) {
    console.error('Error updating stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST(new Request(''));
}
