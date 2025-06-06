import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import parsePDFtoEasy from '../parsePDFtoEasy.js'; // gebruik de werkende JS-versie

// Eigen type zodat TypeScript weet dat req.file bestaat
interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Test endpoint om te checken of backend draait
router.get('/', (_req: Request, res: Response) => {
  res.send('✅ API draait op Render');
});

// Mailtest (dummy)
router.get('/mailtest', (_req: Request, res: Response) => {
  res.send('✅ Mail verstuurd!');
});

// Upload en verwerk PDF naar .easy bestand
router.post('/upload', upload.single('file'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload.' });
    }

    const pdfPath = req.file.path;
    const outputDir = path.join(__dirname, '../easyfiles');

    const resultaat = await parsePDFtoEasy(pdfPath, outputDir);

    fs.unlinkSync(pdfPath); // verwijder tijdelijk PDF-bestand

    res.json({
      message: '✅ PDF verwerkt en EASY bestand aangemaakt!',
      referentie: resultaat.referentie,
      bestand: resultaat.bestandsnaam,
    });
  } catch (err: any) {
    console.error('❌ Verwerkingsfout:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
