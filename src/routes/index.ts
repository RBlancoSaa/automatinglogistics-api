import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import parsePDFtoEasy from '../parser/parsePDFtoEasy';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.get('/', (_req: Request, res: Response) => {
  res.send('✅ API draait');
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload.' });
    }

    const pdfPath = req.file.path;
    const outputDir = path.resolve('easyfiles');

    const resultaat = await parsePDFtoEasy(pdfPath, outputDir);

    const mailOptions = {
      from: `"Automation Logistics" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `Nieuwe transportopdracht: ${resultaat.referentie}`,
      text: `Er is een nieuwe transportopdracht binnengekomen met referentie ${resultaat.referentie}. Zie bijlagen.`,
      attachments: [
        { filename: req.file.originalname, path: pdfPath },
        { filename: resultaat.bestandsnaam, path: path.join(outputDir, resultaat.bestandsnaam) },
      ],
    };

    await transporter.sendMail(mailOptions);
    fs.unlinkSync(pdfPath);

    res.json({
      message: '✅ Verwerkt en verzonden',
      referentie: resultaat.referentie,
      bestand: resultaat.bestandsnaam,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
