import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import path from 'path';

export const addMedicalHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patient_id } = req.params;
    const { description } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!description) {
      res.status(400).json({ error: 'Medical description is required.' });
      return;
    }

    // 1. Insert the text-based history entry into the database first
    const { data: historyRecord, error: historyError } = await supabase
      .from('medical_histories')
      .insert([{ patient_id, description }])
      .select()
      .single();

    if (historyError) throw historyError;
    
    const historyId = historyRecord.id;
    const uploadedImagesLog = [];

    // 2. Check if files are attached and handle the upload loop
    if (files && files.length > 0) {
      for (const file of files) {
        // Generate a clean, unique file path name
        const fileExtension = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
        const filePath = `patients/${patient_id}/${historyId}/${fileName}`;

        // Upload directly to the 'patient-records' bucket we made
        const { error: uploadError } = await supabase.storage
          .from('patient-records')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Retrieve the secure public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('patient-records')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Save the image public URL into the 'medical_images' table
        const { data: imageRecord, error: imgTableError } = await supabase
          .from('medical_images')
          .insert([{ history_id: historyId, image_url: publicUrl }])
          .select()
          .single();

        if (imgTableError) throw imgTableError;
        uploadedImagesLog.push(imageRecord);
      }
    }

    res.status(201).json({
      message: 'Medical history and records logged successfully',
      history: historyRecord,
      images: uploadedImagesLog
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const getPatientMedicalHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patient_id } = req.params;

    // 1. Verify if the patient exists first
    const { data: patientExists, error: patientCheckError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patient_id)
      .maybeSingle();

    if (patientCheckError) throw patientCheckError;
    
    if (!patientExists) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // 2. Fetch all medical histories linked to this patient
    // The syntax 'medical_images(*)' tells Postgres to find all matching rows in medical_images
    const { data: histories, error: historyError } = await supabase
      .from('medical_histories')
      .select(`
        id,
        description,
        created_at,
        medical_images (
          id,
          image_url,
          uploaded_at
        )
      `)
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: false }); // Latest medical history entries first

    if (historyError) throw historyError;

    res.status(200).json({
      patient_id,
      total_records: histories.length,
      history: histories
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};