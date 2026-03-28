import { GoogleSignin } from './firebase';
import { supabase } from './supabase';

/**
 * Sincroniza usuario de Google a Supabase
 * Crea o actualiza perfil en la tabla profiles
 */
export async function syncGoogleUserToSupabase(googleUser: any) {
  const { user } = googleUser;
  const { id, email, name, photo } = user;

  try {
    // Verificar si ya existe en Supabase
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('google_id', id)
      .single();

    if (existing) {
      // Actualizar perfil existente
      await supabase
        .from('profiles')
        .update({
          email,
          full_name: name || email?.split('@')[0] || 'Usuario',
          avatar_url: photo,
          auth_provider: 'google',
          updated_at: new Date().toISOString(),
        })
        .eq('google_id', id);

      return existing;
    } else {
      // Crear nuevo perfil
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          google_id: id,
          email,
          full_name: name || email?.split('@')[0] || 'Usuario',
          avatar_url: photo,
          auth_provider: 'google',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error syncing Google user to Supabase:', error);
    throw error;
  }
}

/**
 * Login con Google
 */
export async function signInWithGoogle() {
  if (!GoogleSignin) {
    throw new Error('Google Sign-In no disponible en web. Use email y contraseña.');
  }

  try {
    // Verificar Google Play Services
    await GoogleSignin.hasPlayServices();

    // Obtener información del usuario de Google
    const userInfo = await GoogleSignin.signIn();

    // Sincronizar con Supabase
    const profile = await syncGoogleUserToSupabase(userInfo);

    return { userInfo, profile };
  } catch (error: any) {
    console.error('Error in Google Sign-In:', error);
    throw error;
  }
}

/**
 * Login con Email/Password (Supabase Auth)
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in email sign-in:', error);
    throw error;
  }
}

/**
 * Registro con Email/Password (Supabase Auth)
 */
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in email sign-up:', error);
    throw error;
  }
}

/**
 * Logout (Google + Supabase)
 */
export async function signOut() {
  try {
    // Logout de Google si está autenticado
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      await GoogleSignin.signOut();
    }

    // Logout de Supabase
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Recuperar contraseña
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'separapp://reset-password',
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}
