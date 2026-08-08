/* =========================================================
   巷子口家常菜 · 交互脚本
   ---------------------------------------------------------
   功能：
     1) 统一配置（电话 / 地图链接），部署前改这里即可
     2) 自动把页面所有电话位改为 tel: 唤起
     3) 一键导航：打开地图链接
     4) 移动端菜单开关（含 aria-expanded 同步）
     5) 滚动时高亮当前所在区块的导航项
     6) 滚动渐显（.reveal → .in，尊重 reduced-motion）
   说明：锚点平滑滚动由 CSS scroll-behavior 处理，无需 JS。
   ========================================================= */

/* ========== 可配置信息（部署前填入真实内容） ========== */
const CONFIG = {
  // 真实号码（无横线），用于 tel: 唤起拨号
  phone: '13800000000',
  // 地图链接：填入真实门店在高德/百度/腾讯地图的导航链接
  // 示例为「高德地图标点」链接，把它换成自己门店的经纬度与名称即可
  mapUrl: 'https://uri.amap.com/marker?position=120.155,30.274&name=巷子口家常菜&src=mywebapp&coordinate=gaode&callnative=1'
};

/* ---------- 1) 统一电话位：设置 tel: 链接，并格式化展示号码 ---------- */
document.querySelectorAll('[data-call]').forEach((el) => {
  el.setAttribute('href', 'tel:' + CONFIG.phone);
  // 若文本仍是示例（含 0000），同步为「138-0000-0000」格式
  if (el.textContent.includes('0000')) {
    el.textContent = CONFIG.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
});

/* ---------- 2) 一键导航：打开地图链接 ---------- */
function openMap(e) {
  e.preventDefault();
  window.open(CONFIG.mapUrl, '_blank', 'noopener');
}
document.querySelectorAll('[data-nav]').forEach((el) => {
  el.addEventListener('click', openMap);
});

/* ---------- 3) 移动端菜单开关（含无障碍状态同步） ---------- */
const navbar = document.getElementById('navbar');
const toggle = document.getElementById('navToggle');
if (toggle && navbar) {
  toggle.addEventListener('click', () => {
    const open = navbar.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // 点击任一导航项后自动收起菜单
  navbar.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => {
      navbar.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- 4) 滚动高亮当前区块对应的导航项 ---------- */
const navLinkEls = Array.from(document.querySelectorAll('.nav-links a'));
const sectionEls = navLinkEls
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sectionEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinkEls.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sectionEls.forEach((s) => observer.observe(s));
}

/* ---------- 5) 滚动渐显（尊重「减少动态效果」） ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('in'));
} else {
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);   // 渐显一次即可，不再观察
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  revealEls.forEach((el) => revealObserver.observe(el));
}
