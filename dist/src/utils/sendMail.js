"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendMail({ subject, tekst, attachments }) {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    await transporter.sendMail({
        from: `"Automation Logistics" <${process.env.FROM_EMAIL}>`,
        to: process.env.TO_EMAIL,
        subject,
        text: tekst,
        attachments
    });
}
