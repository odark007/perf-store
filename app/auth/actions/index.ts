'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient as createAdminClient } from '@supabase/supabase-js'; // Renamed to avoid conflict

// Helper to create client (Standard SSR Client for Cookies)
const createSSRClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createSSRClient();

  // 1. Sign In
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // 2. Check User Role for Redirect
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'super_admin' || profile?.role === 'store_manager') {
      redirect('/admin/dashboard');
    } else {
      // It's a customer
      redirect('/shop');
    }
  } else {
    // Fallback
    redirect('/shop');
  }
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createSSRClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Password reset link sent to your email.' };
}

export async function signOutAction() {
  const supabase = await createSSRClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

// NEW ACTION: Create User (Admin Only)
export async function createUserAction(formData: FormData) {
  // 1. Check if current user is Super Admin
  const supabase = await createSSRClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentUserProfile?.role !== 'super_admin') {
    return { error: 'Permission Denied: Super Admin only' };
  }

  // 2. Initialize Admin Client (Service Role) to create user
  // Using the renamed import 'createAdminClient' here
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  // 3. Create the user
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Auto-confirm email so they can login immediately
  });

  if (createError) return { error: createError.message };
  if (!newUser.user) return { error: 'Failed to create user' };

  // 4. Update the profile role
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', newUser.user.id);

  if (profileError) return { error: 'User created but failed to set role' };

  return { success: 'User created successfully!' };
}