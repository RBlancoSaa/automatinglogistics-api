import { IncomingForm, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { parsePDFtoEasy } from '../utils/readPdf';
import { sendMail } from '../utils/sendViaSMTP';
import type { IncomingMessage, ServerResponse } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err: Error | null, fields: any, files: Files) => {
    if (err) {
      console.error('❌ Parse error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Parse error' }));
      return;
    }

    const file = files.file as unknown as { filepath: string };

    if (!file?.filepath || Array.isArray(file)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Geen geldig bestand ontvangen' }));
      return;
    }

    const tempPath = file.filepath;
    const outputDir = path.join(process.cwd(), 'easyfiles');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    try {
      const resultaat = await parsePDFtoEasy(tempPath, outputDir);

      await sendMail({
        pdfPath: tempPath,
        easyPath: path.join(outputDir, resultaat.bestandsnaam),
        referentie: resultaat.referentie,
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          message: '✅ Verwerkt & verstuurd',
          referentie: resultaat.referentie,
        })
      );
    } catch (e: any) {
      console.error('❌ Verwerkingsfout:', e);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: e.message || 'Interne fout' }));
    }
  });
}
