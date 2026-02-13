import { supabase } from './client';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

// Sign up with phone number
export async function signUpWithPhone(phone: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    phone: phone,
    password: password,
  });

  if (error) {
    console.error('Sign up error:', error.message);
    throw error;
  }

  return data;
}

// Sign in with phone number
export async function signInWithPhone(phone: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone: phone,
    password: password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    throw error;
  }

  return data;
}

// Sign up with email
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Sign up error:', error.message);
    throw error;
  }

  return data;
}

// Sign in with email
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    throw error;
  }

  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error.message);
    throw error;
  }
}

// Get current session
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  // Don't log error if it's just "no session" - this is normal when not logged in
  if (error && error.message !== 'Auth session missing!') {
    console.error('Get session error:', error.message);
  }

  return session;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  // Don't log error if it's just "no session" - this is normal when not logged in
  if (error && error.message !== 'Auth session missing!') {
    console.error('Get user error:', error.message);
  }

  return user;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null);
    }
  );

  return subscription;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}