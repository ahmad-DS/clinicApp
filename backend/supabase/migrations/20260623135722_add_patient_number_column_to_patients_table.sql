CREATE SEQUENCE patient_number_seq START 1;

ALTER TABLE patients 
ADD COLUMN patient_number TEXT UNIQUE DEFAULT (
    TO_CHAR(CURRENT_DATE, 'YYYY') || LPAD(NEXTVAL('patient_number_seq')::TEXT, 8, '0')
);