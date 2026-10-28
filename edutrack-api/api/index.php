<?php

// توجيه مجلدات الكاش واللوجات إلى /tmp المسموح بالكتابة عليه في Vercel
$_ENV['APP_SERVICES_CACHE'] = '/tmp/services.php';
$_ENV['APP_PACKAGES_CACHE'] = '/tmp/packages.php';
$_ENV['APP_CONFIG_CACHE'] = '/tmp/config.php';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';

// تحويل اللوجات إلى stderr لتجنب الكتابة في مسارات للقراءة فقط
$_ENV['LOG_CHANNEL'] = 'stderr';

// حل مشكلة الجلسات لو كانت مخزنة في قاعدة البيانات أو الملفات
$_ENV['SESSION_DRIVER'] = 'cookie';

require __DIR__ . '/../public/index.php';