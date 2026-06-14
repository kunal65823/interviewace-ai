import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`InterviewAce AI API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});