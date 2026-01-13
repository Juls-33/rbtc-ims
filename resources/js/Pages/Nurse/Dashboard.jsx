import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function NurseDashboard() {
    return (
        <AuthenticatedLayout header="Nurse Dashboard">
            <Head title="Nurse Dashboard" />
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium">Quick Vitals Check</h3>
                <p className="mt-2 text-gray-600">Select a patient to record vitals.</p>
            </div>
        </AuthenticatedLayout>
    );
}