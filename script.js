document.addEventListener('DOMContentLoaded', () => {
    // Hijri conversion helpers (algorithmic approximation)
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
        // Use algorithmic Hijri conversion (note: local sighting/official calendars may differ slightly)
        document.getElementById('hijriDate').textContent = formatHijri(now);
    }
    
    // Update time immediately and then every minute
    updateTime();
    setInterval(updateTime, 60000);
    
    // Helper: wrap Arabic part of bilingual strings with a span
    function formatBilingual(text) {
        if (!text || !text.includes('|')) return text;
        const parts = text.split('|').map(s => s.trim());
        return `${parts[0]} | <span lang="ar" class="arabic">${parts[1]}</span>`;
    }

    // Meeting data for carousel
    const meetings = [
        { time: '09:00 - 10:30', title: 'Emergency Response Training | تدريب الاستجابة للطوارئ', attendees: 18 },
        { time: '11:00 - 12:00', title: 'Fire Safety Workshop | ورشة عمل السلامة من الحرائق', attendees: 24 },
        { time: '13:00 - 14:30', title: 'Disaster Management Planning | تخطيط إدارة الكوارث', attendees: 15 },
        { time: '15:00 - 16:00', title: 'Equipment Maintenance | صيانة المعدات', attendees: 10 },
        { time: '16:30 - 17:30', title: 'Team Coordination Meeting | اجتماع تنسيق الفريق', attendees: 22 },
        { time: '09:30 - 11:00', title: 'Community Outreach Planning | تخطيط التوعية المجتمعية', attendees: 20 },
        { time: '12:30 - 13:30', title: 'Medical Response Drill | تمرين الاستجابة الطبية', attendees: 16 },
        { time: '14:00 - 15:30', title: 'Strategic Planning Session | جلسة التخطيط الاستراتيجي', attendees: 12 },
        { time: '17:00 - 18:00', title: 'Incident Review Meeting | اجتماع مراجعة الحوادث', attendees: 8 },
        { time: '18:30 - 19:30', title: 'Volunteer Coordination | تنسيق المتطوعين', attendees: 30 }
    ];
    
    // Generate carousel items (tripled for seamless continuous loop)
    const carouselInner = document.getElementById('carouselInner');
    const createMeetingItem = (meeting) => {
        const meetingItem = document.createElement('div');
        // Using embla__slide class from integrated embla folder structure
        meetingItem.className = 'embla__slide carousel-item flex-shrink-0 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-center';
        meetingItem.innerHTML = `
            <div class="text-yellow-400 font-extrabold text-base">${meeting.time}</div>
            <div class="mt-1 text-base font-medium">${formatBilingual(meeting.title)}</div>
            <div class="mt-2 flex items-center justify-center text-sm">
                <i class="fas fa-users mr-2 text-xs" aria-hidden="true"></i>
                <span>${meeting.attendees} attendees</span>
            </div>
        `;
        meetingItem.setAttribute('role', 'listitem');
        meetingItem.setAttribute('aria-label', `${meeting.time} — ${meeting.title} — ${meeting.attendees} attendees`);
        return meetingItem;
    };
    
    // Create three copies of the carousel for seamless loop
    for (let i = 0; i < 3; i++) {
        meetings.forEach(meeting => {
            carouselInner.appendChild(createMeetingItem(meeting));
        });
    }
    
    // Initialize Embla carousel (with continuous marquee autoscroll)
    let embla;
    const emblaViewport = document.querySelector('.embla__viewport');
    const emblaRoot = document.querySelector('.embla');
    
    // Create progress bar for autoscroll
    const progressBar = document.createElement('div');
    progressBar.className = 'embla__progress';
    progressBar.innerHTML = '<div class="embla__progress__bar"></div>';
    emblaRoot.appendChild(progressBar);
    const progressBarInner = progressBar.querySelector('.embla__progress__bar');
    
    if (typeof EmblaCarousel === 'function' && emblaViewport) {
        embla = EmblaCarousel(emblaViewport, { 
            containScroll: false,
            align: 'start', 
            loop: true, 
            speed: 20,
            dragFree: false,
            inViewThreshold: 0
        });

        // Continuous marquee autoscroll (right to left)
        let autoScrollAnimation = null;
        let isHovered = false;
        const SCROLL_SPEED = -1.5; // pixels per frame (negative for right-to-left)
        const slides = embla.slideNodes();
        const slideCount = slides.length / 3; // We have 3 copies
        
        const animate = () => {
            if (!isHovered && embla) {
                const engine = embla.internalEngine();
                let target = engine.location.get() + SCROLL_SPEED;
                
                // Seamless loop: reset when we scroll past the first set
                const slideWidth = slides[0].offsetWidth + parseFloat(getComputedStyle(slides[0].parentElement).gap);
                const resetPoint = -slideWidth * slideCount;
                const maxPoint = slideWidth * slideCount;
                
                if (target < resetPoint) {
                    target = target + (slideWidth * slideCount);
                } else if (target > maxPoint) {
                    target = target - (slideWidth * slideCount);
                }
                
                engine.location.set(target);
                engine.translate.to(engine.location);
                engine.animation.proceed();
            }
            autoScrollAnimation = requestAnimationFrame(animate);
        };
        
        // Start continuous animation
        autoScrollAnimation = requestAnimationFrame(animate);
        
        const startAutoplay = () => { 
            isHovered = false;
            progressBarInner.style.animationPlayState = 'running';
        };
        
        const stopAutoplay = () => { 
            isHovered = true;
            progressBarInner.style.animationPlayState = 'paused';
        };

        emblaRoot.addEventListener('mouseenter', stopAutoplay);
        emblaRoot.addEventListener('mouseleave', startAutoplay);
        emblaRoot.addEventListener('focusin', stopAutoplay);
        emblaRoot.addEventListener('focusout', startAutoplay);

        // Continuous progress bar animation (20 seconds for full cycle)
        progressBarInner.style.animationDuration = '5s';
        progressBarInner.style.animationPlayState = 'running';

        // Re-init on resize (debounced) to ensure loop clones and snap positions are correct
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                try { embla.reInit(); } catch (e) { /* ignore */ }
            }, 150);
        });

        // Ensure proper init after layout (in case fonts or rendering shifted sizes)
        setTimeout(() => { try { embla.reInit(); } catch (e) {} }, 200);
        
        // Navigation - Keyboard nav with autoscroll pause/resume
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { 
                stopAutoplay(); 
                embla.scrollPrev(); 
                setTimeout(startAutoplay, 2000);
            }
            if (e.key === 'ArrowRight') { 
                stopAutoplay(); 
                embla.scrollNext(); 
                setTimeout(startAutoplay, 2000);
            }
        });

        // Set active class on init and on select
        const updateActive = () => {
            try {
                const slidesInView = embla.slidesInView();
                document.querySelectorAll('.carousel-item').forEach((item, i) => {
                    if (slidesInView.indexOf(i) !== -1) item.classList.add('active'); else item.classList.remove('active');
                });
            } catch (err) {
                const selected = embla.selectedScrollSnap();
                const slides = embla.slideNodes();
                const visible = slides.length ? Math.max(1, Math.round(embla.containerNode().getBoundingClientRect().width / slides[0].getBoundingClientRect().width)) : 1;
                document.querySelectorAll('.carousel-item').forEach((item, i) => {
                    if (i >= selected && i < selected + visible) item.classList.add('active'); else item.classList.remove('active');
                });
            }
        };
        embla.on('select', updateActive);
        embla.on('init', updateActive);
    } else {
        // Fallback: rotate slides by moving first child to the end (looping)
        let fallbackTimer = setInterval(() => {
            const container = document.getElementById('carouselInner');
            if (!container || !container.firstElementChild) return;
            container.appendChild(container.firstElementChild);
        }, 3500);
        window.addEventListener('keydown', (e) => {
            const container = document.getElementById('carouselInner');
            if (!container) return;
            if (e.key === 'ArrowLeft') {
                container.insertBefore(container.lastElementChild, container.firstElementChild);
            }
            if (e.key === 'ArrowRight') {
                container.appendChild(container.firstElementChild);
            }
        });
    }

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
                fadeColor: 'rgba(16, 185, 129, 0.35)'
            },
            engaged: {
                text: 'Engaged | <span lang="ar" class="arabic">مشغول</span>',
                icon: 'fa-times',
                pulseColor: 'bg-red-500',
                bodyBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 15%, #b91c1c 30%, #ef4444 45%, #991b1b 60%, #dc2626 75%, #7f1d1d 90%, #ef4444 100%)',
                textColor: '#ffffff',
                fadeColor: 'rgba(239, 68, 68, 0.35)'
            },
            upcoming: {
                text: 'Starting&nbsp;Soon&nbsp;| <span lang="ar" class="arabic ">يبدأ&nbsp;قريباً</span>',
                icon: 'fa-clock',
                pulseColor: 'bg-orange-400',
                bodyBg: 'linear-gradient(135deg, #fb923c 0%, #f97316 15%, #ea580c 30%, #fb923c 45%, #c2410c 60%, #f97316 75%, #9a3412 90%, #fb923c 100%)',
                textColor: '#ffffff',
                fadeColor: 'rgba(251, 146, 60, 0.35)'
            }
        };

        const s = map[key];
        if (!s) return;

        currentStatus = key;

        // Apply the full-page gradient to body for clear visual state
        document.body.style.background = s.bodyBg;
        document.body.style.backgroundSize = '400% 400%';
        document.body.style.color = s.textColor;

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
