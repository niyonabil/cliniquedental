import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    medicalHistory?: string[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    dentistId: string;
    date: string;
    time: string;
    duration: number;
    type: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Dentist {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialty: string;
    availableDays: string[];
    workingHours: {
        start: string;
        end: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Patients API
export const patientsApi = {
    getAll: async (): Promise<Patient[]> => {
        const response = await api.get('/patients');
        return response.data.data;
    },

    getById: async (id: string): Promise<Patient> => {
        const response = await api.get(`/patients/${id}`);
        return response.data.data;
    },

    create: async (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> => {
        const response = await api.post('/patients', patient);
        return response.data.data;
    },

    update: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
        const response = await api.put(`/patients/${id}`, patient);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/patients/${id}`);
    },
};

// Appointments API
export const appointmentsApi = {
    getAll: async (): Promise<Appointment[]> => {
        const response = await api.get('/appointments');
        return response.data.data;
    },

    create: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
        const response = await api.post('/appointments', appointment);
        return response.data.data;
    },

    update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
        const response = await api.put(`/appointments/${id}`, appointment);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/appointments/${id}`);
    },
};

// Dentists API
export const dentistsApi = {
    getAll: async (): Promise<Dentist[]> => {
        const response = await api.get('/dentists');
        return response.data.data;
    },

    create: async (dentist: Omit<Dentist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dentist> => {
        const response = await api.post('/dentists', dentist);
        return response.data.data;
    },

    update: async (id: string, dentist: Partial<Dentist>): Promise<Dentist> => {
        const response = await api.put(`/dentists/${id}`, dentist);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/dentists/${id}`);
    },
};

export default api;
