import express from 'express';
import cors from 'cors';
import router from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});
