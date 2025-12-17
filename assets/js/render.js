/**
 * assets/js/render.js
 * ระบบจัดการ Component และควบคุมลำดับการแสดงผล (Rendering Engine)
 * สำหรับเว็บไซต์ ช.สหชัย เกี๊ยวปูหมูแดง จ.ตาก
 */

/**
 * ฟังก์ชันโหลดไฟล์ HTML เข้าไปใน Placeholder
 * @param {string} id - ID ของ Element เป้าหมายใน index.html
 * @param {string} file - ชื่อไฟล์ .html ในโฟลเดอร์ components/
 */
async function loadComponent(id, file) {
    const targetElement = document.getElementById(id);
    if (!targetElement) return false;

    try {
        // เพิ่ม Cache Busting (?v=...) เพื่อให้ Browser โหลดไฟล์ใหม่เสมอเวลาเราแก้ไขโค้ด
        const response = await fetch(`./components/${file}?v=${new Date().getTime()}`);
        
        if (!response.ok) {
            throw new Error(`ไม่สามารถโหลดไฟล์: ${file} (Status: ${response.status})`);
        }
        
        const html = await response.text();
        targetElement.innerHTML = html;
        
        console.log(`✅ โหลด ${file} สำเร็จ`);
        
        // ส่งสัญญาณ Event แจ้งระบบว่าส่วนประกอบนี้โหลดเสร็จแล้ว
        window.dispatchEvent(new CustomEvent('componentLoaded', { 
            detail: { fileName: file, elementId: id } 
        }));
        
        return true;
    } catch (error) {
        console.error(`❌ Render Error [${file}]:`, error);
        targetElement.innerHTML = `<div style="color:red; font-size:12px; padding:10px;">⚠️ Missing: ${file}</div>`;
        return false;
    }
}

/**
 * ฟังก์ชันหลักในการเตรียมความพร้อมหน้าเว็บ
 */
const initApp = async () => {
    console.log("🚀 ระบบเว็บ ช.สหชัย กำลังประมวลผล...");

    // 1. โหลดส่วนประกอบพื้นฐาน (ต้องรอให้เสร็จก่อนเพื่อจัดลำดับ UI)
    await loadComponent('header-placeholder', 'header.html');
    await loadComponent('navbar-placeholder', 'navbar.html');

    // 2. โหลดส่วนเนื้อหาเสริม (โหลดขนานพร้อมกันเพื่อความเร็ว)
    const extraComponents = [];
    
    if (document.getElementById('hero-placeholder')) {
        extraComponents.push(loadComponent('hero-placeholder', 'hero.html'));
    }
    
    if (document.getElementById('review-placeholder')) {
        extraComponents.push(loadComponent('review-placeholder', 'review.html'));
    }

    if (document.getElementById('footer-placeholder')) {
        extraComponents.push(loadComponent('footer-placeholder', 'footer.html'));
    }

    // รอให้ส่วนประกอบทั้งหมดที่อยู่ในรายการโหลดเสร็จ
    await Promise.all(extraComponents);

    // 3. เรียกใช้ฟังก์ชันดึงข้อมูล JSON จาก app.js
    // เราจะเรียกหลังจาก UI โหลดเสร็จเท่านั้น เพื่อป้องกันปัญหา TypeError (หา Element ไม่เจอ)
    if (typeof window.initDynamicContent === 'function') {
        console.log("📦 กำลังดึงข้อมูลจากฐานข้อมูล JSON...");
        window.initDynamicContent();
    }
};

/**
 * ตรวจสอบสถานะการโหลดของเอกสาร
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // กรณีที่สคริปต์โหลดมาทีหลัง DOM พร้อมแล้วให้รันทันที
    initApp();
}
