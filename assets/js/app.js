/**
 * assets/js/app.js
 * จัดการข้อมูลแบบ Dynamic โดยการดึงข้อมูลจาก JSON มาฉีดลงใน HTML
 * รองรับการแสดงผลหน้า Index, About, Services และ Contact
 */

async function initDynamicContent() {
    console.log("📦 เริ่มต้นดึงข้อมูลจากไฟล์ JSON...");

    try {
        // 1. โหลดข้อมูลร้านพื้นฐาน (site.json) - ใช้ได้ทุกหน้า
        const siteRes = await fetch('./data/site.json');
        if (siteRes.ok) {
            const siteData = await siteRes.json();
            if (siteData) updateSiteInfo(siteData);
        } else {
            console.warn("⚠️ ไม่พบไฟล์ data/site.json");
        }

        // 2. จัดการข้อมูลครอบครัวและเรื่องราว (fammiry.json) - หน้า Index & About
        const familyContainer = document.getElementById('family-members');
        const storyTitleEl = document.getElementById('story-title');
        
        if (familyContainer || storyTitleEl) {
            const familyRes = await fetch('./data/fammiry.json'); 
            if (familyRes.ok) {
                const familyData = await familyRes.json();
                if (familyData) renderFamilyContent(familyData);
            } else {
                console.warn("⚠️ ไม่พบไฟล์ data/fammiry.json");
            }
        }

        // 3. จัดการข้อมูลรีวิวลูกค้า (reviews.json) - หน้า Index
        const reviewsContainer = document.getElementById('reviews-container');
        if (reviewsContainer) {
            const reviewRes = await fetch('./data/reviews.json');
            if (reviewRes.ok) {
                const reviewsData = await reviewRes.json();
                if (Array.isArray(reviewsData)) renderReviews(reviewsData);
            } else {
                console.warn("⚠️ ไม่พบไฟล์ data/reviews.json");
            }
        }

    } catch (err) {
        console.error("❌ Critical Error ใน app.js:", err.message);
    }
}

/**
 * อัปเดตข้อมูลเบอร์โทร ที่อยู่ และเวลาเปิด-ปิด (รองรับหลายจุดในหน้าเดียว)
 */
function updateSiteInfo(site) {
    if (!site) return;

    // เลือก Elements ทั้งหมดที่มี Class สำหรับอัปเดตข้อมูลซ้ำๆ
    const shopPhones = document.querySelectorAll('.display-phone');
    const shopAddress = document.querySelectorAll('#display-address, .display-address');
    const shopHours = document.querySelectorAll('.display-time');

    // อัปเดตเบอร์โทรและลิงก์สำหรับคลิกโทรออก
    if (site.phone) {
        shopPhones.forEach(el => {
            el.innerText = site.phone;
            if (el.tagName === 'A') {
                el.href = `tel:${site.phone.replace(/[^0-9]/g, '')}`;
            }
        });
    }

    // อัปเดตที่อยู่
    if (site.address) {
        shopAddress.forEach(el => {
            el.innerText = site.address;
        });
    }

    // อัปเดตเวลาเปิด-ปิด
    if (site.opening_hours) {
        shopHours.forEach(el => {
            el.innerText = site.opening_hours;
        });
    }
}

/**
 * แสดงข้อมูลเรื่องราวของร้านและสมาชิกครอบครัว (เฮียเนก & เจ๊ตั๊ก)
 */
function renderFamilyContent(data) {
    if (!data) return;

    const titleEl = document.getElementById('story-title');
    const descEl = document.getElementById('story-desc');
    const membersContainer = document.getElementById('family-members');

    // ฉีดข้อความเรื่องราว
    if (titleEl && data.story_title) titleEl.innerText = data.story_title;
    if (descEl && data.description) descEl.innerText = data.description;

    // ฉีดการ์ดสมาชิก (เฮียเนก/เจ๊ตั๊ก)
    if (membersContainer && Array.isArray(data.members)) {
        membersContainer.innerHTML = data.members.map(member => `
            <div class="member-card">
                <div class="member-img-frame">
                    <img src="assets/img/${member.img || 'logo.png'}" 
                         alt="${member.name || 'ช.สหชัย'}" 
                         class="img-fluid rounded-circle"
                         onerror="this.src='https://via.placeholder.com/220?text=ช.สหชัย'">
                </div>
                <h3 style="margin-top: 15px; color: var(--dark-text); font-weight: 700;">${member.name || ''}</h3>
                <p class="role-tag" style="color: var(--primary-red); font-weight: 500;">${member.role || ''}</p>
            </div>
        `).join('');
    }
}

/**
 * แสดงรายการรีวิวลูกค้าพร้อมระบบดาว
 */
function renderReviews(reviews) {
    const container = document.getElementById('reviews-container');
    if (!container || !Array.isArray(reviews)) return;

    container.innerHTML = reviews.map(r => `
        <div class="review-card">
            <div class="stars" style="color: var(--noodle-gold); margin-bottom: 10px;">
                ${'<i class="fas fa-star"></i>'.repeat(r.rating || 5)}${'<i class="far fa-star"></i>'.repeat(5 - (r.rating || 5))}
            </div>
            <p class="review-text" style="font-style: italic; color: #555; line-height: 1.6;">"${r.comment || 'อร่อยมากครับ'}"</p>
            <p class="reviewer-name" style="margin-top: 15px; font-weight: 700; color: var(--dark-text); font-size: 0.9rem;">
                - คุณ ${r.user || 'ลูกค้าผู้มีอุปการคุณ'}
            </p>
        </div>
    `).join('');
}

// ผูกฟังก์ชันไว้กับ window เพื่อให้ render.js เรียกใช้งานได้
window.initDynamicContent = initDynamicContent;
