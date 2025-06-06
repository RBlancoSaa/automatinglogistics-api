"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const run = async () => {
    const client = new imapflow_1.ImapFlow({
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
        const parsed = await (0, mailparser_1.simpleParser)(message.source);
        for (let attachment of parsed.attachments || []) {
            if (attachment.contentType === 'application/pdf') {
                const savePath = path_1.default.join(__dirname, 'inboxpdf', attachment.filename);
                fs_1.default.writeFileSync(savePath, attachment.content);
                console.log(`PDF opgeslagen: ${savePath}`);
            }
        }
    }
    await client.logout();
};
run().catch(console.error);
