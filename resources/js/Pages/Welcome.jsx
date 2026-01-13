import { Link, Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
                        RBTC Therapeutic Community
                    </h1>
                    <p className="text-lg text-slate-600 mb-8">
                        Information Management System for secure patient records, 
                        inventory tracking, and clinical workflows.
                    </p>
                    <Link
                        href={route('login')}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Staff Login
                    </Link>
                </div>
            </div>
        </>
    );
}   