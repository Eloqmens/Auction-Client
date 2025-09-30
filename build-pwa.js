#!/usr/bin/env node

/**
 * PWA Build Script
 * Автоматизированная сборка и оптимизация PWA
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем сборку PWA...\n');

try {
  // 1. Очистка предыдущей сборки
  console.log('📦 Очистка предыдущей сборки...');
  if (fs.existsSync('dist')) {
    execSync('rmdir /s /q dist', { stdio: 'inherit', shell: true });
  }

  // 2. Сборка Angular приложения
  console.log('🔨 Сборка Angular приложения...');
  execSync('ng build --configuration production', { stdio: 'inherit' });

  // 3. Проверка критических файлов PWA
  console.log('🔍 Проверка PWA файлов...');
  const distPath = path.join(__dirname, 'dist', 'auction-client', 'browser');
  const requiredFiles = [
    'manifest.json',
    'sw.js',
    'offline.html',
    'robots.txt'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ Критический файл отсутствует: ${file}`);
    }
    console.log(`✅ ${file} найден`);
  });

  // 4. Проверка иконок
  const iconsPath = path.join(distPath, 'icons');
  if (fs.existsSync(iconsPath)) {
    console.log('✅ Папка иконок найдена');
  } else {
    console.log('⚠️  Папка иконок не найдена');
  }

  // 5. Создание дополнительных мета файлов
  console.log('📝 Создание дополнительных мета файлов...');
  
  // Создание .htaccess для Apache
  const htaccessContent = `# PWA Configuration
RewriteEngine On

# Service Worker
<Files "sw.js">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Files>

# Manifest
<Files "manifest.json">
    Header set Content-Type "application/manifest+json"
</Files>

# Fallback для SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>`;

  fs.writeFileSync(path.join(distPath, '.htaccess'), htaccessContent);
  console.log('✅ .htaccess создан');

  // Создание _redirects для Netlify
  const redirectsContent = `# SPA Fallback
/*    /index.html   200

# Service Worker
/sw.js    /sw.js    200
  Cache-Control: no-cache`;

  fs.writeFileSync(path.join(distPath, '_redirects'), redirectsContent);
  console.log('✅ _redirects создан');

  // 6. Анализ размера бандла
  console.log('\n📊 Анализ размера файлов:');
  const files = fs.readdirSync(distPath);
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile() && file.endsWith('.js')) {
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ${file}: ${sizeKB} KB`);
    }
  });

  console.log('\n🎉 PWA сборка завершена успешно!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Протестируйте приложение локально:');
  console.log('   http-server dist/auction-client/browser -p 4200');
  console.log('2. Проверьте PWA в Chrome DevTools');
  console.log('3. Запустите Lighthouse аудит');
  console.log('4. Разверните на HTTPS сервере\n');

} catch (error) {
  console.error('❌ Ошибка сборки:', error.message);
  process.exit(1);
}
