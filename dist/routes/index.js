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
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
router.get('/', (_req, res) => {
    res.send('✅ API draait');
});
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Geen bestand geüpload.' });
        }
        const pdfPath = req.file.path;
        const outputDir = path_1.default.resolve('easyfiles');
        const resultaat = await (0, parsePDFtoEasy_1.default)(pdfPath, outputDir);
        const mailOptions = {
            from: `"Automation Logistics" <${process.env.SMTP_USER}>`,
            to: process.env.EMAIL_RECEIVER,
            subject: `Nieuwe transportopdracht: ${resultaat.referentie}`,
            text: `Er is een nieuwe transportopdracht binnengekomen met referentie ${resultaat.referentie}. Zie bijlagen.`,
            attachments: [
                { filename: req.file.originalname, path: pdfPath },
                { filename: resultaat.bestandsnaam, path: path_1.default.join(outputDir, resultaat.bestandsnaam) },
            ],
        };
        await transporter.sendMail(mailOptions);
        fs_1.default.unlinkSync(pdfPath);
        res.json({
            message: '✅ Verwerkt en verzonden',
            referentie: resultaat.referentie,
            bestand: resultaat.bestandsnaam,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
