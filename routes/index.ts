import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import parsePDFtoEasy from '../parser/parsePDFtoEasy';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', (req, res) => {
  res.send('API is live op Render!');
});

router.get('/mailtest', async (req, res) => {
  res.send('✅ Mail verstuurd!');
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const outputDir = path.join(__dirname, '../easyfiles');

    const resultaat = await parsePDFtoEasy(pdfPath, outputDir);

    fs.unlinkSync(pdfPath); // verwijder tijdelijke PDF

    res.json({
      message: '✅ PDF verwerkt en EASY bestand aangemaakt!',
      referentie: resultaat.referentie,
      bestand: resultaat.bestandsnaam
    });
  } catch (err: any) {
    console.error('❌ Fout bij verwerken:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
