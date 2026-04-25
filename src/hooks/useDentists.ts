import { useState, useEffect, useCallback } from 'react';
import { dentistsApi, Dentist } from '../lib/api';

export function useDentists() {
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDentists = useCallback(async () => {
        try {
            setLoading(true);
            const data = await dentistsApi.getAll();
            setDentists(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch dentists');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDentists();
    }, [fetchDentists]);

    const addDentist = async (dentist: Omit<Dentist, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newDentist = await dentistsApi.create(dentist);
            setDentists(prev => [...prev, newDentist]);
            return newDentist;
        } catch (err) {
            setError('Failed to create dentist');
            console.error(err);
            throw err;
        }
    };

    const updateDentist = async (id: string, dentist: Partial<Dentist>) => {
        try {
            const updatedDentist = await dentistsApi.update(id, dentist);
            setDentists(prev => prev.map(d => d.id === id ? updatedDentist : d));
            return updatedDentist;
        } catch (err) {
            setError('Failed to update dentist');
            console.error(err);
            throw err;
        }
    };

    const deleteDentist = async (id: string) => {
        try {
            await dentistsApi.delete(id);
            setDentists(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            setError('Failed to delete dentist');
            console.error(err);
            throw err;
        }
    };

    return {
        dentists,
        loading,
        error,
        refetch: fetchDentists,
        addDentist,
        updateDentist,
        deleteDentist,
    };
}
