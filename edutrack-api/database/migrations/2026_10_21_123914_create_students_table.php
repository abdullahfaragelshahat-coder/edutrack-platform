<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('students', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->nullable()->unique();
        $table->string('phone', 30)->nullable();
        $table->string('grade')->nullable();
        $table->timestamps();
       $table->unsignedBigInteger('group_id')->nullable();
       $table->string('parent_phone')->nullable();
       $table->string('pin_code')->nullable(); // الرقم السري للطالب
// وعدّل الـ Foreign Key لو حابب تخليه بعد إنشاء الجداول، أو اضبط اسم ملف الـ groups ليكون في يناير مثلاً عشان يشتغل الأول.
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
