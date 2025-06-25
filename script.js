const STORAGE_KEY = 'diabetes_records'; // المفتاح الذي سنستخدمه في Local Storage

// عند تحميل الصفحة، قم بعرض السجلات الموجودة
document.addEventListener('DOMContentLoaded', () => {
    // تعيين التاريخ والوقت الحاليين كقيم افتراضية
    const today = new Date();
    document.getElementById('entryDate').valueAsDate = today;
    // تنسيق الوقت ليكون HH:MM
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    document.getElementById('entryTime').value = `${hours}:${minutes}`;

    displayRecords();
});

// دالة لحفظ الإدخالات
function saveEntry() {
    // جلب البيانات من حقول الإدخال
    const entryDate = document.getElementById('entryDate').value;
    const entryTime = document.getElementById('entryTime').value;

    // التحقق من أن التاريخ والوقت قد تم إدخالهما
    if (!entryDate || !entryTime) {
        showStatusMessage('الرجاء إدخال التاريخ والوقت.', 'error');
        return;
    }

    const glucoseFasting = document.getElementById('glucoseFasting').value;
    const glucosePreBreakfast = document.getElementById('glucosePreBreakfast').value;
    const glucosePostBreakfast = document.getElementById('glucosePostBreakfast').value;
    const glucosePreLunch = document.getElementById('glucosePreLunch').value;
    const glucosePostLunch = document.getElementById('glucosePostLunch').value;
    const glucosePreDinner = document.getElementById('glucosePreDinner').value;
    const glucosePostDinner = document.getElementById('glucosePostDinner').value;
    const glucoseBedtime = document.getElementById('glucoseBedtime').value;
    const glucoseMidnight = document.getElementById('glucoseMidnight').value;

    const carbAmount = document.getElementById('carbAmount').value;
    const insulinRapid = document.getElementById('insulinRapid').value;
    // التأكد من أن أحد الخيارات قد تم تحديده، وإلا فضع قيمة افتراضية
    const insulinRapidPurpose = document.querySelector('input[name="insulinRapidPurpose"]:checked')?.value || 'غير محدد';
    const insulinSlow = document.getElementById('insulinSlow').value;
    const carbRatio = document.getElementById('carbRatio').value;

    // إنشاء كائن (object) للبيانات المدخلة
    const newRecord = {
        id: Date.now(), // معرّف فريد لكل تسجيل (للسماح بالحذف لاحقاً)
        date: entryDate,
        time: entryTime,
        glucose: {
            fasting: glucoseFasting,
            preBreakfast: glucosePreBreakfast,
            postBreakfast: glucosePostBreakfast,
            preLunch: glucosePreLunch,
            postLunch: glucosePostLunch,
            preDinner: glucosePreDinner,
            postDinner: glucosePostDinner,
            bedtime: glucoseBedtime,
            midnight: glucoseMidnight
        },
        carbs: carbAmount,
        insulin: {
            rapid: insulinRapid,
            rapidPurpose: insulinRapidPurpose,
            slow: insulinSlow
        },
        carbRatio: carbRatio,
        timestamp: new Date().toISOString() // وقت حفظ السجل بالضبط
    };

    // جلب السجلات الموجودة من Local Storage
    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // إضافة السجل الجديد إلى القائمة
    records.push(newRecord);
    
    // حفظ القائمة المحدثة مرة أخرى في Local Storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

    showStatusMessage('تم حفظ التسجيل بنجاح!', 'success');
    clearInputFields(); // مسح الحقول بعد الحفظ
    displayRecords(); // تحديث عرض السجلات
}

