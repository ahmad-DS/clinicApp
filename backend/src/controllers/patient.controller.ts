import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { Patient } from '../models/patient.model';

// 1. Register a new patient
export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age, sex, phone }: Patient = req.body;

    if (!name || age === undefined || !sex) {
       res.status(400).json({ error: 'Name, age, and sex are required fields.' });
       return;
    }

    const { data, error } = await supabaseAdmin
      .from('patients')
      .insert([{ name, age, sex, phone }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Patient registered successfully', patient: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Search patients by name or phone (Case-insensitive partial matching)
export const searchPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query) {
      // If no query parameter, return the latest 20 patients
      const { data, error } = await supabaseAdmin
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      res.status(200).json({ patients: data });
      return;
    }

    // Search matching either name or phone number
    const { data, error } = await supabaseAdmin
      .from('patients')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`);

    if (error) throw error;

    res.status(200).json({ patients: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get a single patient profile
export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    res.status(200).json({ patient: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};