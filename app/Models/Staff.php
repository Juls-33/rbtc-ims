<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\LaravelCipherSweet\Concerns\UsesCipherSweet;
use Spatie\LaravelCipherSweet\Contracts\CipherSweetEncrypted;
use ParagonIE\CipherSweet\EncryptedRow;
use ParagonIE\CipherSweet\BlindIndex;

class Staff extends Authenticatable implements CipherSweetEncrypted

{
    use HasFactory, Notifiable, UsesCipherSweet;

    protected $table = 'staff';

    
    protected $fillable = [
        'first_name', 'last_name','first_name_index', 'last_name_index', 'email', 'contact_no', 'address', 'gender', 'role', 'password',
    ];

    public static function configureCipherSweet(EncryptedRow $row): void
{
    // Ensure the first argument is the SOURCE and the BlindIndex name matches the COLUMN
    $row->addField('first_name')
        ->addBlindIndex('first_name', new BlindIndex('first_name_index'));

    $row->addField('last_name')
        ->addBlindIndex('last_name', new BlindIndex('last_name_index'));
}
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
