"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = handler;
const formidable_1 = require("formidable");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readPdf_1 = require("./readPdf");
const sendViaSMTP_1 = require("./sendViaSMTP");
exports.config = {
    api: {
        bodyParser: false,
    },
};
function handler(req, res) {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
    }
    const form = new formidable_1.IncomingForm({ uploadDir: '/tmp', keepExtensions: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('❌ Fout bij inlezen formulier:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Parse error' }));
            return;
        }
        const file = files.file;
        if (!file?.filepath || Array.isArray(file)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Geen geldig bestand ontvangen' }));
            return;
        }
        const tempPath = file.filepath;
        const outputDir = path_1.default.join(process.cwd(), 'easyfiles');
        if (!fs_1.default.existsSync(outputDir))
            fs_1.default.mkdirSync(outputDir);
        try {
            const resultaat = await (0, readPdf_1.parsePDFtoEasy)(tempPath, outputDir);
            await (0, sendViaSMTP_1.sendMail)({
                pdfPath: tempPath,
                easyPath: path_1.default.join(outputDir, resultaat.bestandsnaam),
                referentie: resultaat.referentie,
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                message: '✅ Verwerkt & verstuurd',
                referentie: resultaat.referentie,
            }));
        }
        catch (e) {
            const error = e instanceof Error ? e.message : 'Onbekende fout';
            console.error('❌ Verwerkingsfout:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error }));
        }
    });
}
