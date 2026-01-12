<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>RBTC-IMS Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex">

    <aside class="w-64 bg-indigo-900 min-h-screen text-white p-6">
        <div class="mb-8">
            <h1 class="text-xl font-bold">Reality Based Therapeutic Community</h1>
        </div>
        <nav class="space-y-4">
            <a href="#" class="block py-2 px-4 bg-indigo-700 rounded">Dashboard</a>
            <a href="#" class="block py-2 px-4 hover:bg-indigo-700">Medicine Inventory</a>
            <a href="#" class="block py-2 px-4 hover:bg-indigo-700">Patient Management</a>
            <a href="#" class="block py-2 px-4 hover:bg-indigo-700">Staff Management</a>
        </nav>
    </aside>

    <main class="flex-1 p-8">
        <div class="grid grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow text-center">
                <h3 class="text-3xl font-bold">{{ $criticalStock }}</h3>
                <p class="text-gray-500">Critical Stock</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow text-center">
                <h3 class="text-3xl font-bold">{{ $expiringSoon }}</h3>
                <p class="text-gray-500">Expiring Soon</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow text-center">
                <h3 class="text-3xl font-bold">{{ $admittedCount }}</h3>
                <p class="text-gray-500">Admitted Patients</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow text-center">
                <h3 class="text-3xl font-bold">{{ $billsAlert }}</h3>
                <p class="text-gray-500">Bills Alert</p>
            </div>
            
        </div>

        <div class="grid grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="font-bold border-b pb-2 mb-4">Doctors</h2>
                <ul>
                    @foreach($doctors as $doctor)
                        <li>• Dr. {{ $doctor->first_name }} {{ $doctor->last_name }}</li>
                    @endforeach
                </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="font-bold border-b pb-2 mb-4">Nurses</h2>
                <ul>
                    @foreach($nurses as $nurse)
                        <li>• {{ $nurse->first_name }} {{ $nurse->last_name }}</li>
                    @endforeach
                </ul>
            </div>
        </div>
    </main>
</body>
</html>