import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DoctorDashboard() {
    return (
        <AuthenticatedLayout header="Doctor / Dashboard">
            <Head title="Doctor Dashboard" />
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium">Assigned Patients</h3>
                <p className="mt-2 text-gray-600">You have no scheduled consultations today.</p>
            </div>
        </AuthenticatedLayout>
    );
}