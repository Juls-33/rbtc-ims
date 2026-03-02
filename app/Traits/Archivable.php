<?php

namespace App\Traits;

use App\Models\Archive;
use Illuminate\Support\Facades\DB;

trait Archivable
{
    /**
     * Move the current model instance to the archives table.
     */
    public function archive($reason = null, $staffId = null)
    {
        return DB::transaction(function () use ($reason, $staffId) {
            // 1. Create the Archive snapshot
            Archive::create([
                'archivable_type' => get_class($this),
                'archivable_id'   => $this->id,
                'data'            => $this->toArray(), // Use toArray() for JSON-friendly format
                'reason'          => $reason,
                'archived_by'     => $staffId,
                'archived_at'     => now(),
                'scheduled_deletion_at' => now()->addYears(5), // Deletion 5 years after archive
            ]);

            // 2. Perform soft-delete behavior by removing from the main table
            return $this->delete();
        });
    }
}