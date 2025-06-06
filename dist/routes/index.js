"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const parsePDFtoEasy_1 = __importDefault(require("../parser/parsePDFtoEasy"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// Nodemailer transporter met jouw .env gegevens
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST, // bijv. smtp.jouwdomein.nl
    port: Number(process.env.SMTP_PORT), // bijv. 587
    secure: false, // true als je SSL gebruikt (meestal false met poort 587)
    auth: {
        user: process.env.SMTP_USER, // jouw e-mail adres uit .env
        pass: process.env.SMTP_PASS, // jouw wachtwoord uit .env
    },
});
router.get('/', (_req, res) => {
    res.send('✅ API draait op Render met TypeScript en nodemailer');
});
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Geen bestand geüpload.' });
        }
        const pdfPath = req.file.path;
        const outputDir = path_1.default.resolve('easyfiles');
        // Parse PDF en maak .easy bestand
        const resultaat = await (0, parsePDFtoEasy_1.default)(pdfPath, outputDir);
        // Mail versturen met PDF + .easy als bijlage
        const mailOptions = {
            from: `"Automation Logistics" <${process.env.SMTP_USER}>`,
            to: process.env.MAIL_RECEIVER, // wie ontvangt het? Vul in .env (bijv. jouw mailadres)
            subject: `Nieuwe transportopdracht: ${resultaat.referentie}`,
            text: `Er is een nieuwe transportopdracht binnengekomen met referentie ${resultaat.referentie}. Zie bijlagen.`,
            attachments: [
                { filename: req.file.originalname, path: pdfPath },
                { filename: resultaat.bestandsnaam, path: path_1.default.join(outputDir, resultaat.bestandsnaam) },
            ],
        };
        await transporter.sendMail(mailOptions);
        // Tijdelijke PDF verwijderen
        fs_1.default.unlinkSync(pdfPath);
        res.json({
            message: '✅ PDF verwerkt en mail verzonden!',
            referentie: resultaat.referentie,
            bestand: resultaat.bestandsnaam,
        });
    }
    catch (err) {
        console.error('❌ Fout:', err.message);
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
