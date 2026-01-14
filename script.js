document.addEventListener('DOMContentLoaded', () => {
    // Hijri conversion helpers
    function gregorianToJulianDay(year, month, day) {
        return Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4)
            + Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12)
            - Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4)
            + day - 32075;
    }

    function julianDayToHijri(jd) {
        jd = Math.floor(jd);
        var l = jd - 1948440 + 10632;
        var n = Math.floor((l - 1) / 10631);
        l = l - 10631 * n + 354;
        var j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
        l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
        var month = Math.floor((24 * l) / 709);
        var day = l - Math.floor((709 * month) / 24);
        var year = 30 * n + j - 30;
        return { year: year, month: month, day: day };
    }

    function formatHijri(date) {
        var jd = gregorianToJulianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
        var h = julianDayToHijri(jd);
        const months = ['Muharram','Safar','Rabi al-awwal','Rabi al-thani','Jumada al-awwal','Jumada al-thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhu al-Qadah','Dhu al-Hijjah'];
        return `${h.day} ${months[h.month - 1]} ${h.year} AH`;
    }

    // Current time and date updater
    function updateTime() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-GB', timeOptions);
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
        document.getElementById('hijriDate').textContent = formatHijri(now);
    }
    
    updateTime();
    setInterval(updateTime, 60000);

    // Table auto-scroll
    (function initTableAutoScroll() {
        const tbody = document.getElementById('meetingsTableBody');
        if (!tbody) return;

        const rows = Array.from(tbody.children);
        if (rows.length < 2) return;

        // Clone rows for seamless loop
        rows.forEach(r => tbody.appendChild(r.cloneNode(true)));

        const firstRow = tbody.querySelector('tr');
        const rowHeight = firstRow ? firstRow.getBoundingClientRect().height : 50;

        let offset = 0;
        let lastTime = performance.now();
        const SPEED = 20; // px per second

        function step(now) {
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            offset += SPEED * dt;

            if (offset >= rowHeight) {
                const first = tbody.firstElementChild;
                if (first) tbody.appendChild(first);
                offset -= rowHeight;
            }

            tbody.style.transform = `translateY(-${offset}px)`;
            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    })();

    // Set initial hall status to Available
    let currentStatus = 'available';
    setStatus(currentStatus);
    
    // Hall status helper (applies full-page gradient + contrast + carousel fade colors)
    function setStatus(key) {
        const map = {
            available: {
                text: 'Available | <span lang="ar" class="arabic">متـــــــاح</span>',
                icon: 'fa-check',
                pulseColor: 'bg-green-600',
                bodyBg: 'linear-gradient(135deg, #10b981 0%, #059669 15%, #047857 30%, #10b981 45%, #065f46 60%, #047857 75%, #064e3b 90%, #10b981 100%)',
                textColor: '#ffffff',
                fadeColor: 'rgba(16, 185, 129, 0.35)',
                headerBg: '#10b981'
            },
            engaged: {
                text: 'Engaged | <span lang="ar" class="arabic">مشغول</span>',
                icon: 'fa-times',
                pulseColor: 'bg-red-500',
                bodyBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 15%, #b91c1c 30%, #ef4444 45%, #991b1b 60%, #dc2626 75%, #7f1d1d 90%, #ef4444 100%)',
                textColor: '#ffffff',
                fadeColor: 'rgba(239, 68, 68, 0.35)',
                headerBg: '#ef4444'
            },
            upcoming: {
                text: 'Starting&nbsp;Soon&nbsp;| <span lang="ar" class="arabic ">يبدأ&nbsp;قريباً</span>',
                icon: 'fa-clock',
                pulseColor: 'bg-orange-400',
                bodyBg: 'linear-gradient(135deg, #fb923c 0%, #f97316 15%, #ea580c 30%, #fb923c 45%, #c2410c 60%, #f97316 75%, #9a3412 90%, #fb923c 100%)',
                textColor: '#ffffff',
                fadeColor: 'rgba(251, 146, 60, 0.35)',
                headerBg: '#fb923c'
            }
        };

        const s = map[key];
        if (!s) return;

        currentStatus = key;

        // Apply the full-page gradient to body for clear visual state
        document.body.style.background = s.bodyBg;
        document.body.style.backgroundSize = '400% 400%';
        document.body.style.color = s.textColor;

        // Update status-aware table header colors (solid, non-transparent)
        document.documentElement.style.setProperty('--status-header-bg', s.headerBg || '#10b981');
        document.documentElement.style.setProperty('--status-header-color', s.textColor || '#ffffff');

        // Keep hall container transparent so body gradient shows through
        const hall = document.getElementById('hallStatus');
        hall.className = 'min-h-screen';
        hall.style.background = 'transparent';

        document.getElementById('statusText').innerHTML = s.text;
        const pulse = document.getElementById('statusPulse');
        pulse.className = `w-24 h-24 rounded-full ${s.pulseColor} flex items-center justify-center animate-pulse-slow`;
        pulse.innerHTML = `<i class="fas ${s.icon} text-white text-2xl"></i>`;

        // Ensure header and primary panels remain readable (glass effect)
        const header = document.querySelector('header');
        if (header) header.style.color = s.textColor;

        // Ensure text inside important containers uses contrast color as well
        document.querySelectorAll('.text-gray-800, .text-gray-700, .text-gray-600').forEach(el => {
            el.style.color = s.textColor;
        });

        // Update carousel fade colors to match status
        const emblaViewport = document.querySelector('.embla__viewport');
        if (emblaViewport) {
            emblaViewport.style.setProperty('--fade-color-left', s.fadeColor);
            emblaViewport.style.setProperty('--fade-color-right', s.fadeColor);
        }
    }

    // Simulate hall status changes (for demo purposes)
    function simulateStatus() {
        const keys = ['available','engaged','upcoming'];
        let statusIndex = 0;
        setInterval(() => {
            setStatus(keys[statusIndex]);
            statusIndex = (statusIndex + 1) % keys.length;
        }, 10000);
    }

    // Uncomment to simulate status changes
    // simulateStatus();

    // Status toggle button (cycles through available → engaged → upcoming)
    const statusToggleBtn = document.getElementById('statusToggleBtn');
    if (statusToggleBtn) {
        const statusKeys = ['available', 'engaged', 'upcoming'];
        statusToggleBtn.addEventListener('click', () => {
            const currentIndex = statusKeys.indexOf(currentStatus);
            const nextIndex = (currentIndex + 1) % statusKeys.length;
            setStatus(statusKeys[nextIndex]);
        });
    }

    // Fullscreen toggle button (uses Fullscreen API - hides browser chrome in supported browsers)
    const fsBtn = document.getElementById('fullscreenBtn');
    if (fsBtn) {
        const requestFull = (el) => (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen).call(el);
        const exitFull = () => (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen).call(document);

        fsBtn.addEventListener('click', async () => {
            try {
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    // request fullscreen on root element
                    (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.msRequestFullscreen).call(document.documentElement);
                } else {
                    (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen).call(document);
                }
            } catch (err) {
                console.warn('Fullscreen toggle failed', err);
            }
        });

        // Keep icon in sync with fullscreen state (handles ESC/F11 toggles)
        document.addEventListener('fullscreenchange', () => {
            const icon = fsBtn.querySelector('i');
            const nextMeetingCard = document.getElementById('nextMeetingCard');
            if (document.fullscreenElement) {
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
                if (nextMeetingCard) nextMeetingCard.classList.add('fullscreen-mode');
            } else {
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
                if (nextMeetingCard) nextMeetingCard.classList.remove('fullscreen-mode');
            }
        });
    }
});
