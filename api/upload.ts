import { IncomingForm, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

import parsePDFtoEasy from '../../utils/readPdf';
import sendViaSMTP from '../../utils/sendViaSMTP';

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err: any, fields: any, files: Files) => {
    if (err) {
      console.error('❌ Parse-fout:', err);
      return res.status(500).json({ error: 'Parse error' });
    }

    const file = files.file as unknown as { filepath: string };

    if (!file?.filepath || Array.isArray(file)) {
      return res.status(400).json({ error: 'Geen geldig bestand ontvangen' });
    }

    const tempPath = file.filepath;
    const outputDir = path.join(process.cwd(), 'easyfiles');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    try {
      const resultaat = await parsePDFtoEasy(tempPath, outputDir);

      await sendViaSMTP({
        to: process.env.FROM_EMAIL!,
        subject: `Easytrip-bestand: ${resultaat.referentie}`,
        attachments: [
          {
            filename: `${resultaat.referentie}.easy`,
            path: path.join(outputDir, resultaat.bestandsnaam)
          },
          {
            filename: `${resultaat.referentie}.pdf`,
            path: tempPath
          }
        ]
      });

      return res.status(200).json({
        message: '✅ Verwerkt & verstuurd',
        referentie: resultaat.referentie
      });
    } catch (error: unknown) {
      console.error('❌ Verwerkingsfout:', error);
      return res.status(500).json({ error: (error as Error).message || 'Verwerkingsfout' });
    }
  });
}
