const validationMessages = {
    name: {
        required: 'Vārds ir obligāts',
        regex: 'Vārdam jābūt tikai burtiem un atstarpēm',
        length: 'Vārdam jābūt no 2 līdz 50 rakstzīmēm'
    },
    surname: {
        required: 'Uzvārds ir obligāts',
        regex: 'Uzvārdam jābūt tikai burtiem un atstarpēm',
        length: 'Uzvārdam jābūt no 2 līdz 50 rakstzīmēm'
    },
    age: {
        required: 'Vecums ir obligāts',
        integer: 'Vecumam jābūt skaitlim',
        min: 'Vecumam jābūt vismaz 0',
        max: 'Vecumam jābūt mazākam par 200'
    },
    phone: {
        required: 'Telefona numurs ir obligāts',
        regex: 'Telefona numuram jābūt 8 cipariem'
    },
    address: {
        required: 'Adrese ir obligāta',
        regex: 'Adresei jābūt burtiem un cipariem'
    }
};

export default validationMessages;