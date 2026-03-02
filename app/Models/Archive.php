<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    protected $fillable = [
        'archivable_type', 
        'archivable_id', 
        'data', 
        'reason', 
        'archived_by', 
        'archived_at', 
        'scheduled_deletion_at'
    ];

    protected $casts = [
        'data' => 'array',
        'archived_at' => 'datetime',
        'scheduled_deletion_at' => 'datetime',
    ];

    /**
     * Relationship to the staff member who performed the archive.
     */
    public function archiver()
    {
        return $this->belongsTo(Staff::class, 'archived_by');
    }

    /**
     * Helper to get the descriptive name of the model (e.g., "Patient" or "Medicine")
     */
    public function getModelLabelAttribute()
    {
        $class = explode('\\', $this->archivable_type);
        return end($class);
    }
}