import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import indexRoutes from './routes/index';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use('/api', indexRoutes);

// Extra endpoint voor frontend die direct naar /upload post
const upload = multer({ dest: 'inboxpdf/' });

app.post('/upload', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Geen bestand ontvangen' });

    const newFilePath = path.join(__dirname, '..', 'inboxpdf', req.file.originalname);
    fs.renameSync(req.file.path, newFilePath);
    console.log('📥 PDF ontvangen:', req.file.originalname);

    res.status(200).json({
      message: '✅ PDF opgeslagen',
      bestand: req.file.originalname,
    });
  } catch (err: any) {
    console.error('❌ Uploadfout:', err.message);
    res.status(500).json({ error: 'Upload mislukt' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});
