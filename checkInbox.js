const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const fs = require("fs");
const path = require("path");
const parsePDF = require("./parsePDFtoEasy");
const sendMail = require("./sendViaSMTP");

const inboxDir = path.join(__dirname, "inboxpdf");
const easyDir = path.join(__dirname, "easyfiles");
const logDir = path.join(__dirname, "logs");
const logPath = path.join(logDir, `log-${new Date().toISOString().split("T")[0]}.json`);

const log = [];

function formatImapDate(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
}

const run = async () => {
  if (!fs.existsSync(inboxDir)) fs.mkdirSync(inboxDir);
  if (!fs.existsSync(easyDir)) fs.mkdirSync(easyDir);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  const client = new ImapFlow({
    host: "imap.mijndomein.nl",
    port: 993,
    secure: true,
    auth: {
      user: "emails@tiarotransport.nl",
      pass: "Ti@roTr@nsport2019",
    },
    logger: false,
  });

  await client.connect();
  await client.mailboxOpen("INBOX");

  const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const recentMessages = await client.search({ since });

  console.log(`📨 Ongelezen transportopdracht-mails sinds ${since.toDateString()}`);

  for await (let message of client.fetch(recentMessages, {
    envelope: true,
    source: true,
    flags: true,
    uid: true,
  })) {
    try {
      const parsed = await simpleParser(message.source);
      console.log("📤 Verwerk e-mail van:", parsed.from?.text);

      if (!parsed.attachments?.length) {
        console.log("⏭️ Geen bijlagen aanwezig");
        continue;
      }

      for (let attachment of parsed.attachments) {
        console.log(`📎 Bijlage gevonden: ${attachment.filename} (${attachment.contentType})`);

        const isPDF = attachment.contentType === "application/pdf" || (attachment.filename && attachment.filename.toLowerCase().endsWith(".pdf"));

        if (isPDF) {
          const pdfName = `${Date.now()}_${attachment.filename}`;
          const pdfPath = path.join(inboxDir, pdfName);
          fs.writeFileSync(pdfPath, attachment.content);

          console.log(`✅ PDF opgeslagen: ${pdfPath}`);

          try {
            const easyResult = await parsePDF(pdfPath, easyDir);

            await sendMail({
              to: "opdrachten@tiarotransport.nl",
              subject: `easytrip file - Automating Logistics - ${easyResult.referentie}`,
              attachments: [
                { filename: easyResult.bestandsnaam, path: easyResult.pad },
                { filename: attachment.filename, path: pdfPath },
              ],
            });

            log.push({
              status: "verwerkt",
              referentie: easyResult.referentie,
              bestand: easyResult.bestandsnaam,
            });
          } catch (err) {
            console.warn(`❌ Parserfout: ${err.message}`);
            log.push({
              status: "fout",
              reden: err.message,
              bestand: pdfPath,
            });
          }

        } else {
          console.log(`⏭️ Bijlage overgeslagen (geen PDF): ${attachment.filename}`);
        }
      }
    } catch (err) {
      console.warn(`⛔ Fout bij verwerken van bericht: ${err.message}`);
      log.push({
        status: "fout bij bericht",
        reden: err.message,
        uid: message.uid,
      });
    }
  }

  await client.logout();

  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log(`📋 Log opgeslagen: ${logPath}`);
};

run().catch(console.error);
