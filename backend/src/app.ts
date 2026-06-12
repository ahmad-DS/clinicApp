import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import historyRoutes from './routes/history.routes'; // Add this import
import { supabase } from './config/supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());
app.use(cors({
  origin: 'https://warshihospitals.netlify.app',
  credentials: true
}));

app.use(express.json());

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', historyRoutes); // Mount History Routes under patients path

// Health Check Route to test Supabase connection
app.get('/health', async (req: Request, res: Response) => {
  try {
    // A quick, lightweight query to verify connection to Supabase
    const { data, error } = await supabase.from('patients').select('id').limit(1);
    
    if (error) throw error;

    res.status(200).json({
      status: 'UP',
      database: 'Connected successfully to Supabase'
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'DOWN',
      database: 'Failed to connect to Supabase',
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});