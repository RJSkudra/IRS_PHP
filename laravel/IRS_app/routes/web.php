<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/', [UserController::class, 'index'])->name('users.index');
Route::post('/store', [UserController::class, 'store'])->name('users.store');
Route::delete('/delete/{user}', [UserController::class, 'destroy'])->name('users.destroy'); // Change POST to DELETE
Route::post('/delete-all', [UserController::class, 'deleteAll'])->name('users.deleteAll');