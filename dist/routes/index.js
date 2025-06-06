"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const parsePDFtoEasy_1 = __importDefault(require("../parser/parsePDFtoEasy"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.get('/', (_req, res) => {
    res.send('✅ API draait op Render met TypeScript');
});
router.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'Geen bestand geüpload.' });
    }
    const pdfPath = file.path;
    const outputDir = path_1.default.resolve('easyfiles');
    try {
        const resultaat = await (0, parsePDFtoEasy_1.default)(pdfPath, outputDir);
        fs_1.default.unlinkSync(pdfPath);
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
exports.default = router;
