const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.mijndomein.nl',
  port: 465,
  secure: true,
  auth: {
    user: 'emails@tiarotransport.nl',
    pass: 'Ti@roTr@nsport2019'
  }
});

module.exports = async function sendViaSMTP({ to, subject, attachments }) {
  const info = await transporter.sendMail({
    from: '"Easytrip Automator" <emails@tiarotransport.nl>',
    to,
    subject,
    text: 'Automatisch gegenereerd .easy-bestand (inclusief PDF) door Automation Logistics',
    attachments
  });

  console.log(`📧 E-mail verzonden naar ${to}: ${info.messageId}`);
};
