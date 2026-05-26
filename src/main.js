// Цифроугольники — главный файл
// Шаг 1: палитра всех фигурок

export const VERSION = '0.2.7';

const LEVELS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

// Цвета по схеме Макса.
const COLORS = {
  2:    '#FF8C00', // оранжевый
  4:    '#43A047', // зелёный
  8:    '#FF6FA8', // розовый
  16:   '#C71585', // фиолетово-красный
  32:   '#FFC107', // жёлто-оранжевый
  64:   '#2196F3', // синий
  128:  '#00BCD4', // голубой
  256:  '#7C4DFF', // фиолетовый
  512:  '#FF5252', // ярко-красный
  1024: '#FFD700', // золото
};

function colorFor(value) {
  return COLORS[value] || '#888';
}

// Сколько сторон у фигурки. 2 — особый случай (прямоугольник).
// Остальные — ровно столько сторон, сколько в числе.
function sidesFor(value) {
  if (value === 2) return 2;
  return value;
}

// Координаты вершин правильного многоугольника — массив {x, y}
function polygonVertices(sides, cx, cy, r) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  return pts;
}

// Те же вершины в виде строки "x,y x,y ..." для атрибута points
function polygonPointsStr(vertices) {
  return vertices.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

// SVG-кружки в каждой вершине — чтобы было видно, сколько углов.
function dotsAt(vertices, radius) {
  return vertices
    .map(p => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${radius}" fill="#000"/>`)
    .join('');
}

// Радиус точки: чем больше углов — тем меньше точка, чтобы они не сливались.
// Учитываем zoom браузера: при увеличении масштаба devicePixelRatio растёт,
// и мы уменьшаем минимальный радиус, чтобы точки у 1024-угольника не слипались.
function dotRadiusFor(sides, polygonR) {
  const spacing = (2 * Math.PI * polygonR) / sides;
  const baselineDPR = 2;
  const dpr = window.devicePixelRatio || 1;
  const zoomCompensation = Math.max(1, dpr / baselineDPR);
  const minR = 0.4 / zoomCompensation;
  return Math.max(minR, Math.min(3, spacing / 2));
}

// SVG для одной фигурки заданного значения
function tileSvg(value) {
  const color = colorFor(value);
  const sides = sidesFor(value);
  const stroke = 'stroke="#fff" stroke-width="1.2" stroke-linejoin="miter"';

  // Отрезок (число 2) — палочка с двумя концами-точками
  if (value === 2) {
    const ends = [
      { x: 12, y: 50 },
      { x: 88, y: 50 },
    ];
    return `<svg viewBox="0 0 100 100">
      <line x1="12" y1="50" x2="88" y2="50" stroke="${color}" stroke-width="8" stroke-linecap="round"/>
      ${dotsAt(ends, 2.5)}
    </svg>`;
  }

  const polygonR = 46;
  const verts = polygonVertices(sides, 50, 50, polygonR);
  const dotR = dotRadiusFor(sides, polygonR);
  return `<svg viewBox="0 0 100 100">
    <polygon points="${polygonPointsStr(verts)}" fill="${color}" ${stroke}/>
    ${dotsAt(verts, dotR)}
  </svg>`;
}

// HTML-элемент одной фигурки (с числом сверху)
function tileElement(value) {
  const el = document.createElement('div');
  el.className = 'tile';
  el.innerHTML = `${tileSvg(value)}<span class="label">${value}</span>`;
  return el;
}

// Палитра — все фигурки от 2 до 1024
function renderPalette() {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  for (const value of LEVELS) {
    palette.appendChild(tileElement(value));
  }
}

renderPalette();

// При zoom браузер выстреливает resize — перерисовываем палитру,
// чтобы пересчитать размер точек под новый devicePixelRatio.
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderPalette, 100);
});

// Версия в углу страницы — чтобы видеть какой билд открыт
const versionEl = document.createElement('div');
versionEl.className = 'version';
versionEl.textContent = `v${VERSION}`;
document.body.appendChild(versionEl);
