import fetch from 'node-fetch';

interface UploadPayload {
  path: string;
  content: string; // base64 string
  contentType: string;
}

export async function uploadViaSupabase(payload: UploadPayload) {
  try {
    const response = await fetch(
      'https://hyqiyumrfcmugdcymcht.supabase.co/functions/v1/dynamic-endpoint',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, // uit .env
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Upload mislukt:', result);
      throw new Error(result?.error || 'Upload failed');
    }

    console.log('✅ Upload geslaagd:', result.message);
    return result;
  } catch (err) {
    console.error('❌ Fout tijdens uploadViaSupabase:', err);
    throw err;
  }
}
