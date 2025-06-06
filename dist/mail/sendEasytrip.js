"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEasytripMail = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// Zorg dat .env uit de root correct geladen wordt
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, TO_EMAIL } = process.env;
if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL || !TO_EMAIL) {
    throw new Error('❌ SMTP-configuratie ontbreekt in .env bestand');
}
const sendEasytripMail = async () => {
    try {
        const uploadsDir = path_1.default.resolve(__dirname, '../uploads');
        const files = fs_1.default.readdirSync(uploadsDir);
        const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
        const easyFile = files.find(f => f.toLowerCase().endsWith('.easy'));
        if (!pdfFile || !easyFile) {
            throw new Error('❌ Vereiste bestanden (.pdf en .easy) niet gevonden in uploads-map');
        }
        const pdfPath = path_1.default.join(uploadsDir, pdfFile);
        const easyPath = path_1.default.join(uploadsDir, easyFile);
        console.log('📂 PDF:', pdfPath);
        console.log('📂 EASY:', easyPath);
        const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        console.error('❌ Fout bij verzenden:', error.message);
    }
};
exports.sendEasytripMail = sendEasytripMail;
