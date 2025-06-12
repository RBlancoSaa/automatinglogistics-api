import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadToStorage(
  buffer: Uint8Array,
  path: string,
  contentType: string
) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(path, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error('❌ Upload mislukt:', error.message);
    throw error;
  }

  return data;
}
