/* Hero map — bản đồ địa điểm gợi ý (top-down, vị trí cố định).
 * 5 pin: mặc định hiện chấm nhỏ + nhãn; mỗi 3s một pin "sáng" bung ảnh; hover cũng bung ảnh.
 * Toạ độ theo hệ 600x440 của <svg> bản đồ.
 */
(function () {
  const VENUES = [
    {
      icon: 'trees',
      name: 'Grand Park',
      addr: 'TP. Thủ Đức',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69ece465133cc6a7def75139.webp?w=1200&h=900',
    },
    {
      icon: 'landmark',
      name: 'Bảo tàng TP',
      addr: 'Q.1, TP.HCM',
      img: 'https://media.cuoituandidau.vn/uploads/venues/6a080442a20f6e2f04338545.webp?w=900&h=1200',
    },
    {
      icon: 'coffee',
      name: 'Sweet Town',
      addr: 'Q.7, TP.HCM',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69eb81b85274d2f9b1923c4f.webp?w=1200&h=900',
    },
    {
      icon: 'palette',
      name: 'Nhà Gốm',
      addr: 'Lái Thiêu, Bình Dương',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69fb4d7feb9eefe2643fd511.webp?w=1200&h=800',
    },
    {
      icon: 'building-2',
      name: 'Vietopia',
      addr: 'Q.7, TP.HCM',
      img: 'https://media.cuoituandidau.vn/uploads/venues/69fca059a261c72b1dfa7b49.webp?w=1200&h=900',
    },
  ];

  // Layout cố định
  const FIXED = {
    you: { x: 320, y: 200 },
    targetIndex: 4, // Vietopia
    trip: { mins: 12, km: '4.2' },
    spots: [
      { ...VENUES[0], x: 72, y: 75 },
      { ...VENUES[1], x: 528, y: 82 },
      { ...VENUES[2], x: 530, y: 255 },
      { ...VENUES[3], x: 78, y: 300 },
      { ...VENUES[4], x: 300, y: 372 },
    ],
  };

  function pinHTML(v, theme, bill) {
    const size = 78; // ảnh
    const dotSize = 30;
    const pinBg = theme === 'dark' ? '#0B1F16' : '#ffffff';
    const dotBg = theme === 'dark' ? '#0B1F16' : '#34C759';
    const chip =
      theme === 'dark' ? 'bg-[#0B1F16]/95 text-white border border-white/15' : 'bg-white';
    return `<div class="pin flex flex-col items-center cursor-pointer" style="transform:${bill};transform-origin:center bottom;">
      <div class="pin-dot relative text-white" style="width:${dotSize}px;height:${dotSize}px;filter:drop-shadow(0 4px 4px rgba(0,0,0,0.3));">
        <div class="absolute inset-0" style="background:${dotBg};border-radius:50% 50% 50% 0;transform:rotate(-45deg);"></div>
        <span class="absolute inset-0 flex items-center justify-center"><i data-lucide="${v.icon}" class="w-4 h-4"></i></span>
      </div>
      <div class="pin-photo items-center justify-center">
        <div class="relative" style="width:${size}px;height:${size}px;filter:drop-shadow(0 9px 8px rgba(0,0,0,0.4));">
          <div class="absolute inset-0" style="background:${pinBg};border-radius:50% 50% 50% 0;transform:rotate(-45deg);"></div>
          <div class="absolute overflow-hidden rounded-full" style="inset:2px;">
            <img src="${v.img}" referrerpolicy="no-referrer" alt="${v.name}" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      <div class="${chip} rounded-lg shadow px-2 py-1 mt-1.5 text-center leading-tight whitespace-nowrap">
        <span class="flex items-center justify-center gap-1 text-[10px] font-bold"><i data-lucide="${v.icon}" class="w-3 h-3 text-primary"></i>${v.name}</span>
        <span class="block text-[9px] font-medium opacity-70">${v.addr}</span>
      </div>
    </div>`;
  }

  function buildMap(markers) {
    const theme = markers.dataset.theme || 'light';
    const flat = markers.dataset.flat === '1';
    const BILL = 'translate(-50%,-100%) rotateZ(14deg) rotateX(-48deg)';
    const BILL_C = 'translate(-50%,-50%) rotateZ(14deg) rotateX(-48deg)';
    const bill = flat ? 'translate(-50%,-100%)' : BILL;
    const billC = flat ? 'translate(-50%,-50%)' : BILL_C;
    const routeEl = markers.parentElement.querySelector('.js-route');
    markers.innerHTML = '';

    const pts = FIXED.spots;
    const n = pts.length;
    const you = FIXED.you;
    const ti = FIXED.targetIndex;

    const place = (html, x, y, z) => {
      const d = document.createElement('div');
      d.className = 'absolute';
      d.style.cssText = `left:${(x / 600) * 100}%;top:${(y / 440) * 100}%;transform-style:preserve-3d;z-index:${z || 10}`;
      d.innerHTML = html;
      markers.appendChild(d);
    };

    for (let i = 0; i < n; i++) {
      place(pinHTML(pts[i], theme, bill), pts[i].x, pts[i].y, 10);
    }

    // xoay vòng: mỗi 3s một pin "sáng" hiện ảnh (hover vẫn bung ảnh riêng)
    const pinEls = markers.querySelectorAll('.pin');
    if (pinEls.length) {
      let ai = 0;
      pinEls[0].classList.add('is-active');
      setInterval(() => {
        pinEls[ai].classList.remove('is-active');
        ai = (ai + 1) % pinEls.length;
        pinEls[ai].classList.add('is-active');
      }, 3000);
    }

    // tuyến đường Bạn ở đây -> target (nằm phẳng trên bản đồ)
    const t = pts[ti];
    const c1x = (you.x * 2 + t.x) / 3;
    const c1y = (you.y * 2 + t.y) / 3 + 22;
    const c2x = (you.x + t.x * 2) / 3;
    const c2y = (you.y + t.y * 2) / 3 + 22;
    if (routeEl) {
      routeEl.setAttribute('d', `M${you.x},${you.y} C${c1x},${c1y} ${c2x},${c2y} ${t.x},${t.y}`);
    }

    // badge thời gian — nằm giữa đoạn đường
    const mins = FIXED.trip.mins;
    const km = FIXED.trip.km;
    const mx = (you.x + t.x) / 2;
    const my = (you.y + t.y) / 2 + 16;
    place(
      `<div style="transform:${billC}"><span class="bg-primary-dark text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap inline-flex items-center gap-1"><i data-lucide="car" class="w-3.5 h-3.5"></i> ${mins} phút · ${km}km</span></div>`,
      mx,
      my,
      50,
    );

    // Bạn ở đây
    place(
      `<div class="flex flex-col items-center" style="transform:${bill};transform-origin:center bottom;">
        <span class="relative flex h-5 w-5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-60"></span><span class="relative inline-flex rounded-full h-5 w-5 bg-[#3B82F6] ring-4 ring-white shadow-lg"></span></span>
        <span class="mt-1 bg-[#3B82F6] text-white rounded-full px-2 py-0.5 text-[10px] font-bold shadow whitespace-nowrap">Bạn ở đây</span>
      </div>`,
      you.x,
      you.y,
      30,
    );
  }

  function init() {
    document.querySelectorAll('.js-markers').forEach(buildMap);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
