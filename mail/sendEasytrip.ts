import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Zorg dat .env uit de root correct geladen wordt
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  TO_EMAIL
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL || !TO_EMAIL) {
  throw new Error('❌ SMTP-configuratie ontbreekt in .env bestand');
}

export const sendEasytripMail = async () => {
  try {
    const uploadsDir = path.resolve(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);

    const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
    const easyFile = files.find(f => f.toLowerCase().endsWith('.easy'));

    if (!pdfFile || !easyFile) {
      throw new Error('❌ Vereiste bestanden (.pdf en .easy) niet gevonden in uploads-map');
    }

    const pdfPath = path.join(uploadsDir, pdfFile);
    const easyPath = path.join(uploadsDir, easyFile);

    console.log('📂 PDF:', pdfPath);
    console.log('📂 EASY:', easyPath);

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465, // true for 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    });

    const mailOptions = {
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Easytrip export: ${easyFile}`,
      text: 'Bijgevoegd: PDF + EASY bestand',
      attachments: [
        {
          filename: pdfFile,
          path: pdfPath
        },
        {
          filename: easyFile,
          path: easyPath
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Mail verzonden:', info.messageId);
  } catch (error: any) {
    console.error('❌ Fout bij verzenden:', error.message);
  }
};
