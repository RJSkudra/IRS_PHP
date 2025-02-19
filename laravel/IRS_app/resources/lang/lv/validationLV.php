<?php

return [
    'required' => ':attribute lauks ir obligāts.',
    'integer' => ':attribute jābūt veselam skaitlim.',
    'regex' => ':attribute satur nederīgus simbolus.',
    'custom' => [
        'name' => [
            'required' => 'Vārda lauks ir obligāts.',
            'regex' => 'Vārds satur nederīgus simbolus.',
        ],
        'surname' => [
            'required' => 'Uzvārda lauks ir obligāts.',
            'regex' => 'Uzvārds satur nederīgus simbolus.',
        ],
        'age' => [
            'required' => 'Vecuma lauks ir obligāts.',
            'integer' => 'Vecumam jābūt veselam skaitlim.',
        ],
        'phone' => [
            'required' => 'Telefona numura lauks ir obligāts.',
            'regex' => 'Telefona numuram jāsatur 8 cipari.',
        ],
        'address' => [
            'required' => 'Adreses lauks ir obligāts.',
            'regex' => 'Adrese satur nederīgus simbolus.',
        ],
        'success' => [
            'created' => 'Ieraksts veiksmīgi pievienots',
            'deleted' => 'Ieraksts veiksmīgi dzēsts',
            'all_deleted' => 'Visi ieraksti veiksmīgi dzēsti'
        ],
    ],
];
