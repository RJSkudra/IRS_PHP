<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EntryController;

Route::get('/', [UserController::class, 'index'])->name('users.index');
Route::post('/store', [UserController::class, 'store'])->name('users.store');
Route::delete('/delete/{user}', [UserController::class, 'destroy'])->name('users.destroy');
Route::post('/delete-all', [UserController::class, 'deleteAll'])->name('users.deleteAll');
Route::get('/api/entries', [UserController::class, 'getEntries']);
Route::post('api/update-entries', [UserController::class, 'updateEntries']);
Route::get('/latest-entry-id', function () {
    $latestEntry = \App\Models\User::latest()->first();
    return response()->json(['latestId' => $latestEntry ? $latestEntry->id : null]);
});

Route::get('/validation-messages', function () {
    return response()->json([
        'custom' => [
            'name' => [
                'required' => __('validation.custom.name.required'),
                'regex' => __('validation.custom.name.regex'),
                'length' => __('validation.custom.name.length'),
            ],
            'surname' => [
                'required' => __('validation.custom.surname.required'),
                'regex' => __('validation.custom.surname.regex'),
                'length' => __('validation.custom.surname.length'),
            ],
            'age' => [
                'required' => __('validation.custom.age.required'),
                'integer' => __('validation.custom.age.integer'),
                'min' => __('validation.custom.age.min'),
                'max' => __('validation.custom.age.max'),
            ],
            'phone' => [
                'required' => __('validation.custom.phone.required'),
                'regex' => __('validation.custom.phone.regex'),
            ],
            'address' => [
                'required' => __('validation.custom.address.required'),
                'regex' => __('validation.custom.address.regex'),
            ],
        ]
    ]);
});