import express from 'express';
import { sendEasytripMail } from '../mail/sendEasytrip';

const router = express.Router();

router.get('/mailtest', async (req, res) => {
  try {
    await sendEasytripMail();
    res.status(200).send('✅ Mail verstuurd!');
  } catch (err: any) {
    res.status(500).send('❌ Mail verzenden mislukt: ' + err.message);
  }
});

export default router;
