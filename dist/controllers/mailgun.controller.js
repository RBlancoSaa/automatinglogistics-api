import { sendEasytripMail } from '../mail/sendEasytrip';
export const handleMailgunWebhook = async (req, res) => {
    try {
        const { subject, attachments } = req.body;
        console.log("📥 Webhook ontvangen met subject:", subject);
        // Verstuur testmail
        await sendEasytripMail();
        res.status(200).send('✅ Mail verwerkt');
    }
    catch (err) {
        console.error('❌ Fout in webhook:', err);
        res.status(500).send('Serverfout');
    }
};
