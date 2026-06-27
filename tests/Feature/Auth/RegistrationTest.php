<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('registration screen is disabled', function () {
    $response = $this->get('/register');

    $response->assertNotFound();
});

test('public users cannot register', function () {
    $response = $this->post('/register', [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'phone_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertGuest();
    $response->assertNotFound();
});
