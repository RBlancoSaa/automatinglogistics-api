const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

module.exports = async function parsePDFtoEasy(pdfPath, outputDir) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const text = (await pdf(dataBuffer)).text;

  const get = (label) => {
    const match = text.match(new RegExp(`${label}:\\s*(.+)`));
    return match ? match[1].trim() : null;
  };

  const referentie = get("Our reference");
  if (!referentie) throw new Error("Geen referentie gevonden");

  const remark = text.includes("Remark") ? text.split("Remark")[1].split("General")[0].trim() : "";

  const vessel = get("Vessel");
  const carrier = get("Carrier");
  const bestemming = get("To")?.split(',')[0];
  const uithaalref = text.match(/Reference\(s\):\s*(YMF[A-Z0-9]+)/)?.[1];
  const laadref = text.match(/Reference\(s\):\s*(\d{6})/)?.[1];

  const volume = text.match(/Volume\s+(\d+)m³/)?.[1] || "0";
  const gewicht = text.match(/Weight\s+(\d+)kg/)?.[1] || "0";
  const lading = text.match(/Description\s+(.+)/)?.[1] || "";
  const temperatuur = text.match(/Temperature:\s*(-?\d+)/)?.[1] || "";

  const datumTijd = text.match(/Date:\s*(\d{2} \w+ \d{4})\s*(\d{2}:\d{2})/);
  const datum = datumTijd ? datumTijd[1] : "onbekend";
  const tijd = datumTijd ? datumTijd[2] : "00:00";

  // Locaties (voorbeeldmatig simpel uit tekst)
  const locatieRegex = /Address:\s*(.*?)\n(.*?)\n(\d{4}\s*[A-Z]{2})\n(.+?)\n/gs;
  const locaties = [...text.matchAll(locatieRegex)].map((m, i) => ({
    actie: i === 0 ? "Opzetten" : i === 1 ? "Laden" : "Inleveren",
    naam: m[1].trim(),
    adres: m[2].trim(),
    postcode: m[3].trim(),
    plaats: m[4].trim()
  }));

  if (locaties.length < 3) throw new Error("Locaties niet volledig herkend");

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
      <Ritnr>${referentie}</Ritnr>
      <Laden_Lossen>Laden</Laden_Lossen>
      <Type>Export</Type>
      <Bootnaam>${vessel}</Bootnaam>
      <Rederij>${carrier}</Rederij>
      <Bestemming>${bestemming}</Bestemming>
      <Uithaalreferentie>${uithaalref}</Uithaalreferentie>
      <Laad_Los_Referentie>${laadref}</Laad_Los_Referentie>
      <Inleverreferentie>${uithaalref}</Inleverreferentie>
      <Bijzonderheden>${remark}</Bijzonderheden>
      <Datum>${datum}</Datum>
      <Tijd>${tijd}</Tijd>
      <Temperatuur>${temperatuur}</Temperatuur>
      <Volume>${volume}</Volume>
      <Gewicht>${gewicht}</Gewicht>
      <Colli>0</Colli>
      <Lading>${lading}</Lading>
      <ADR>NEE</ADR>
    </Container>
    <Locaties>
${locaties.map(loc => `
      <Locatie>
        <Volgorde>0</Volgorde>
        <Actie>${loc.actie}</Actie>
        <Naam>${loc.naam}</Naam>
        <Adres>${loc.adres}</Adres>
        <Postcode>${loc.postcode}</Postcode>
        <Plaats>${loc.plaats}</Plaats>
      </Locatie>`).join('')}
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

  const bestandsnaam = `Order_${referentie}_${locaties[1].plaats.replace(/\s/g, '-')}.easy`;
  const savePath = path.join(outputDir, bestandsnaam);
  fs.writeFileSync(savePath, easyXml, "utf8");

  return {
    pad: savePath,
    bestandsnaam,
    referentie
  };
};
