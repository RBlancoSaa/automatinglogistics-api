export async function sendMail({
  pdfPath,
  easyPath,
  referentie,
}: {
  pdfPath: string;
  easyPath: string;
  referentie: string;
}) {
  console.log('📤 Mail verzonden:', pdfPath, easyPath, referentie);
}
