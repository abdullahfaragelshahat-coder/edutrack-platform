<?php

// توجيه مسارات الكاش واللوجات إلى /tmp المسموح بالكتابة عليه في Vercel
$_ENV['APP_SERVICES_CACHE'] = '/tmp/services.php';
$_ENV['APP_PACKAGES_CACHE'] = '/tmp/packages.php';
$_ENV['APP_CONFIG_CACHE'] = '/tmp/config.php';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';

// تحويل اللوجات إلى stderr لمنع الكتابة في ملفات Read-Only
$_ENV['LOG_CHANNEL'] = 'stderr';

// ضبط قاعدة البيانات لتعمل عبر SQLite في مجلد /tmp المؤقت (أو غيّرها حسب رغبتك)
$_ENV['DB_CONNECTION'] = 'sqlite';
$_ENV['DB_DATABASE'] = '/tmp/edutrack.sqlite';

// إذا لم يكن ملف قاعدة البيانات موجوداً في /tmp، قم بإنشائه تلقائياً
if (!file_exists('/tmp/edutrack.sqlite')) {
    touch('/tmp/edutrack.sqlite');
}

// استخدام الـ cookie لجلسات المستخدمين لتجنب الحاجة لجداول الجلسات المعطلة
$_ENV['SESSION_DRIVER'] = 'cookie';

require __DIR__ . '/../public/index.php';