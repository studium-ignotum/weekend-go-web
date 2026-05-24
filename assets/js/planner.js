/* Planner — Tính năng độc quyền (Interactive demo)
 * Ported from legacy docs/legacy/index-2026-05-23.html inline script.
 */
(function () {
  const groupSelections = {};
  const groupDefaults = {};

  const MOBILE_MQ = window.matchMedia('(max-width: 1023px)');
  let mobileView = 'filters';
  const LOADING_MS = 700;
  let loadingTimer = null;

  const LIVE_GROUPS = new Set(['age', 'vibe', 'weather']);

  const PLANNER_VENUES = [
    {
      id: 'sweet-town',
      name: 'Sweet Town',
      district: 'Tân Quy, Q.7, TP. Hồ Chí Minh',
      ageLabel: '1-8 tuổi',
      rating: 4.7,
      vibeLabel: 'Thảnh thơi',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69eb81b85274d2f9b1923c4f.webp?w=1200&h=900',
      desc: 'Kid cafe nhỏ xinh ở Tân Quy với khu chơi an toàn cho bé, ba mẹ thảnh thơi nhâm nhi cafe.',
      tip: 'Trong nhà có máy lạnh — đi được cả ngày mưa hay nắng nóng.',
      url: 'https://s.cuoituandidau.vn/v/kid-cafe-sweet-town',
      meta: { price: '100k-300k', space: 'Trong nhà', duration: 'Ghé nhanh', type: 'Quán cafe' },
      tags: {
        age: ['toddler', 'preschool', 'primary'],
        vibe: ['cafe'],
        weather: ['sunny', 'hot', 'rain'],
      },
    },
    {
      id: 'meow-meow-kidsplay',
      name: 'Meow Meow Kidsplay Cafe',
      district: 'Bến Vân Đồn, Q.4, TP. Hồ Chí Minh',
      ageLabel: '1-10 tuổi',
      rating: 4.6,
      vibeLabel: 'Thảnh thơi',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69eb8acd5274d2f9b1923d29.webp?w=1200&h=900',
      desc: 'Kidsplay cafe rộng rãi ven sông với nhiều khu chơi sáng tạo cho bé, đồ uống tươi mát cho ba mẹ.',
      tip: 'View sông thoáng đãng, có khu trong nhà tránh mưa nắng tuỳ chọn linh hoạt.',
      url: 'https://s.cuoituandidau.vn/v/kid-cafe-meow-meow-kidsplay-cafe',
      meta: {
        price: '100k-300k',
        space: 'Trong nhà & ngoài trời',
        duration: 'Nửa ngày',
        type: 'Quán cafe',
      },
      tags: {
        age: ['toddler', 'preschool', 'primary'],
        vibe: ['cafe'],
        weather: ['sunny', 'hot', 'rain'],
      },
    },
    {
      id: 'ph-kids-hung-vuong',
      name: 'Khu Vui Chơi PH KIDS - CN Hùng Vương',
      district: 'Hồng Bàng, Q.5, TP. Hồ Chí Minh',
      ageLabel: '2-11 tuổi',
      rating: 4.7,
      vibeLabel: 'Năng động',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69eb8b425274d2f9b1923d2d.webp?w=1200&h=900',
      desc: 'Khu vui chơi liên hoàn với cầu trượt, bể bóng, trampoline cho bé xả năng lượng cả ngày.',
      tip: 'Trong trung tâm thương mại — đi được mọi thời tiết, có bãi đỗ xe rộng rãi.',
      url: 'https://s.cuoituandidau.vn/v/kid-cafe-khu-vui-choi-ph-kids-cn-hung-vuong',
      meta: { price: '100k-300k', space: 'Trong nhà', duration: 'Nửa ngày', type: 'Khu vui chơi' },
      tags: {
        age: ['toddler', 'preschool', 'primary'],
        vibe: ['cafe'],
        weather: ['sunny', 'hot', 'rain'],
      },
    },
    {
      id: 'teky-q3',
      name: 'Học Viện Sáng Tạo Công Nghệ TEKY - Q.3',
      district: 'Cao Thắng, Q.3, TP. Hồ Chí Minh',
      ageLabel: '6-15 tuổi',
      rating: 4.8,
      vibeLabel: 'Sáng tạo',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69ec38d06b43255422a3a6ee.webp?w=1200&h=900',
      desc: 'Workshop lập trình, robotics, công nghệ — bé học chơi mà thấm, ba mẹ yên tâm thời gian màn hình có ích.',
      tip: 'Có máy lạnh, lý tưởng cho ngày mưa hoặc trời quá nóng — đăng ký lớp trước qua app.',
      url: 'https://s.cuoituandidau.vn/v/shopping-mall-hoc-vien-sang-tao-cong-nghe-teky-quan-3',
      meta: { price: '300k-500k', space: 'Trong nhà', duration: 'Ghé nhanh', type: 'Khu vui chơi' },
      tags: {
        age: ['primary', 'teen'],
        vibe: ['creative'],
        weather: ['sunny', 'hot', 'rain'],
      },
    },
    {
      id: 'dam-sen-water-park',
      name: 'Công Viên Nước Đầm Sen',
      district: 'Hoà Bình, Q.11, TP. Hồ Chí Minh',
      ageLabel: '4-15 tuổi',
      rating: 4.6,
      vibeLabel: 'Năng động',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69ece64f133cc6a7def752d6.webp?w=1200&h=900',
      desc: 'Công viên nước lâu đời với hàng loạt slide, hồ tạo sóng, khu trẻ em — cả nhà giải nhiệt ngày nắng.',
      tip: 'Đi sáng sớm tránh nắng gắt; mang theo kem chống nắng và bộ đồ bơi cho cả nhà.',
      url: 'https://s.cuoituandidau.vn/v/park-cong-vien-nuoc-dam-sen',
      meta: { price: '300k-500k', space: 'Ngoài trời', duration: 'Cả ngày', type: 'Khu vui chơi' },
      tags: {
        age: ['preschool', 'primary', 'teen'],
        vibe: ['active'],
        weather: ['sunny', 'hot'],
      },
    },
    {
      id: 'bao-tang-tphcm',
      name: 'Bảo tàng Thành phố Hồ Chí Minh',
      district: 'Lý Tự Trọng, Q.1, TP. Hồ Chí Minh',
      ageLabel: '4-15 tuổi',
      rating: 4.7,
      vibeLabel: 'Sáng tạo',
      img: 'https://media.cuoituandidau.vn/uploads/venues/6a080442a20f6e2f04338545.webp?w=900&h=1200',
      desc: 'Toà nhà Pháp cổ giữa Sài Gòn, trưng bày lịch sử thành phố — bé khám phá văn hoá, ba mẹ check-in đẹp.',
      tip: 'Có khu trong nhà, đi được cả ngày mưa hay nắng oi; vé vào cổng rất phải chăng.',
      url: 'https://s.cuoituandidau.vn/v/bao-tang-thanh-pho-1778810317550',
      meta: {
        price: 'Dưới 100k',
        space: 'Trong nhà & ngoài trời',
        duration: 'Nửa ngày',
        type: 'Khu dã ngoại',
      },
      tags: {
        age: ['preschool', 'primary', 'teen'],
        vibe: ['creative'],
        weather: ['sunny', 'hot', 'rain'],
      },
    },
    {
      id: 'vuon-nha-gom',
      name: 'Vườn Nhà Gốm',
      district: '120 Gia Long, Lái Thiêu, TP. Hồ Chí Minh',
      ageLabel: '4-15 tuổi',
      rating: 4.7,
      vibeLabel: 'Sáng tạo',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69fb4d7feb9eefe2643fd511.webp?w=1200&h=800',
      desc: 'Khu vườn gốm xanh mát với workshop nặn gốm thủ công — bé thoả sức sáng tạo, ba mẹ thư giãn giữa cây cỏ.',
      tip: 'Không gian nửa trong nửa ngoài, đi được cả ngày nắng nhẹ hoặc mưa lất phất.',
      url: 'https://s.cuoituandidau.vn/v/vuon-nha-gom-1777938667525',
      meta: {
        price: '100k-300k',
        space: 'Trong nhà & ngoài trời',
        duration: 'Nửa ngày',
        type: 'Quán cafe',
      },
      tags: {
        age: ['preschool', 'primary', 'teen'],
        vibe: ['creative', 'nature'],
        weather: ['sunny', 'rain'],
      },
    },
    {
      id: 'metashow-exhibition',
      name: 'Triển Lãm Metashow - Metashow Exhibition',
      district: 'Thiso Mall Sala, Mai Chí Thọ, Thủ Thiêm, TP. Hồ Chí Minh',
      ageLabel: '4-15 tuổi',
      rating: 4.6,
      vibeLabel: 'Sáng tạo',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69ec251e3c17e5a777bb0bc7.webp?w=1200&h=900',
      desc: 'Triển lãm nghệ thuật tương tác đa giác quan trong trung tâm thương mại — bé khám phá, ba mẹ check-in.',
      tip: 'Trong nhà, máy lạnh mát rượi — lý tưởng cho ngày mưa hoặc trời nắng gắt.',
      url: 'https://s.cuoituandidau.vn/v/shopping-mall-trien-lam-metashow-metashow-exhibition',
      meta: {
        price: '100k-300k',
        space: 'Trong nhà',
        duration: 'Ghé nhanh',
        type: 'Trung tâm thương mại',
      },
      tags: {
        age: ['preschool', 'primary', 'teen'],
        vibe: ['creative'],
        weather: ['sunny', 'hot', 'rain'],
      },
    },
    {
      id: 'vietopia',
      name: 'Vietopia',
      district: '98 Nguyễn Thị Thập, Tân Hưng, Q.7, TP. Hồ Chí Minh',
      ageLabel: '4-15 tuổi',
      rating: 4.8,
      vibeLabel: 'Sáng tạo',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69fca059a261c72b1dfa7b49.webp?w=1200&h=900',
      desc: 'Thành phố hướng nghiệp thu nhỏ — bé hoá thân thành bác sĩ, phi công, đầu bếp… học chơi mà thấm.',
      tip: 'Trong nhà, đi được mọi thời tiết; nên đặt vé trước vào cuối tuần.',
      url: 'https://s.cuoituandidau.vn/v/vietopia-1778158297121',
      meta: { price: '300k-500k', space: 'Trong nhà', duration: 'Cả ngày', type: 'Khu vui chơi' },
      tags: {
        age: ['preschool', 'primary', 'teen'],
        vibe: ['creative', 'active'],
        weather: ['sunny', 'hot', 'rain'],
      },
    },
    {
      id: 'cong-vien-grand-park',
      name: 'Công Viên Grand Park',
      district: 'Nguyễn Xiển, Long Thạnh Mỹ, TP. Hồ Chí Minh',
      ageLabel: '1-15 tuổi',
      rating: 4.6,
      vibeLabel: 'Năng động',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69ece465133cc6a7def75139.webp?w=1200&h=900',
      desc: 'Công viên rộng thoáng với hồ nước, lối đi bộ, bãi cỏ — cả nhà dã ngoại, bé chạy nhảy thoả thích.',
      tip: 'Đi sáng sớm hoặc chiều mát; mang theo thảm picnic và nước uống.',
      url: 'https://s.cuoituandidau.vn/v/park-cong-vien-grand-park',
      meta: { price: 'Miễn phí', space: 'Ngoài trời', duration: 'Nửa ngày', type: 'Công viên' },
      tags: {
        age: ['toddler', 'preschool', 'primary', 'teen'],
        vibe: ['nature', 'active'],
        weather: ['sunny'],
      },
    },
  ];

  function boot() {
    if (!document.getElementById('planner')) return;

    const els = {
      section: document.getElementById('planner'),
      panelFilters: document.getElementById('planner-panel-filters'),
      panelResults: document.getElementById('planner-panel-results'),
      loading: document.getElementById('planner-loading'),
      content: document.getElementById('planner-results-content'),
      results: document.getElementById('planner-results'),
      empty: document.getElementById('planner-empty'),
      fallback: document.getElementById('planner-fallback'),
      count: document.getElementById('planner-count'),
      submit: document.getElementById('planner-submit'),
      back: document.getElementById('planner-back'),
      reset: document.getElementById('planner-reset'),
    };

    function applyMobileView() {
      if (!els.panelFilters || !els.panelResults) return;
      if (!MOBILE_MQ.matches) {
        els.panelFilters.classList.remove('hidden');
        els.panelResults.classList.remove('hidden');
        if (els.loading) els.loading.classList.add('hidden');
        if (els.content) els.content.classList.remove('hidden');
        return;
      }
      if (mobileView === 'filters') {
        els.panelFilters.classList.remove('hidden');
        els.panelResults.classList.add('hidden');
      } else {
        els.panelFilters.classList.add('hidden');
        els.panelResults.classList.remove('hidden');
      }
    }

    function renderPlanner() {
      const age = groupSelections.age;
      const vibe = groupSelections.vibe;
      const weather = groupSelections.weather;
      const strictMatches = PLANNER_VENUES.filter(
        (v) =>
          v.tags.age.includes(age) &&
          v.tags.vibe.includes(vibe) &&
          v.tags.weather.includes(weather),
      );
      let matches = strictMatches;
      let fallback = false;
      if (strictMatches.length === 0 && age && vibe) {
        matches = PLANNER_VENUES.filter(
          (v) => v.tags.age.includes(age) && v.tags.vibe.includes(vibe),
        );
        fallback = matches.length > 0;
      }
      if (!els.results || !els.empty || !els.count) return;
      els.count.textContent = matches.length;
      if (els.fallback) els.fallback.classList.toggle('hidden', !fallback);
      if (matches.length === 0) {
        els.results.innerHTML = '';
        els.empty.classList.remove('hidden');
      } else {
        els.empty.classList.add('hidden');
        els.results.innerHTML = matches
          .map(
            (v) => `
        <div class="venue-card bg-white rounded-2xl border border-border-default hover:border-primary/40 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div class="flex flex-col sm:flex-row">
            <div class="sm:w-[38%] relative h-44 sm:h-auto min-h-[160px] overflow-hidden">
              <img loading="lazy" decoding="async" src="${v.img}" alt="Ảnh ${v.name}" class="absolute inset-0 w-full h-full object-cover" referrerpolicy="no-referrer" />
              <div class="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-white/95 backdrop-blur-sm text-text-primary rounded-md text-xs font-bold shadow-sm">
                <i data-lucide="star" class="w-3 h-3 fill-amber text-amber"></i> <span>${v.rating}</span>
              </div>
            </div>
            <div class="p-5 flex-1 flex flex-col gap-2.5 text-left">
              <h4 class="text-[17px] font-heading font-extrabold text-text-primary leading-snug">${v.name}</h4>
              <div class="inline-flex items-center gap-1 text-xs text-text-tertiary">
                <i data-lucide="map-pin" class="w-3.5 h-3.5"></i><span>${v.district}</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-light text-[#92400E] rounded-full text-[11px] font-semibold">👶 ${v.ageLabel}</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F3E8FF] text-[#7C3AED] rounded-full text-[11px] font-semibold">💰 ${v.meta.price}</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFF4D6] text-[#A16207] rounded-full text-[11px] font-semibold">🎡 ${v.meta.type}</span>
              </div>
              <div class="px-3 py-2 bg-[#F0FAF3] border border-primary-light rounded-lg">
                <p class="text-xs sm:text-sm text-primary-dark font-medium leading-relaxed">${v.tip}</p>
              </div>
              <div class="mt-auto pt-1">
                ${v.url ? `<a href="${v.url}" target="_blank" rel="noopener" data-plan-web-link data-plan-web-placement="planner" class="inline-flex items-center gap-1 text-xs font-bold text-primary-dark hover:text-text-primary">Xem chi tiết <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>` : `<button class="inline-flex items-center gap-1 text-xs font-bold text-primary-dark hover:text-text-primary">Xem chi tiết <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></button>`}
              </div>
            </div>
          </div>
        </div>
      `,
          )
          .join('');
      }
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    function handleSubmit() {
      renderPlanner();
      mobileView = 'results';
      applyMobileView();
      if (els.loading) els.loading.classList.remove('hidden');
      if (els.content) els.content.classList.add('hidden');
      if (els.section && typeof els.section.scrollIntoView === 'function') {
        els.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      clearTimeout(loadingTimer);
      loadingTimer = setTimeout(() => {
        if (els.loading) els.loading.classList.add('hidden');
        if (els.content) els.content.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
      }, LOADING_MS);
    }

    function handleBack() {
      mobileView = 'filters';
      clearTimeout(loadingTimer);
      applyMobileView();
    }

    function onGroupChange(group) {
      if (LIVE_GROUPS.has(group)) renderPlanner();
    }

    function initToggles() {
      document.querySelectorAll('[data-toggle]').forEach((btn) => {
        const g = btn.dataset.group;
        if (btn.dataset.active === 'true') {
          groupSelections[g] = btn.dataset.value;
          groupDefaults[g] = btn.dataset.value;
        }
        btn.addEventListener('click', () => {
          const group = btn.dataset.group;
          const value = btn.dataset.value;
          document.querySelectorAll(`[data-toggle][data-group="${group}"]`).forEach((b) => {
            b.dataset.active = b === btn ? 'true' : 'false';
          });
          groupSelections[group] = value;
          onGroupChange(group);
        });
      });

      if (els.reset) {
        els.reset.addEventListener('click', () => {
          Object.entries(groupDefaults).forEach(([group, defaultValue]) => {
            document.querySelectorAll(`[data-toggle][data-group="${group}"]`).forEach((b) => {
              b.dataset.active = b.dataset.value === defaultValue ? 'true' : 'false';
            });
            groupSelections[group] = defaultValue;
          });
          renderPlanner();
        });
      }

      if (els.submit) els.submit.addEventListener('click', handleSubmit);
      if (els.back) els.back.addEventListener('click', handleBack);
      MOBILE_MQ.addEventListener('change', () => {
        mobileView = 'filters';
        applyMobileView();
      });
    }

    initToggles();
    renderPlanner();
    applyMobileView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