// دالة لعرض السجلات المحفوظة
function displayRecords() {
    const recordsListDiv = document.getElementById('recordsList');
    recordsListDiv.innerHTML = ''; // مسح أي سجلات معروضة حالياً

    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    const filterDate = document.getElementById('filterDate').value;
    if (filterDate) {
        records = records.filter(record => record.date === filterDate);
    }

    if (records.length === 0) {
        recordsListDiv.innerHTML = '<p style="text-align: center; color: #888;">لا توجد سجلات لعرضها بعد أو لا توجد سجلات لهذا التاريخ.</p>';
        return;
    }

    // فرز السجلات من الأحدث إلى الأقدم
    records.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

    records.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.classList.add('record-item');

        let glucoseDetails = '';
        for (const key in record.glucose) {
            if (record.glucose[key]) {
                const label = {
                    fasting: 'صائم',
                    preBreakfast: 'قبل الفطور',
                    postBreakfast: 'بعد الفطور بساعتين',
                    preLunch: 'قبل الغداء',
                    postLunch: 'بعد الغداء بساعتين',
                    preDinner: 'قبل العشاء',
                    postDinner: 'بعد العشاء بساعتين',
                    bedtime: 'قبل النوم',
                    midnight: 'منتصف الليل'
                }[key];
                glucoseDetails += `<li><strong>${label}:</strong> ${record.glucose[key]} ملغم/دل</li>`;
            }
        }

        recordItem.innerHTML = `
            <h4><i class="fas fa-calendar-alt"></i> ${record.date} <i class="fas fa-clock"></i> ${record.time}</h4>
            <button class="delete-btn" onclick="deleteRecord(${record.id})"><i class="fas fa-trash-alt"></i> حذف</button>
            <div class="record-details">
                <p><strong>🍚 الكاربوهيدرات:</strong> ${record.carbs || 'غير مدخل'} غرام</p>
                <p><strong>⚡ أنسولين سريع:</strong> ${record.insulin.rapid || 'غير مدخل'} وحدة (${record.insulin.rapidPurpose === 'meal' ? 'وجبة' : 'تصحيح/إضافي'})</p>
                <p><strong>🐢 أنسولين بطيء:</strong> ${record.insulin.slow || 'غير مدخل'} وحدة</p>
                <p><strong>📊 معامل الكارب:</strong> ${record.carbRatio || 'غير مدخل'}</p>
                <h5><i class="fas fa-sugar-cube"></i> قياسات السكر:</h5>
                <ul>${glucoseDetails || '<li>لا توجد قياسات سكر مدخلة</li>'}</ul>
            </div>
        `;
        recordsListDiv.appendChild(recordItem);
    });
}

// دالة لمسح جميع السجلات
function clearAllRecords() {
    if (confirm('هل أنت متأكد من رغبتك في مسح جميع سجلات السكري؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        localStorage.removeItem(STORAGE_KEY);
        displayRecords(); // تحديث العرض
        showStatusMessage('تم مسح جميع السجلات بنجاح!', 'success');
    }
}

// دالة لحذف سجل معين
function deleteRecord(idToDelete) {
    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    records = records.filter(record => record.id !== idToDelete);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    displayRecords(); // تحديث العرض
    showStatusMessage('تم حذف السجل بنجاح!', 'success');
}

// دالة لعرض رسائل الحالة
function showStatusMessage(message, type) {
    const saveStatus = document.getElementById('saveStatus');
    saveStatus.textContent = message;
    saveStatus.style.display = 'block';
    if (type === 'success') {
        saveStatus.style.backgroundColor = '#d4edda';
        saveStatus.style.color = '#155724';
    } else {
        saveStatus.style.backgroundColor = '#f8d7da';
        saveStatus.style.color = '#721c24';
    }
    setTimeout(() => {
        saveStatus.style.display = 'none';
    }, 5000);
}

// دالة لمسح حقول الإدخال بعد الحفظ
function clearInputFields() {
    // لا يتم مسح التاريخ والوقت تلقائياً لتسهيل إدخالات نفس اليوم
    // document.getElementById('entryDate').value = '';
    // document.getElementById('entryTime').value = '';
    document.getElementById('glucoseFasting').value = '';
    document.getElementById('glucosePreBreakfast').value = '';
    document.getElementById('glucosePostBreakfast').value = '';
    document.getElementById('glucosePreLunch').value = '';
    document.getElementById('glucosePostLunch').value = '';
    document.getElementById('glucosePreDinner').value = '';
    document.getElementById('glucosePostDinner').value = '';
    document.getElementById('glucoseBedtime').value = '';
    document.getElementById('glucoseMidnight').value = '';
    document.getElementById('carbAmount').value = '';
    document.getElementById('insulinRapid').value = '';
    document.getElementById('insulinSlow').value = '';
    document.getElementById('carbRatio').value = '';
    document.getElementById('insulinRapidMeal').checked = true; // إعادة تعيين الخيار الافتراضي
}