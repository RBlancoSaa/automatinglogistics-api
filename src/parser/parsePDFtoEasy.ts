import fs from 'fs';
import path from 'path';

export default async function parsePDFtoEasy(
  pdfPath: string,
  outputDir: string
): Promise<{ referentie: string; bestandsnaam: string }> {
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
  const outputPath = path.join(outputDir, bestandsnaam);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, xmlContent, 'utf-8');

  return { referentie: 'REF123456', bestandsnaam };
}
