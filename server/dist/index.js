import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, '..', 'secure_data');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dental-clinic-secret-key-2024-change-in-production';
// Middleware
app.use(cors());
app.use(express.json());
// Créer le dossier de données s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o755 });
}
// Fonction de chiffrement
const encrypt = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};
// Fonction de déchiffrement
const decrypt = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
// Chemins des fichiers
const getFilePath = (entity) => path.join(DATA_DIR, `${entity}.dat`);
// Initialiser les fichiers s'ils n'existent pas
const initializeFiles = () => {
    const entities = ['patients', 'appointments', 'dentists', 'users'];
    entities.forEach(entity => {
        const filePath = getFilePath(entity);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, encrypt([]), { mode: 0o600 });
        }
    });
};
initializeFiles();
// Middleware de sécurité pour vérifier les permissions du fichier
const checkFilePermissions = (filePath) => {
    try {
        const stats = fs.statSync(filePath);
        // Vérifier que seul le propriétaire peut lire/écrire
        if ((stats.mode & 0o777) !== 0o600) {
            console.warn(`Warning: File permissions issue for ${filePath}`);
        }
    }
    catch (error) {
        console.error(`Error checking file permissions: ${error}`);
    }
};
// API Routes
// Patients
app.get('/api/patients', (req, res) => {
    try {
        const filePath = getFilePath('patients');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const patients = decrypt(encryptedData);
        res.json({ success: true, data: patients });
    }
    catch (error) {
        console.error('Error reading patients:', error);
        res.status(500).json({ success: false, error: 'Failed to read patients' });
    }
});
app.post('/api/patients', (req, res) => {
    try {
        const filePath = getFilePath('patients');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const patients = decrypt(encryptedData);
        const newPatient = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        patients.push(newPatient);
        fs.writeFileSync(filePath, encrypt(patients), { mode: 0o600 });
        res.json({ success: true, data: newPatient });
    }
    catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ success: false, error: 'Failed to create patient' });
    }
});
app.put('/api/patients/:id', (req, res) => {
    try {
        const filePath = getFilePath('patients');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const patients = decrypt(encryptedData);
        const index = patients.findIndex((p) => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        patients[index] = {
            ...patients[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(filePath, encrypt(patients), { mode: 0o600 });
        res.json({ success: true, data: patients[index] });
    }
    catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ success: false, error: 'Failed to update patient' });
    }
});
app.delete('/api/patients/:id', (req, res) => {
    try {
        const filePath = getFilePath('patients');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const patients = decrypt(encryptedData);
        const filteredPatients = patients.filter((p) => p.id !== req.params.id);
        if (filteredPatients.length === patients.length) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        fs.writeFileSync(filePath, encrypt(filteredPatients), { mode: 0o600 });
        res.json({ success: true, message: 'Patient deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ success: false, error: 'Failed to delete patient' });
    }
});
// Appointments
app.get('/api/appointments', (req, res) => {
    try {
        const filePath = getFilePath('appointments');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const appointments = decrypt(encryptedData);
        res.json({ success: true, data: appointments });
    }
    catch (error) {
        console.error('Error reading appointments:', error);
        res.status(500).json({ success: false, error: 'Failed to read appointments' });
    }
});
app.post('/api/appointments', (req, res) => {
    try {
        const filePath = getFilePath('appointments');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const appointments = decrypt(encryptedData);
        const newAppointment = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        appointments.push(newAppointment);
        fs.writeFileSync(filePath, encrypt(appointments), { mode: 0o600 });
        res.json({ success: true, data: newAppointment });
    }
    catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ success: false, error: 'Failed to create appointment' });
    }
});
app.put('/api/appointments/:id', (req, res) => {
    try {
        const filePath = getFilePath('appointments');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const appointments = decrypt(encryptedData);
        const index = appointments.findIndex((a) => a.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }
        appointments[index] = {
            ...appointments[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(filePath, encrypt(appointments), { mode: 0o600 });
        res.json({ success: true, data: appointments[index] });
    }
    catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ success: false, error: 'Failed to update appointment' });
    }
});
app.delete('/api/appointments/:id', (req, res) => {
    try {
        const filePath = getFilePath('appointments');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const appointments = decrypt(encryptedData);
        const filteredAppointments = appointments.filter((a) => a.id !== req.params.id);
        if (filteredAppointments.length === appointments.length) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }
        fs.writeFileSync(filePath, encrypt(filteredAppointments), { mode: 0o600 });
        res.json({ success: true, message: 'Appointment deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ success: false, error: 'Failed to delete appointment' });
    }
});
// Dentists
app.get('/api/dentists', (req, res) => {
    try {
        const filePath = getFilePath('dentists');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const dentists = decrypt(encryptedData);
        res.json({ success: true, data: dentists });
    }
    catch (error) {
        console.error('Error reading dentists:', error);
        res.status(500).json({ success: false, error: 'Failed to read dentists' });
    }
});
app.post('/api/dentists', (req, res) => {
    try {
        const filePath = getFilePath('dentists');
        checkFilePermissions(filePath);
        const encryptedData = fs.readFileSync(filePath, 'utf-8');
        const dentists = decrypt(encryptedData);
        const newDentist = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        dentists.push(newDentist);
        fs.writeFileSync(filePath, encrypt(dentists), { mode: 0o600 });
        res.json({ success: true, data: newDentist });
    }
    catch (error) {
        console.error('Error creating dentist:', error);
        res.status(500).json({ success: false, error: 'Failed to create dentist' });
    }
});
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        secure: true,
        encryption: 'AES-256'
    });
});
// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🔒 Secure Dental Clinic Server running on port ${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🔐 Encryption: AES-256`);
    console.log(`🛡️  File permissions: 600 (owner read/write only)`);
});
export default app;
