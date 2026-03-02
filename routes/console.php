<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\Patient;
use App\Models\Archive;
use Illuminate\Support\Facades\Schedule;

Schedule::command('records:cleanup')->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
Artisan::command('records:cleanup', function () {
    $this->info('Starting Inactive Records Cleanup...');

    // 1. RULE: Inactive for 5 years -> Archive
    $fiveYearsAgo = now()->subYears(5);
    
    // Find patients whose last activity (admission, visit, or update) was > 5 years ago
    $inactivePatients = Patient::whereDoesHave('admissions', function($q) use ($fiveYearsAgo) {
        $q->where('admission_date', '>', $fiveYearsAgo);
    })->whereDoesHave('visits', function($q) use ($fiveYearsAgo) {
        $q->where('visit_date', '>', $fiveYearsAgo);
    })->where('updated_at', '<', $fiveYearsAgo)->get();

    foreach ($inactivePatients as $patient) {
        $patient->archive('System: Automatic archive due to 5 years of inactivity.');
        $this->comment("Archived Patient: {$patient->full_name}");
    }

    // 2. RULE: In Archive for 5 years (10 years total) -> Permanent Delete
    $toDelete = Archive::where('scheduled_deletion_at', '<=', now())->get();
    
    foreach ($toDelete as $record) {
        $record->delete();
        $this->comment("Permanently Deleted Archive ID: {$record->id}");
    }

    $this->info('Cleanup complete.');
})->purpose('Archive inactive patients (5yr) and delete old archives (10yr total)');
