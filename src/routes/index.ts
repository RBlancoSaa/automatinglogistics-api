import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import parsePDFtoEasy from '../parser/parsePDFtoEasy';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Nodemailer transporter met jouw .env gegevens
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // bijv. smtp.jouwdomein.nl
  port: Number(process.env.SMTP_PORT),  // bijv. 587
  secure: false,                    // true als je SSL gebruikt (meestal false met poort 587)
  auth: {
    user: process.env.SMTP_USER,    // jouw e-mail adres uit .env
    pass: process.env.SMTP_PASS,    // jouw wachtwoord uit .env
  },
});

router.get('/', (_req: Request, res: Response) => {
  res.send('✅ API draait op Render met TypeScript en nodemailer');
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload.' });
    }

    const pdfPath = (req.file as Express.Multer.File).path;
    const outputDir = path.resolve('easyfiles');

    // Parse PDF en maak .easy bestand
    const resultaat = await parsePDFtoEasy(pdfPath, outputDir);

    // Mail versturen met PDF + .easy als bijlage
    const mailOptions = {
      from: `"Automation Logistics" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_RECEIVER, // wie ontvangt het? Vul in .env (bijv. jouw mailadres)
      subject: `Nieuwe transportopdracht: ${resultaat.referentie}`,
      text: `Er is een nieuwe transportopdracht binnengekomen met referentie ${resultaat.referentie}. Zie bijlagen.`,
      attachments: [
        { filename: req.file.originalname, path: pdfPath },
        { filename: resultaat.bestandsnaam, path: path.join(outputDir, resultaat.bestandsnaam) },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Tijdelijke PDF verwijderen
    fs.unlinkSync(pdfPath);

    res.json({
      message: '✅ PDF verwerkt en mail verzonden!',
      referentie: resultaat.referentie,
      bestand: resultaat.bestandsnaam,
    });
  } catch (err: any) {
    console.error('❌ Fout:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
