/* Big Belly Burgers · Bewegung, erster Blick, Leiste, Protein-Wahl (Designstudie Tasty Studios, 22.11.2026)
   Handschrift: deckend von unten herein, sobald der Bereich den Rand berührt; Fotos zoomen in ihren Rahmen;
   Überschriften rollen zeilenweise aus dem Schlitz. Idee nur dieses Hauses: «Choose your protein» –
   auf der Tafel leuchten die Preise der gewählten Patty auf wie Neon. Nur transform/opacity, nativer Scroll. */
(function () {
  var D = document, H = D.documentElement, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 0 Laufende Burger-Spalte (Hero 16): Startlage = unteres Paar schliesst unten bündig ab (Robert 22.11.2026) */
  function stromStart() {
    var lauf = D.querySelector('.strom__lauf'); if (!lauf) return;
    var k = lauf.children, strom = lauf.parentElement; if (k.length < 5) return;
    var versatz = k[2].offsetTop + k[2].offsetHeight - strom.clientHeight, runde = k[4].offsetTop - k[0].offsetTop;
    if (runde <= 0) return;
    versatz = Math.max(0, versatz);
    if (ruhig) { lauf.style.transform = 'translateY(' + (-versatz) + 'px)'; return; }
    lauf.style.setProperty('--start', (-(versatz / runde) * 46) + 's');
  }
  stromStart();
  D.querySelectorAll('.strom__lauf img').forEach(function (i) { i.loading = 'eager'; });

  /* 0b Neon-Schild und Fuss blitzen auf, sobald sie ins Bild kommen (Robert 23.11.2026) */
  function neonAn() {
    var ziele = D.querySelectorAll('.schild .neon-schild, .fuss.fu--v01');
    if (ruhig || !('IntersectionObserver' in window)) { ziele.forEach(function (e) { e.classList.add('an'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('an'); io.unobserve(e.target); } });
    }, { threshold: 0.3 });
    ziele.forEach(function (e) { io.observe(e); });
  }

  /* 0c Buchstaben-Rollen in der Leiste (UI-Fundus «Buchstaben-Rollen», 0,55 s, 16 ms je Buchstabe) */
  D.querySelectorAll('.leiste nav>a:not(.knopf)').forEach(function (a) {
    var t = a.textContent, rl = D.createElement('span'); rl.className = 'rl'; rl.setAttribute('aria-hidden', 'true');
    t.split('').forEach(function (c, k) { var i = D.createElement('i'); i.textContent = c; i.setAttribute('data-b', c); i.style.setProperty('--k', k); rl.appendChild(i); });
    a.setAttribute('aria-label', t); a.textContent = ''; a.appendChild(rl); a.classList.add('roll-host');
  });

  /* 1 Erster Blick: alles im ersten Bildschirm ist gleichzeitig da */
  function imBild(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 2; }
  var schrift = !(D.fonts && D.fonts.load), bilder = false;
  if (!schrift) Promise.all([D.fonts.load('600 1em Montserrat'), D.fonts.load('400 1em "Instrument Sans"')]).then(function () { schrift = true; if (bilder) zeigen(); }, function () { schrift = true; if (bilder) zeigen(); });
  function zeigen() {
    bilder = true; if (!schrift || H.classList.contains('bereit')) return;
    var erste = [].filter.call(D.querySelectorAll('[data-schlitz],[data-r],.bild'), imBild);
    erste.forEach(function (e) { if (e.hasAttribute('data-schlitz')) zeilen(e); });
    H.classList.remove('laed');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      H.classList.add('bereit');
      erste.forEach(function (e) { e.classList.add('da'); });
      beobachten();
      neonAn();
    }); });
  }
  function warten() {
    var erste = [].filter.call(D.querySelectorAll('img'), imBild);
    erste.forEach(function (i) { i.loading = 'eager'; i.decoding = 'sync'; });
    var offen = erste.filter(function (i) { return !(i.complete && i.naturalWidth); }).length;
    if (!offen) return zeigen();
    erste.forEach(function (i) {
      if (i.complete && i.naturalWidth) return;
      var f = function () { if (--offen <= 0) zeigen(); };
      i.addEventListener('load', f, { once: true }); i.addEventListener('error', f, { once: true });
    });
    setTimeout(zeigen, 5000);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', warten); else warten();

  /* 2 Überschriften in Zeilen (aus Bareiss, Teil 2) */
  function zeilen(h) {
    if (h.dataset.z) return; h.dataset.z = '1';
    var woerter = [];
    (function lauf(k, kl) {
      k.childNodes.forEach(function (n) {
        if (n.nodeType === 3) n.textContent.split(/\s+/).forEach(function (w) { if (w) woerter.push({ t: w, kl: kl }); });
        else if (n.nodeName === 'BR') woerter.push({ br: 1 });
        else lauf(n, n.className || kl);
      });
    })(h, '');
    h.textContent = '';
    var spans = [];
    woerter.forEach(function (w) {
      if (w.br) { h.appendChild(D.createElement('br')); return; }
      var s = D.createElement('span'); s.textContent = w.t; s.style.whiteSpace = 'nowrap'; s._w = w;
      h.appendChild(s); h.appendChild(D.createTextNode(' ')); spans.push(s);
    });
    var rows = [], top = null;
    spans.forEach(function (s) { var t = s.offsetTop; if (top === null || Math.abs(t - top) > 4) { top = t; rows.push([]); } rows[rows.length - 1].push(s._w); });
    h.textContent = '';
    rows.forEach(function (r, i) {
      var z = D.createElement('span'); z.className = 'zl';
      var inn = D.createElement('span'); inn.className = 'zi'; inn.style.setProperty('--z', i);
      r.forEach(function (w, k) {
        var t = w.t + (k < r.length - 1 ? ' ' : '');
        if (w.kl) { var s = D.createElement('span'); s.className = w.kl; s.textContent = t; inn.appendChild(s); }
        else inn.appendChild(D.createTextNode(t));
      });
      inn.normalize(); z.appendChild(inn); h.appendChild(z);
    });
  }

  /* 3 Auftritte: jedes Stück einzeln, sobald es selbst an den Rand kommt; Bilder vorher geholt */
  function beobachten() {
    var ziele = D.querySelectorAll('[data-r]:not(.da),[data-schlitz]:not(.da),.bild:not(.da)');
    if (ruhig || !('IntersectionObserver' in window)) { ziele.forEach(function (e) { if (e.hasAttribute('data-schlitz')) zeilen(e); e.classList.add('da'); }); return; }
    var vor = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; vor.unobserve(e.target); e.target.loading = 'eager'; if (e.target.decode) e.target.decode().catch(function () {}); });
    }, { rootMargin: '0px 0px 150% 0px' });
    /* 24.11.2026 flüssig: nach dem ersten Bild laden alle Bilder der Seite der Reihe nach, nicht erst kurz vor dem Rand */
    D.querySelectorAll('img[loading=lazy]').forEach(function (i) { i.loading = 'eager'; });
    /* wie CEV/Bareiss: Auftritt 12 % vor dem unteren Rand, erst mit geladenem und entpacktem Bild (höchstens 2,5 s); schon vorbeigescrollte Stücke sofort */
    function bereit(el, dann) {
      var ims = [].filter.call(el.tagName === 'IMG' ? [el] : el.querySelectorAll('img'), function (im) { return im.offsetParent !== null; });
      var n = ims.length, los = false, fertig = function () { if (!los) { los = true; dann(); } };
      if (!n) return fertig();
      var eins = function () { if (--n <= 0) fertig(); };
      ims.forEach(function (im) {
        var ent = function () { (im.decode ? im.decode() : Promise.resolve()).then(eins, eins); };
        if (im.complete && im.naturalWidth > 1) return ent();
        im.loading = 'eager'; im.addEventListener('load', ent, { once: true }); im.addEventListener('error', eins, { once: true });
      });
      setTimeout(fertig, 8000);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return; io.unobserve(e.target);
        var el = e.target;
        bereit(el, function () { el.classList.add('da'); });
      });
    }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
    ziele.forEach(function (e) { if (e.hasAttribute('data-schlitz')) zeilen(e); io.observe(e); });
  }

  /* 4 Leiste: verschwindet beim Hinunterscrollen, kommt beim Hinaufscrollen zurück */
  var leiste = D.querySelector('.leiste'), alt = scrollY, tick = 0;
  addEventListener('scroll', function () {
    if (tick) return; tick = requestAnimationFrame(function () {
      tick = 0; var y = scrollY;
      if (leiste && !leiste.classList.contains('auf')) leiste.classList.toggle('leiste--weg', y > alt && y > 160);
      alt = y;
    });
  }, { passive: true });
  var mk = D.querySelector('.menu-knopf');
  if (mk) {
    mk.addEventListener('click', function () { var auf = leiste.classList.toggle('auf'); mk.setAttribute('aria-expanded', auf); });
    D.querySelectorAll('.leiste__menu a').forEach(function (a) { a.addEventListener('click', function () { leiste.classList.remove('auf'); mk.setAttribute('aria-expanded', 'false'); }); });
  }

  /* 5 Choose your protein: die Preise der gewählten Patty leuchten auf */
  /* 5b Tapete: bei gewählter Patty leuchten einzelne Burger der Tapete auf, bei «All» gehen sie aus (Robert 23.11.2026) */
  var SVGNS = 'http://www.w3.org/2000/svg', P = '#FF2ACB', A = '#FFB23E';
  function burgerSvg(oben, mitte) {
    return '<svg viewBox="0 0 44 46" width="66" height="69" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">'
      + '<path d="M4 18c0-9 8-14 18-14s18 5 18 14z" stroke="' + oben + '"/><path d="M3 24c4 3 6-3 10 0s6-3 10 0 6-3 10 0 6-3 8 0" stroke="' + mitte + '"/>'
      + '<rect x="3" y="28" width="38" height="6" rx="3" stroke="' + oben + '"/><path d="M5 38h34c0 4-4 7-9 7H14c-5 0-9-3-9-7z" stroke="' + oben + '"/>'
      + '<path d="M15 9l1 1M22 7l1 1M29 9l1 1" stroke="' + mitte + '"/></svg>';
  }
  function leuchten(t, an) {
    var lage = t.querySelector('.tafel__leucht');
    if (!lage) { lage = D.createElement('div'); lage.className = 'tafel__leucht'; lage.setAttribute('aria-hidden', 'true'); t.insertBefore(lage, t.firstChild); }
    [].forEach.call(lage.children, function (e) { e.classList.remove('an'); setTimeout(function () { e.remove(); }, 600); });
    if (!an) return;
    var W = t.clientWidth, H = t.clientHeight, frei = [];
    function ort(e, rand) { var x = 0, y = 0, n = e; while (n && n !== t) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { left: x - rand, top: y - rand, right: x + e.offsetWidth + rand, bottom: y + e.offsetHeight + rand }; }
    var karten = [].map.call(t.querySelectorAll('.tafel__karte'), function (e) { return ort(e, 0); });
    var schrift = [].map.call(t.querySelectorAll('.tafel__kopf h2, .tafel__kopf .lead, .tafel__wahl'), function (e) { return ort(e, 14); });
    function schnitt(x, y, r) { return Math.max(0, Math.min(x + 66, r.right) - Math.max(x, r.left)) * Math.max(0, Math.min(y + 69, r.bottom) - Math.max(y, r.top)); }
    for (var ty = 0; ty < H; ty += 260) for (var tx = 0; tx < W; tx += 300) {
      [[tx + 30, ty + 30, P, A], [tx + 185, ty + 160, A, P]].forEach(function (b) {
        var x = b[0], y = b[1]; if (x + 20 > W || y + 69 > H) return;
        if (schrift.some(function (r) { return schnitt(x, y, r) > 0; })) return;
        var verdeckt = karten.reduce(function (s, r) { return s + schnitt(x, y, r); }, 0);
        if (verdeckt / (66 * 69) <= 0.85) frei.push(b);
      });
    }
    frei.sort(function () { return Math.random() - .5; });
    frei.slice(0, Math.max(10, Math.round(frei.length * .45))).forEach(function (b, i) {
      var e = D.createElement('span'); e.className = 'tafel__glut';
      e.style.left = b[0] + 'px'; e.style.top = b[1] + 'px'; e.innerHTML = burgerSvg(b[2], b[3]);
      lage.appendChild(e);
      setTimeout(function () { e.classList.add('an'); }, 40 + i * 70);
    });
  }
  D.querySelectorAll('.tafel').forEach(function (t) {
    var raster = t.querySelector('.tafel__raster');
    t.querySelectorAll('[data-wahl]').forEach(function (b) {
      b.addEventListener('click', function () {
        t.querySelectorAll('[data-wahl]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        raster.setAttribute('data-protein', b.getAttribute('data-wahl'));
        leuchten(t, b.getAttribute('data-wahl') !== 'alle');
      });
    });
    var start = t.querySelector('[data-wahl][aria-pressed="true"]');
    if (start && start.getAttribute('data-wahl') !== 'alle') {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); leuchten(t, true); } }, { threshold: 0.15 });
        io.observe(t);
      } else leuchten(t, true);
    }
  });
})();

