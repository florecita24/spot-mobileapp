import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system/legacy';

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
    // Determine MIME type from file extension
    const ext = (fileName || 'avatar.jpg').split('.').pop().toLowerCase();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = mimeTypes[ext] || 'image/jpeg';

    // Read file as base64 using expo-file-system (fetch().blob() returns empty in React Native)
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    // Convert base64 → Uint8Array so Supabase SDK can upload it properly
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate unique path
    const timestamp = Date.now();
    const safeFileName = fileName ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_') : 'avatar.jpg';
    const path = `${userId}/${timestamp}_${safeFileName}`;

    // Upload Uint8Array to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, bytes, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL with cache-buster so React Native Image always fetches fresh image
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const baseUrl = urlData?.publicUrl;
    const avatarUrl = baseUrl ? `${baseUrl}?t=${timestamp}` : null;

    // Save base URL (without cache-buster) to profiles table
    if (baseUrl) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: baseUrl })
        .eq('id', userId);

      if (updateError) throw updateError;
    }

    return { url: avatarUrl, error: null };
  } catch (error) {
    console.error('uploadAvatar error:', error);
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
