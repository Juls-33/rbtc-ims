<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Staff extends Authenticatable ///implements CipherSweetEncrypted

{
    use HasFactory, Notifiable;

    protected $table = 'staff';

    protected $fillable = [
        'staff_id',
        'first_name',
        'last_name',
        'email',
        'contact_no',
        'address',
        'gender',
        'role',
        'status',
        'must_change_password',
        'password',
        'dismissed_notifications',
        'reset_requested',
        'must_change_password',
        'password_changed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'dismissed_notifications' => 'array',
            'must_change_password' => 'boolean',
            'password_changed_at' => 'datetime',
        ];
    }
    protected $casts = [
        'dismissed_notifications' => 'array',
    ];
}
