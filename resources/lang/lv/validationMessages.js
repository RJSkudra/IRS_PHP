const validationMessages = {
    name: {
        required: 'Vārds ir obligāts',
        regex: 'Vārds satur nederīgus simbolus.',
        length: 'Vārdam jāsatur 2 līdz 50 simboliem.'
    },
    surname: {
        required: 'Uzvārda lauks ir obligāts.',
        regex: 'Uzvārds satur nederīgus simbolus.',
        length: 'Uzvārdam jāsatur 2 līdz 50 simboliem.'
    },
    age: {
        required: 'Vecuma lauks ir obligāts.',
        integer: 'Vecumam jābūt veselam skaitlim.',
        min: 'Vecumam jābūt pozitīvam veselam skaitlim.',
        max: 'Ievadītajai personai jābūt organiski dzīvai, nevis kaut kādam kiborgam...'
    },
    phone: {
        required: 'Telefona numura lauks ir obligāts.',
        regex: 'Telefona numuram jāsatur 8 cipari.'
    },
    address: {
        required: 'Adreses lauks ir obligāts.',
        regex: 'Adrese satur nederīgus simbolus.'
    },
    success: {
        created: 'Ieraksts veiksmīgi pievienots',
        deleted: 'Ieraksts veiksmīgi dzēsts',
        all_deleted: 'Visi ieraksti veiksmīgi dzēsti'
    },
    info: {
        submittingForm: 'Nosūta ierakstu...'
    }
};

export default validationMessages;