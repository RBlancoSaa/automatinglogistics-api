import fs from 'fs';
import path from 'path';

export default async function parsePDFtoEasy(
  pdfPath: string,
  outputDir: string
): Promise<{ referentie: string; bestandsnaam: string }> {
  // TODO: hier komt straks echte parsing
  const parsedXML = buildEasyXML({
    referentie: 'TEST123',
    klantnaam: 'Jordex',
    containerType: '45G1',
    bootnaam: 'Maersk Example',
    vertrek: 'Rotterdam',
    bestemming: 'Hamburg',
  });

  const bestandsnaam = `Order_TEST_${Date.now()}.easy`;
  const outputPath = path.join(outputDir, bestandsnaam);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, parsedXML, 'utf-8');

  return {
    referentie: 'TEST123',
    bestandsnaam,
  };
}

function buildEasyXML(data: {
  referentie: string;
  klantnaam: string;
  containerType: string;
  bootnaam: string;
  vertrek: string;
  bestemming: string;
}): string {
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
