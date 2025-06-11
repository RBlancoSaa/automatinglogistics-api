import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import router from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routers
app.use('/api', router);

// Multer-configuratie voor PDF-upload
const upload = multer({ dest: path.join(__dirname, '../../inboxpdf') });

// Upload endpoint voor transportopdrachten (.pdf)
app.post('/api/transportopdracht', upload.single('pdf'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Geen bestand ontvangen' });
  }

  const newFilePath = path.join(__dirname, '../../inboxpdf', file.originalname);

  fs.renameSync(file.path, newFilePath);

  console.log('📥 PDF opgeslagen:', newFilePath);
  res.status(200).json({ message: 'PDF ontvangen', bestandsnaam: file.originalname });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});
