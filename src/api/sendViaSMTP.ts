type SendMailInput = {
  pdfPath: string;
  easyPath: string;
  referentie: string;
};

export async function sendMail({ pdfPath, easyPath, referentie }: SendMailInput) {
  console.log('📤 Simuleer verzenden van mail met:', {
    pdfPath,
    easyPath,
    referentie,
  });
}
