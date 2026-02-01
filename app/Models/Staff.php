<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Spatie\LaravelCipherSweet\Concerns\UsesCipherSweet;
// use Spatie\LaravelCipherSweet\Contracts\CipherSweetEncrypted;
// use ParagonIE\CipherSweet\EncryptedRow;
// use ParagonIE\CipherSweet\BlindIndex;

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
        'status', // Added
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
