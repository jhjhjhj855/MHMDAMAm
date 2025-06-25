const CACHE_NAME = 'diabetes-tracker-v1'; // اسم ذاكرة التخزين المؤقت - قم بتغييره عند تحديث التطبيق
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js', // تأكد من أن هذا يشير إلى ملف script.js الصحيح
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/iraq-diabetes-logo.png', // تأكد من إضافة شعار التطبيق الجديد
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css', // Font Awesome CSS
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap' // Google Fonts
];

// تثبيت Service Worker وتخزين الملفات مؤقتًا
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache for Diabetes Tracker App');
        return cache.addAll(urlsToCache);
      })
  );
});

// جلب الموارد من ذاكرة التخزين المؤقت أو من الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا كان المورد موجودًا في ذاكرة التخزين المؤقت، فارجعه
        if (response) {
          return response;
        }
        // وإلا، حاول جلبه من الشبكة
        return fetch(event.request).catch(() => {
            // في حالة عدم الاتصال بالإنترنت وعدم وجود المورد في الكاش (للموارد غير المخزنة مسبقا)
            // يمكنك هنا عرض صفحة عدم الاتصال بالإنترنت إذا أردت
            console.log('Offline: Failed to fetch ' + event.request.url);
        });
      })
  );
});

// تفعيل Service Worker وتنظيف ذاكرات التخزين المؤقت القديمة
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache: ' + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});