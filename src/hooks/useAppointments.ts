import { useState, useEffect, useCallback } from 'react';
import { appointmentsApi, Appointment } from '../lib/api';

export function useAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await appointmentsApi.getAll();
            setAppointments(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch appointments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const addAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newAppointment = await appointmentsApi.create(appointment);
            setAppointments(prev => [...prev, newAppointment]);
            return newAppointment;
        } catch (err) {
            setError('Failed to create appointment');
            console.error(err);
            throw err;
        }
    };

    const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
        try {
            const updatedAppointment = await appointmentsApi.update(id, appointment);
            setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
            return updatedAppointment;
        } catch (err) {
            setError('Failed to update appointment');
            console.error(err);
            throw err;
        }
    };

    const deleteAppointment = async (id: string) => {
        try {
            await appointmentsApi.delete(id);
            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            setError('Failed to delete appointment');
            console.error(err);
            throw err;
        }
    };

    return {
        appointments,
        loading,
        error,
        refetch: fetchAppointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
    };
}
