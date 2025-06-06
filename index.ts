import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();
const app = express();
app.use(express.json({ limit: '10mb' }));
app.get('/', (req, res) => {
  res.send('✅ API is live op Render!');
});

app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
