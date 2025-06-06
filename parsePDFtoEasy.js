const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Escape XML-tekens zoals & < > " '
function escapeXML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = async function parsePDFtoEasy(pdfPath, outputDir) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const text = (await pdf(dataBuffer)).text;

  const get = (label) => {
    const match = text.match(new RegExp(`${label}:\\s*(.+)`));
    return match ? match[1].trim() : '';
  };

  const referentie = get("Our reference");
  if (!referentie) throw new Error("❌ Geen referentie gevonden");

  const remark = text.includes("Remark") ? text.split("Remark")[1].split("General")[0].trim() : "";

  const vessel = get("Vessel");
  const carrier = get("Carrier");
  const bestemming = get("To")?.split(',')[0];
  const uithaalref = text.match(/Reference\(s\):\s*(YMF[A-Z0-9]+)/)?.[1] || '';
  const laadref = text.match(/Reference\(s\):\s*(\d{6})/)?.[1] || '';

  const volume = text.match(/Volume\s+(\d+)m³/)?.[1] || '0';
  const gewicht = text.match(/Weight\s+(\d+)kg/)?.[1] || '0';
  const lading = text.match(/Description\s+(.+)/)?.[1] || '';
  const temperatuur = text.match(/Temperature:\s*(-?\d+)/)?.[1] || '';

  const datumTijd = text.match(/Date:\s*(\d{2} \w+ \d{4})\s*(\d{2}:\d{2})/);
  const datum = datumTijd ? datumTijd[1] : '';
  const tijd = datumTijd ? datumTijd[2] : '';

  const locatieRegex = /Address:\s*(.*?)\n(.*?)\n(\d{4}\s*[A-Z]{2})\n(.+?)\n/gs;
  const locaties = [...text.matchAll(locatieRegex)].map((m, i) => ({
    actie: i === 0 ? "Opzetten" : i === 1 ? "Laden" : "Inleveren",
    naam: m[1].trim(),
    adres: m[2].trim(),
    postcode: m[3].trim(),
    plaats: m[4].trim()
  }));

  if (locaties.length < 2) throw new Error("❌ Minimaal 2 locaties vereist voor laadplaats en inleveren");

  const easyXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Order>
<Dossiers>
  <Dossier>
    <Opdrachtgever>
      <Opdrachtgever>Jordex Shipping & Forwarding B.V.</Opdrachtgever>
      <Opdrachtgever_Adres>Ambachtsweg 6</Opdrachtgever_Adres>
      <Opdrachtgever_Postcode>3161 GL</Opdrachtgever_Postcode>
      <Opdrachtgever_Plaats>Rhoon</Opdrachtgever_Plaats>
      <Opdrachtgever_TelefoonNummer>+31 (0)10 303 7303</Opdrachtgever_TelefoonNummer>
      <Opdrachtgever_Email>info@jordex.com</Opdrachtgever_Email>
      <Opdrachtgever_BTW>NL815340011B01</Opdrachtgever_BTW>
      <Opdrachtgever_KVK>24390991</Opdrachtgever_KVK>
    </Opdrachtgever>
    <Container>
      <Ritnr>${escapeXML(referentie)}</Ritnr>
      <Laden_Lossen>Laden</Laden_Lossen>
      <Type>Export</Type>
      <Bootnaam>${escapeXML(vessel)}</Bootnaam>
      <Rederij>${escapeXML(carrier)}</Rederij>
      <Bestemming>${escapeXML(bestemming)}</Bestemming>
      <Uithaalreferentie>${escapeXML(uithaalref)}</Uithaalreferentie>
      <Laad_Los_Referentie>${escapeXML(laadref)}</Laad_Los_Referentie>
      <Inleverreferentie>${escapeXML(uithaalref)}</Inleverreferentie>
      <Bijzonderheden>${escapeXML(remark)}</Bijzonderheden>
      <Datum>${escapeXML(datum)}</Datum>
      <Tijd>${escapeXML(tijd)}</Tijd>
      <Temperatuur>${escapeXML(temperatuur)}</Temperatuur>
      <Volume>${escapeXML(volume)}</Volume>
      <Gewicht>${escapeXML(gewicht)}</Gewicht>
      <Colli>0</Colli>
      <Lading>${escapeXML(lading)}</Lading>
      <ADR>NEE</ADR>
    </Container>
    <Locaties>
${locaties.map(loc => `      <Locatie>
        <Volgorde>0</Volgorde>
        <Actie>${escapeXML(loc.actie)}</Actie>
        <Naam>${escapeXML(loc.naam)}</Naam>
        <Adres>${escapeXML(loc.adres)}</Adres>
        <Postcode>${escapeXML(loc.postcode)}</Postcode>
        <Plaats>${escapeXML(loc.plaats)}</Plaats>
      </Locatie>`).join('\n')}
    </Locaties>
    <Financieel>
      <Vracht>0</Vracht>
      <Vracht_Betaalwijze>vv</Vracht_Betaalwijze>
      <Valuta>EUR</Valuta>
      <BTW>0</BTW>
    </Financieel>
  </Dossier>
</Dossiers>
</Order>`;

  const laadplaats = locaties[1].plaats.replace(/\s/g, '-');
  const bestandsnaam = `Order_${referentie}_${laadplaats}.easy`;
  const savePath = path.join(outputDir, bestandsnaam);
  fs.writeFileSync(savePath, easyXml, "utf8");

  return {
    pad: savePath,
    bestandsnaam,
    referentie
  };
};
