import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import historyRoutes from './routes/history.routes'; // Add this import
import authRoutes from './routes/auth.routes';
import { supabase } from './config/supabase';
import { authenticate } from './middleware/authenticate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
app.use(cors({
  origin: 'https://warshihospitals.netlify.app',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

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

//auth routes
app.use('/api/auth', authRoutes);

app.use(authenticate); // Apply authentication middleware globally for all routes below
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', historyRoutes); // Mount History Routes under patients path

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});