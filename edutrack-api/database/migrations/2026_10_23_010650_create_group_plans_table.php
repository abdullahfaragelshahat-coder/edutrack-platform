<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade'); // ربط الخطة بالمجموعة
            $table->string('title'); // عنوان الخطة أو الأسبوع (مثلاً: خططة الأسبوع الأول)
            $table->text('content'); // تفاصيل الخطة أو الدروس المقررة
            $table->string('target_date')->nullable5()->nullable(); // التاريخ أو الأسبوع المستهدف
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_plans');
    }
};