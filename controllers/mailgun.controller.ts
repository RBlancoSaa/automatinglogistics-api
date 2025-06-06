import { Request, Response } from 'express';
import { sendEasytripMail } from '../mail/sendEasytrip';

export const handleMailgunWebhook = async (req: Request, res: Response) => {
  try {
    const { subject, attachments } = req.body;
    console.log("📥 Webhook ontvangen met subject:", subject);

    // Verstuur testmail
    await sendEasytripMail();

    res.status(200).send('✅ Mail verwerkt');
  } catch (err) {
    console.error('❌ Fout in webhook:', err);
    res.status(500).send('Serverfout');
  }
};
