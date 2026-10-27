<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title'); // عنوان الدرس أو المحاضرة
            $table->string('unit')->nullable(); // اسم أو رقم الوحدة (مثلاً: الوحدة الأولى)
            $table->string('file_path')->nullable5()->nullable(); // مسار ملف الـ PDF
            $table->string('video_url')->nullable(); // رابط فيديو المحاضرة (يوتيوب أو غيره)
            $table->text('description')->nullable(); // وصف مختصر للدرس
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};