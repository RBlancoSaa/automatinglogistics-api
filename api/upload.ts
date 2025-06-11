import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { parsePDFtoEasy } from '../utils/readPdf';
import { sendMail } from '../utils/sendViaSMTP';

export const config = { api: { bodyParser: false } };

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Parse error' });
    const file = files.file;
    if (!file || Array.isArray(file)) return res.status(400).json({ error: 'Geen bestand' });

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

      res.status(200).json({ message: '✅ Gelukt', referentie: resultaat.referentie });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}
