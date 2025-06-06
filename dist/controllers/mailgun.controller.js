"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMailgunWebhook = void 0;
const sendEasytrip_1 = require("../mail/sendEasytrip");
const handleMailgunWebhook = async (req, res) => {
    try {
        const { subject, attachments } = req.body;
        console.log("📥 Webhook ontvangen met subject:", subject);
        // Verstuur testmail
        await (0, sendEasytrip_1.sendEasytripMail)();
        res.status(200).send('✅ Mail verwerkt');
    }
    catch (err) {
        console.error('❌ Fout in webhook:', err);
        res.status(500).send('Serverfout');
    }
};
exports.handleMailgunWebhook = handleMailgunWebhook;
