import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import path from 'path';
const run = async () => {
    const client = new ImapFlow({
        host: 'imap.mijndomein.nl',
        port: 993,
        secure: true,
        auth: {
            user: 'emails@tiarotransport.nl',
            pass: 'Ti@roTr@nsport2019'
        }
    });
    await client.connect();
    await client.mailboxOpen('INBOX');
    for await (let message of client.fetch('1:*', { envelope: true, source: true })) {
        const parsed = await simpleParser(message.source);
        for (let attachment of parsed.attachments || []) {
            if (attachment.contentType === 'application/pdf') {
                const savePath = path.join(__dirname, 'inboxpdf', attachment.filename);
                fs.writeFileSync(savePath, attachment.content);
                console.log(`PDF opgeslagen: ${savePath}`);
            }
        }
    }
    await client.logout();
};
run().catch(console.error);