/* Fenster: der Satz rollt hoch, sobald das Fenster ihn oben freigibt, und rollt zurück, wenn der Abschnitt davor ihn wieder deckt */
(function () {
  var fs = document.querySelectorAll('.fen'); if (!fs.length) return;
  document.documentElement.classList.add('fenjs');
  [].forEach.call(fs, function (f) {
    var t = f.querySelector('.fen__satz'); if (!t) return;
    var dran = false, pruef = function () { dran = false; var o = f.getBoundingClientRect().top, st = window.innerHeight / 2 - t.offsetHeight / 2; f.classList.toggle('zu', o > st + t.offsetHeight * 0.3); };
    pruef();
    window.addEventListener('scroll', function () { if (!dran) { dran = true; requestAnimationFrame(pruef); } }, { passive: true });
    window.addEventListener('resize', pruef, { passive: true });
  });
})();

/* Laufbänder laufen nur, solange sie im Bild sind (Handy: weniger Arbeit beim Scrollen) */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var l = document.querySelectorAll('.strom__lauf,.schild__lauf,.band__lauf,.bb__lauf,.sk__bandlauf,.m2band__lauf');
  if (!l.length) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._lauf.classList.toggle('lauf-ruht', !e.isIntersecting); }); }, { rootMargin: '20% 0px 20% 0px' });
  [].forEach.call(l, function (x) { var h = x.parentElement || x; h._lauf = x; io.observe(h); });
})();
