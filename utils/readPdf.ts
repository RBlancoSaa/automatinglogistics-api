export async function parsePDFtoEasy(tempPath: string, outputDir: string) {
  const bestandsnaam = `dummy-${Date.now()}.easy`;
  const referentie = 'DUMMY-123456';
  return { bestandsnaam, referentie };
}
