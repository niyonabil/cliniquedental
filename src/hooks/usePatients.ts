import { useState, useEffect, useCallback } from 'react';
import { patientsApi, Patient } from '../lib/api';

export function usePatients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatients = useCallback(async () => {
        try {
            setLoading(true);
            const data = await patientsApi.getAll();
            setPatients(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch patients');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const addPatient = async (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newPatient = await patientsApi.create(patient);
            setPatients(prev => [...prev, newPatient]);
            return newPatient;
        } catch (err) {
            setError('Failed to create patient');
            console.error(err);
            throw err;
        }
    };

    const updatePatient = async (id: string, patient: Partial<Patient>) => {
        try {
            const updatedPatient = await patientsApi.update(id, patient);
            setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
            return updatedPatient;
        } catch (err) {
            setError('Failed to update patient');
            console.error(err);
            throw err;
        }
    };

    const deletePatient = async (id: string) => {
        try {
            await patientsApi.delete(id);
            setPatients(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError('Failed to delete patient');
            console.error(err);
            throw err;
        }
    };

    return {
        patients,
        loading,
        error,
        refetch: fetchPatients,
        addPatient,
        updatePatient,
        deletePatient,
    };
}
