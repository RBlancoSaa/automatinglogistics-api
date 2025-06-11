export async function parsePDFtoEasy(
  pdfPath: string,
  outputDir: string
): Promise<{ bestandsnaam: string; referentie: string }> {
  // Simulatie
  return {
    bestandsnaam: 'voorbeeld.easy',
    referentie: 'OE2517768',
  };
}
