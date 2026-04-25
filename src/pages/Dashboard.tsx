import React from 'react';
import { usePatients } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';

export function Dashboard() {
    const { patients } = usePatients();
    const { appointments } = useAppointments();

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    const pendingAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed');

    const stats = [
        { name: 'Total Patients', value: patients.length, icon: '👥', color: 'bg-blue-500' },
        { name: 'Rendez-vous aujourd\'hui', value: todayAppointments.length, icon: '📅', color: 'bg-green-500' },
        { name: 'Rendez-vous en attente', value: pendingAppointments.length, icon: '⏳', color: 'bg-yellow-500' },
        { name: 'Dentistes', value: 3, icon: '🦷', color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className={`${stat.color} rounded-full p-3 text-white text-2xl`}>
                                {stat.icon}
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendez-vous du jour</h2>
                    {todayAppointments.length === 0 ? (
                        <p className="text-gray-500">Aucun rendez-vous prévu aujourd'hui</p>
                    ) : (
                        <ul className="space-y-3">
                            {todayAppointments.map((apt) => (
                                <li key={apt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                    <div>
                                        <p className="font-medium">{apt.time} - {apt.type}</p>
                                        <p className="text-sm text-gray-500">Patient ID: {apt.patientId}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        apt.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {apt.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Activités récentes</h2>
                    <ul className="space-y-3">
                        {patients.slice(-5).reverse().map((patient) => (
                            <li key={patient.id} className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <p className="text-sm text-gray-600">
                                    Nouveau patient: <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
