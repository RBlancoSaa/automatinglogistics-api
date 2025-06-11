"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./routes/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express_1.default.json());
app.use('/api', index_1.default);
// Extra endpoint voor frontend die direct naar /upload post
const upload = (0, multer_1.default)({ dest: 'inboxpdf/' });
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'Geen bestand ontvangen' });
        const newFilePath = path_1.default.join(__dirname, '..', 'inboxpdf', req.file.originalname);
        fs_1.default.renameSync(req.file.path, newFilePath);
        console.log('📥 PDF ontvangen:', req.file.originalname);
        res.status(200).json({
            message: '✅ PDF opgeslagen',
            bestand: req.file.originalname,
        });
    }
    catch (err) {
        console.error('❌ Uploadfout:', err.message);
        res.status(500).json({ error: 'Upload mislukt' });
    }
});
app.listen(PORT, () => {
    console.log(`✅ Server draait op poort ${PORT}`);
});
