"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parsePDFtoEasy;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function parsePDFtoEasy(pdfPath, outputDir) {
    const parsedXML = buildEasyXML({
        referentie: 'TEST123',
        klantnaam: 'Jordex',
        containerType: '45G1',
        bootnaam: 'Maersk Example',
        vertrek: 'Rotterdam',
        bestemming: 'Hamburg',
    });
    const bestandsnaam = `Order_TEST_${Date.now()}.easy`;
    const outputPath = path_1.default.join(outputDir, bestandsnaam);
    fs_1.default.mkdirSync(outputDir, { recursive: true });
    fs_1.default.writeFileSync(outputPath, parsedXML, 'utf-8');
    return {
        referentie: 'TEST123',
        bestandsnaam,
    };
}
function buildEasyXML(data) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Order>
  <Referentie>${data.referentie}</Referentie>
  <Klant>${data.klantnaam}</Klant>
  <ContainerType>${data.containerType}</ContainerType>
  <Boot>${data.bootnaam}</Boot>
  <Vertrek>${data.vertrek}</Vertrek>
  <Bestemming>${data.bestemming}</Bestemming>
</Order>`;
}
