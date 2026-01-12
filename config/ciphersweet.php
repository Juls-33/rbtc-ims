<?php

return [
    /*
     * This controls which cryptographic backend will be used by CipherSweet.
     */
    'backend' => \ParagonIE\CipherSweet\Backend\ModernCrypto::class,

    /*
     * The encryption key used by CipherSweet.
     */
    'key' => env('CIPHERSWEET_KEY'),

    /*
     * Whether to permit empty values to be stored in encrypted fields.
     */
    //'permit_empty' => env('CIPHERSWEET_PERMIT_EMPTY', false),
    'permit_empty' => false,
];