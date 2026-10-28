<?php

// توجيه مجلدات الكاش واللوجات إلى /tmp المسموح بالكتابة عليه في Vercel
$_ENV['APP_SERVICES_CACHE'] = '/tmp/services.php';
$_ENV['APP_PACKAGES_CACHE'] = '/tmp/packages.php';
$_ENV['APP_CONFIG_CACHE'] = '/tmp/config.php';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';

// توجيه مسار اللوجات إلى مجلد مؤقت مسموح بالكتابة فيه
$_ENV['LOG_CHANNEL'] = 'stderr';

require __DIR__ . '/../public/index.php';