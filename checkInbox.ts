import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const run = async () => {
  const client = new ImapFlow({
    host: 'imap.mijndomein.nl',
    port: 993,
    secure: true,
    auth: {
      user: process.env.EMAIL_RECEIVER!,
      pass: process.env.SMTP_PASS!
    }
  });

  await client.connect();
  await client.mailboxOpen('INBOX');

  for await (const message of client.fetch('1:*', { envelope: true, source: true })) {
    const parsed = await simpleParser(message.source);
    for (const attachment of parsed.attachments || []) {
      if (attachment.contentType === 'application/pdf') {
        const filePath = `pdf/${attachment.filename}`;
        const buffer = attachment.content as Buffer;

        const { error } = await supabase.storage
          .from('uploads')
          .upload(filePath, buffer, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (error) {
          console.error(`❌ Upload mislukt: ${attachment.filename}`, error.message);
        } else {
          console.log(`✅ PDF geüpload naar Supabase: ${filePath}`);
        }
      }
    }
  }

  await client.logout();
};

run().catch((err) => {
  console.error('❌ Fout in checkInbox.ts:', err);
});
