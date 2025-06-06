import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import parsePDFtoEasy from '../parser/parsePDFtoEasy';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', (_req: Request, res: Response) => {
  res.send('✅ API draait op Render met TypeScript');
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    // Check of req.file bestaat en maak dan een type assertion
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: 'Geen bestand geüpload.' });
    }

    const pdfPath = file.path;
    const outputDir = path.resolve('easyfiles');

    const resultaat = await parsePDFtoEasy(pdfPath, outputDir);

    fs.unlinkSync(pdfPath); // Verwijder tijdelijk PDF-bestand

    res.json({
      message: '✅ PDF verwerkt!',
      referentie: resultaat.referentie,
      bestand: resultaat.bestandsnaam,
    });
  } catch (err: any) {
    console.error('❌ Fout:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
