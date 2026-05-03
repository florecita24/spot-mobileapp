import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vyskbzukdnksnqkvfwrc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_1XSbRhhIbNp0vSu9P3IoAg_EOsUtY7s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth Functions
export const signUp = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    const user = data.user;

    // Create profile after signup
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email,
          full_name: fullName,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error) {
    return { session: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    return { session: null, error };
  }
};

export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error) {
    return { profile: null, error };
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error) {
    return { profile: null, error };
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const email = userData.user?.email;
    if (!email) {
      throw new Error('Email pengguna tidak ditemukan.');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (signInError) {
      throw new Error('Password lama tidak sesuai.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};


// Avatar Functions
export const uploadAvatar = async (userId, fileUri, fileName) => {
  try {
    // Read file as blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const path = `${userId}/${timestamp}_${fileName}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const avatarUrl = urlData?.publicUrl;

    // Update profile with new avatar URL
    if (avatarUrl) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (updateError) throw updateError;
    }

    return { url: avatarUrl, error: null };
  } catch (error) {
    return { url: null, error };
  }
};

// Delete old avatar when uploading new one
export const deleteAvatar = async (userId, filePath) => {
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };
