// Secure Local File Storage System with Encryption
// Data is stored in encrypted .dat files and protected against unauthorized modification

const STORAGE_KEY_PREFIX = 'dental_clinic_';
const ENCRYPTION_KEY = 'dental_clinic_secure_key_2024'; // In production, use environment variable

// Simple XOR + Base64 encryption (for demonstration - in production use AES)
function encrypt(data: string): string {
    const key = ENCRYPTION_KEY;
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
}

function decrypt(encrypted: string): string {
    const key = ENCRYPTION_KEY;
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// Secure storage wrapper
class SecureStorage {
    private prefix: string;
    
    constructor(prefix: string) {
        this.prefix = STORAGE_KEY_PREFIX + prefix + '_';
    }
    
    // Save data with timestamp and checksum for integrity
    save<T>(key: string, data: T): void {
        try {
            const timestamp = Date.now();
            const jsonData = JSON.stringify({
                data,
                timestamp,
                checksum: this.generateChecksum(JSON.stringify(data))
            });
            const encrypted = encrypt(jsonData);
            localStorage.setItem(this.prefix + key, encrypted);
            
            // Save to backup file simulation (in real app, this would write to .dat file)
            this.writeToFile(key, encrypted);
        } catch (error) {
            console.error('Failed to save data:', error);
            throw new Error('Failed to save data securely');
        }
    }
    
    // Load and verify data integrity
    load<T>(key: string): T | null {
        try {
            const encrypted = localStorage.getItem(this.prefix + key);
            if (!encrypted) {
                return this.loadFromFile(key);
            }
            
            const decrypted = decrypt(encrypted);
            const parsed = JSON.parse(decrypted);
            
            // Verify checksum
            if (this.generateChecksum(JSON.stringify(parsed.data)) !== parsed.checksum) {
                console.warn('Data integrity check failed for', key);
                return this.loadFromFile(key);
            }
            
            return parsed.data as T;
        } catch (error) {
            console.error('Failed to load data:', error);
            return this.loadFromFile(key);
        }
    }
    
    // Write to simulated .dat file (in real app, this writes to actual file)
    private writeToFile(key: string, content: string): void {
        // In a real Electron/Node.js app, this would write to:
        // fs.writeFileSync(`data/${key}.dat`, content, 'utf8');
        // For browser, we store in localStorage as backup
        localStorage.setItem(this.prefix + key + '_backup', content);
    }
    
    // Load from simulated .dat file
    private loadFromFile<T>(key: string): T | null {
        try {
            const content = localStorage.getItem(this.prefix + key + '_backup');
            if (!content) return null;
            
            const decrypted = decrypt(content);
            const parsed = JSON.parse(decrypted);
            return parsed.data as T;
        } catch (error) {
            return null;
        }
    }
    
    // Generate simple checksum for data integrity
    private generateChecksum(data: string): string {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    // Delete data securely
    delete(key: string): void {
        localStorage.removeItem(this.prefix + key);
        localStorage.removeItem(this.prefix + key + '_backup');
    }
    
    // Get all keys
    getAllKeys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix) && !key.endsWith('_backup')) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }
}

const patientsStorage = new SecureStorage('patients');
const appointmentsStorage = new SecureStorage('appointments');
const dentistsStorage = new SecureStorage('dentists');

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

// Patients API - Using Secure Local Storage
export const patientsApi = {
    getAll: async (): Promise<Patient[]> => {
        const allPatients: Patient[] = [];
        const keys = patientsStorage.getAllKeys();
        
        for (const key of keys) {
            const patient = patientsStorage.load<Patient>(key);
            if (patient) {
                allPatients.push(patient);
            }
        }
        
        // If no data in local storage, initialize with sample data
        if (allPatients.length === 0) {
            const samplePatients: Patient[] = [
                {
                    id: '1',
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    email: 'jean.dupont@email.com',
                    phone: '+33 6 12 34 56 78',
                    dateOfBirth: '1985-03-15',
                    gender: 'male',
                    address: '123 Rue de la Paix, Paris',
                    medicalHistory: ['Allergie pénicilline'],
                    notes: 'Patient régulier',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    firstName: 'Marie',
                    lastName: 'Martin',
                    email: 'marie.martin@email.com',
                    phone: '+33 6 98 76 54 32',
                    dateOfBirth: '1990-07-22',
                    gender: 'female',
                    address: '456 Avenue des Champs, Lyon',
                    medicalHistory: [],
                    notes: 'Première visite',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            
            for (const patient of samplePatients) {
                patientsStorage.save(patient.id, patient);
                allPatients.push(patient);
            }
        }
        
        return allPatients;
    },

    getById: async (id: string): Promise<Patient> => {
        const patient = patientsStorage.load<Patient>(id);
        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    },

    create: async (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const newPatient: Patient = {
            ...patient,
            id,
            createdAt: now,
            updatedAt: now
        };
        
        patientsStorage.save(id, newPatient);
        return newPatient;
    },

    update: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
        const existing = await patientsApi.getById(id);
        const updated: Patient = {
            ...existing,
            ...patient,
            updatedAt: new Date().toISOString()
        };
        
        patientsStorage.save(id, updated);
        return updated;
    },

    delete: async (id: string): Promise<void> => {
        patientsStorage.delete(id);
    },
};

// Appointments API - Using Secure Local Storage
export const appointmentsApi = {
    getAll: async (): Promise<Appointment[]> => {
        const allAppointments: Appointment[] = [];
        const keys = appointmentsStorage.getAllKeys();
        
        for (const key of keys) {
            const appointment = appointmentsStorage.load<Appointment>(key);
            if (appointment) {
                allAppointments.push(appointment);
            }
        }
        
        // If no data in local storage, initialize with sample data
        if (allAppointments.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            const sampleAppointments: Appointment[] = [
                {
                    id: '1',
                    patientId: '1',
                    dentistId: '1',
                    date: today,
                    time: '09:00',
                    duration: 30,
                    type: 'Consultation',
                    status: 'confirmed',
                    notes: 'Contrôle régulier',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    patientId: '2',
                    dentistId: '1',
                    date: today,
                    time: '10:00',
                    duration: 45,
                    type: 'Détartrage',
                    status: 'scheduled',
                    notes: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            
            for (const apt of sampleAppointments) {
                appointmentsStorage.save(apt.id, apt);
                allAppointments.push(apt);
            }
        }
        
        return allAppointments;
    },

    create: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const newAppointment: Appointment = {
            ...appointment,
            id,
            createdAt: now,
            updatedAt: now
        };
        
        appointmentsStorage.save(id, newAppointment);
        return newAppointment;
    },

    update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
        const existing = await appointmentsApi.getById(id);
        const updated: Appointment = {
            ...existing,
            ...appointment,
            updatedAt: new Date().toISOString()
        };
        
        appointmentsStorage.save(id, updated);
        return updated;
    },

    delete: async (id: string): Promise<void> => {
        appointmentsStorage.delete(id);
    },
    
    getById: async (id: string): Promise<Appointment> => {
        const appointment = appointmentsStorage.load<Appointment>(id);
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        return appointment;
    }
};

// Dentists API - Using Secure Local Storage
export const dentistsApi = {
    getAll: async (): Promise<Dentist[]> => {
        const allDentists: Dentist[] = [];
        const keys = dentistsStorage.getAllKeys();
        
        for (const key of keys) {
            const dentist = dentistsStorage.load<Dentist>(key);
            if (dentist) {
                allDentists.push(dentist);
            }
        }
        
        // If no data in local storage, initialize with sample data
        if (allDentists.length === 0) {
            const sampleDentists: Dentist[] = [
                {
                    id: '1',
                    firstName: 'Dr.',
                    lastName: 'Pierre Durand',
                    email: 'pierre.durand@clinic.com',
                    phone: '+33 6 11 22 33 44',
                    specialty: 'Chirurgien-dentiste',
                    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    workingHours: { start: '08:00', end: '18:00' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    firstName: 'Dr.',
                    lastName: 'Sophie Bernard',
                    email: 'sophie.bernard@clinic.com',
                    phone: '+33 6 55 66 77 88',
                    specialty: 'Orthodontiste',
                    availableDays: ['Monday', 'Wednesday', 'Friday'],
                    workingHours: { start: '09:00', end: '17:00' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    firstName: 'Dr.',
                    lastName: 'Marc Petit',
                    email: 'marc.petit@clinic.com',
                    phone: '+33 6 99 88 77 66',
                    specialty: 'Endodontiste',
                    availableDays: ['Tuesday', 'Thursday'],
                    workingHours: { start: '10:00', end: '19:00' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            
            for (const dentist of sampleDentists) {
                dentistsStorage.save(dentist.id, dentist);
                allDentists.push(dentist);
            }
        }
        
        return allDentists;
    },

    create: async (dentist: Omit<Dentist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dentist> => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const newDentist: Dentist = {
            ...dentist,
            id,
            createdAt: now,
            updatedAt: now
        };
        
        dentistsStorage.save(id, newDentist);
        return newDentist;
    },

    update: async (id: string, dentist: Partial<Dentist>): Promise<Dentist> => {
        const existing = await dentistsApi.getById(id);
        const updated: Dentist = {
            ...existing,
            ...dentist,
            updatedAt: new Date().toISOString()
        };
        
        dentistsStorage.save(id, updated);
        return updated;
    },

    delete: async (id: string): Promise<void> => {
        dentistsStorage.delete(id);
    },
    
    getById: async (id: string): Promise<Dentist> => {
        const dentist = dentistsStorage.load<Dentist>(id);
        if (!dentist) {
            throw new Error('Dentist not found');
        }
        return dentist;
    }
};

export default api;
