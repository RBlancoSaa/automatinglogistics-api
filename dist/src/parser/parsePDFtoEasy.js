"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parsePDFtoEasy;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function parsePDFtoEasy(pdfPath, outputDir) {
    // TODO: Hier echte PDF uitlezing + XML genereren
    const xmlContent = `<Order>
    <Referentie>REF123456</Referentie>
    <Klant>Jordex</Klant>
    <ContainerType>45G1</ContainerType>
    <Bootnaam>Maersk Example</Bootnaam>
    <Vertrek>Rotterdam</Vertrek>
    <Bestemming>Hamburg</Bestemming>
  </Order>`;
    const bestandsnaam = `Order_${Date.now()}.easy`;
    const outputPath = path_1.default.join(outputDir, bestandsnaam);
    fs_1.default.mkdirSync(outputDir, { recursive: true });
    fs_1.default.writeFileSync(outputPath, xmlContent, 'utf-8');
    return { referentie: 'REF123456', bestandsnaam };
}
