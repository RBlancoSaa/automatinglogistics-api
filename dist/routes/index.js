"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sendEasytrip_1 = require("../mail/sendEasytrip");
const router = express_1.default.Router();
router.get('/mailtest', async (req, res) => {
    try {
        await (0, sendEasytrip_1.sendEasytripMail)();
        res.status(200).send('✅ Mail verstuurd!');
    }
    catch (err) {
        res.status(500).send('❌ Mail verzenden mislukt: ' + err.message);
    }
});
exports.default = router;
