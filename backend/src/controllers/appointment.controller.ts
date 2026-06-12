import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Appointment } from '../models/appointment.model';

// 1. Book an OPD Appointment with Auto-Token Calculation
export const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patient_id, appointment_date }: Appointment = req.body;
    console.log("patient ID", patient_id);

    if (!patient_id || !appointment_date) {
      res.status(400).json({ error: 'Patient ID and Appointment Date are required.' });
      return;
    }

    // Check if the patient already has an appointment booked for this day
    const { data: existingBooking, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', patient_id)
      .eq('appointment_date', appointment_date)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingBooking) {
      res.status(400).json({ error: 'This patient already has an appointment booked for this date.' });
      return;
    }

    // Fetch the total count of existing appointments on that day to compute the token
    const { count, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', appointment_date);

    if (countError) throw countError;

    const nextTokenNumber = (count || 100) + 1;

    // Create the appointment record
    const { data, error: insertError } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id,
          appointment_date,
          token_number: nextTokenNumber,
          status: 'Scheduled'
        }
      ])
      .select()
      .single();
    
    console.log("inserted data", data);
    console.log("insert error", insertError)
    if (insertError) throw insertError;

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment: data
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Fetch OPD Queue by Date (Includes Patient Profiles via Join)
export const getAppointmentsByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ error: 'Date parameter (YYYY-MM-DD) is required.' });
      return;
    }

    // Use Supabase relations syntax to fetch appointment details AND parent patient records
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        token_number,
        status,
        patients (
          id,
          name,
          age,
          sex,
          phone
        )
      `)
      .eq('appointment_date', date)
      .order('token_number', { ascending: true });

    if (error) throw error;

    res.status(200).json({ date, queue_count: data.length, queue: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};