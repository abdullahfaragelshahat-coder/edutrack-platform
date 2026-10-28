<?php

// توجيه مسارات الكاش والتخزين المؤقت إلى /tmp المسموح بالكتابة عليه في Vercel
$_ENV['APP_SERVICES_CACHE'] = '/tmp/services.php';
$_ENV['APP_PACKAGES_CACHE'] = '/tmp/packages.php';
$_ENV['APP_CONFIG_CACHE'] = '/tmp/config.php';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';

// استدعاء ملف الـ index الأساسي للارافيل
require __DIR__ . '/../public/index.php';