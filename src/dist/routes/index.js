import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import parsePDFtoEasy from '../parser/parsePDFtoEasy';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
router.get('/', (_req, res) => {
    res.send('✅ API draait op Render met TypeScript');
});
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Geen bestand geüpload.' });
        }
        const pdfPath = file.path;
        const outputDir = path.resolve('easyfiles');
        const resultaat = await parsePDFtoEasy(pdfPath, outputDir);
        fs.unlinkSync(pdfPath);
        res.json({
            message: '✅ PDF verwerkt!',
            referentie: resultaat.referentie,
            bestand: resultaat.bestandsnaam,
        });
    }
    catch (err) {
        console.error('❌ Fout:', err.message);
        res.status(500).json({ error: err.message });
    }
});
export default router;
