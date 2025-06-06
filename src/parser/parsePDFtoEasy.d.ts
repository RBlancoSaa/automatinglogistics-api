declare module 'parsePDFtoEasy' {
  export default function parsePDFtoEasy(
    pdfPath: string,
    outputDir: string
  ): Promise<{ referentie: string; bestandsnaam: string }>;
}
