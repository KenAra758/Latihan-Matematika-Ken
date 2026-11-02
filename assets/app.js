(function () {
  'use strict';

  const TZ = 'Asia/Jakarta';
  const DAY = 86400000;
  const LETTERS = 'ABCDEFGHIJKLMNOP';
  const state = {
    config: null,
    bank: null,
    tab: 'minggu',
    viewWeek: null,
    draft: {},
    // Semua data latihan disimpan di Firebase: /k/<PIN>/math/{level, weeks/w<N>, att/w<N>/<idSoal>}
    sync: { url: null, pin: null, ok: false, error: null },
    data: { level: null, weeks: {}, att: {} },
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (_) { /* storage tidak tersedia */ }
    return null;
  }

  function rankClass(r) {
    if (r == null) return '';
    if (r < 1000) return 'r-gray';
    if (r < 1300) return 'r-green';
    if (r < 1600) return 'r-cyan';
    if (r < 1900) return 'r-blue';
    if (r < 2200) return 'r-violet';
    if (r < 2500) return 'r-orange';
    return 'r-red';
  }

  const fmtDate = (ms, opts) => new Intl.DateTimeFormat('id-ID', { timeZone: TZ, ...opts }).format(new Date(ms));
  const fmtIso = (iso, opts) => new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', ...opts }).format(new Date(iso + 'T00:00:00Z'));
  const minutes = (ms) => Math.max(1, Math.round(ms / 60000));
  const sameLevel = (a, b) => a && b && a.min === b.min && a.max === b.max;

  // ---------- Kalender minggu (Senin 00.00 WIB) ----------
  function weekZero() {
    const [y, m, d] = state.config.startDate.split('-').map(Number);
    return Date.UTC(y, m - 1, d) - 7 * 3600000;
  }
  const weekStartMs = (n) => weekZero() + (n - 1) * 7 * DAY;
  const currentWeekNo = () => Math.floor((Date.now() - weekZero()) / (7 * DAY)) + 1;
  const isoWib = (ms) => new Date(ms + 7 * 3600000).toISOString().slice(0, 10);

  const weekObj = (n) => state.data.weeks[`w${n}`] || null;
  const sortedWeeks = () => Object.values(state.data.weeks).filter(Boolean).sort((a, b) => a.week - b.week);
  const attOf = (n, id) => state.data.att[`w${n}`]?.[id] || null;
  const currentLevel = () => state.data.level || state.config.level;

  // ---------- Firebase ----------
  const mathBase = () => `${state.sync.url.replace(/\/$/, '')}/k/${encodeURIComponent(state.sync.pin)}/math`;

  async function syncLoad() {
    const sy = state.sync;
    if (!sy.url || !sy.pin) { sy.ok = false; return false; }
    try {
      const res = await fetch(`${mathBase()}.json`, { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) { sy.ok = false; sy.error = 'PIN salah'; return false; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = (await res.json()) || {};
      const next = { level: raw.level || null, weeks: raw.weeks || {}, att: raw.att || {} };
      const changed = !sy.ok || JSON.stringify(next) !== JSON.stringify(state.data);
      state.data = next;
      sy.ok = true;
      sy.error = null;
      return changed;
    } catch (e) {
      sy.error = 'Tidak bisa terhubung';
      return false;
    }
  }

  async function fbWrite(path, value) {
    const res = await fetch(`${mathBase()}/${path}.json`, {
      method: value == null ? 'DELETE' : 'PUT',
      body: value == null ? undefined : JSON.stringify(value),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }

  async function saveAtt(n, id, value) {
    const g = `w${n}`;
    state.data.att[g] = state.data.att[g] || {};
    if (value == null) delete state.data.att[g][id];
    else state.data.att[g][id] = value;
    renderAll();
    try {
      await fbWrite(`att/${g}/${id}`, value);
    } catch (_) {
      showBanner('Jawaban belum tersimpan karena koneksi bermasalah. Coba lagi sebentar lagi.');
      await syncLoad();
      renderAll();
    }
  }

  function showBanner(text) {
    $('banner').textContent = text;
    $('banner').hidden = !text;
  }

  // ---------- Status soal ----------
  function statusOf(id, w) {
    const a = attOf(w.week, id);
    if (!a) return { kind: 'todo' };
    const base = { att: a, took: a.s && a.at ? a.at - a.s : null };
    if (a.v === 'benar') return { ...base, kind: a.vt <= w.deadline * 1000 ? 'ok' : 'late' };
    if (a.v === 'salah') return { ...base, kind: 'wrong' };
    if (a.v === 'lewat') return { ...base, kind: 'skip' };
    if (a.a != null) return { ...base, kind: 'answered' };
    return { ...base, kind: 'started', since: Date.now() - a.s };
  }

  function weekScore(w) {
    const sc = { count: w.problems.length, onTime: 0, late: 0, total: 0, judged: 0 };
    w.problems.forEach((p) => {
      const s = statusOf(p.id, w);
      if (s.kind === 'ok') sc.onTime++;
      if (s.kind === 'late') sc.late++;
      if (['ok', 'late', 'wrong', 'skip'].includes(s.kind)) sc.judged++;
    });
    sc.total = sc.onTime + sc.late;
    return sc;
  }

  function bonusScore(w) {
    const list = w.bonus || [];
    const done = list.filter((p) => ['ok', 'late'].includes(statusOf(p.id, w).kind)).length;
    return { done, count: list.length };
  }

  // ---------- Pembuatan paket mingguan ----------
  // Acak tapi pasti: data yang sama selalu menghasilkan paket yang sama, jadi dua perangkat
  // yang membuat paket bersamaan akan menulis isi yang identik.
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generateWeek(n, opts = {}) {
    const cfg = state.config;
    const rule = cfg.autoPromote || {};
    const prevWeeks = sortedWeeks().filter((w) => w.week < n);
    const prev = prevWeeks[prevWeeks.length - 1];
    let level = opts.level || currentLevel();
    let levelChange = null;

    if (!opts.level && rule.enabled) {
      const recent = [];
      for (let i = 1; i <= rule.consecutiveWeeks; i++) { const w = weekObj(n - i); if (!w) break; recent.push(w); }
      const cap = rule.maxRatingCap || 2700;
      if (recent.length === rule.consecutiveWeeks && level.max < cap &&
          recent.every((w) => sameLevel(w.level, level) && weekScore(w).onTime >= rule.minSolved)) {
        const to = { min: level.min + rule.step, max: Math.min(level.max + rule.step, cap) };
        levelChange = { type: 'auto', from: level, to };
        level = to;
      }
    }
    if (!levelChange && prev && !sameLevel(prev.level, level)) levelChange = { type: 'manual', from: prev.level, to: level };

    // Riwayat kemunculan soal di minggu-minggu sebelumnya.
    const seen = new Set();
    const app = new Map();
    const solvedEver = new Set();
    sortedWeeks().forEach((w) => {
      [...w.problems, ...(w.bonus || [])].forEach((p) => seen.add(p.id));
      if (w.week >= n) return;
      const note = (p, kind) => {
        const e = app.get(p.id) || { count: 0, last: 0, kind };
        e.count++; e.last = Math.max(e.last, w.week);
        app.set(p.id, e);
      };
      w.problems.forEach((p) => note(p, 'main'));
      (w.bonus || []).forEach((p) => note(p, 'bonus'));
    });
    Object.values(state.data.att).forEach((g) => Object.entries(g || {}).forEach(([id, a]) => {
      seen.add(id);
      if (a && a.v === 'benar') solvedEver.add(id);
    }));

    const rand = rng(hashStr(`${n}:${level.min}-${level.max}:${opts.regen || 0}`));
    const used = new Set();
    const famUsed = {};
    const paperUsed = {};
    const take = (p) => { used.add(p.id); famUsed[p.family] = (famUsed[p.family] || 0) + 1; paperUsed[p.paper] = 1; return p; };

    function pickFresh(target) {
      for (const tol of [60, 120, 250, 500]) {
        const cands = state.bank.list.filter((p) => !seen.has(p.id) && !used.has(p.id) && Math.abs(p.rating - target) <= tol);
        if (!cands.length) continue;
        // Utamakan naskah & jenis lomba yang belum ada di paket, supaya soalnya bervariasi.
        const weights = cands.map((p) => (paperUsed[p.paper] ? 0.1 : 1) / (1 + 2 * (famUsed[p.family] || 0)));
        let r = rand() * weights.reduce((x, y) => x + y, 0);
        for (let i = 0; i < cands.length; i++) { r -= weights[i]; if (r <= 0) return take(cands[i]); }
        return take(cands[cands.length - 1]);
      }
      return null;
    }

    function recycleFrom(kind, max) {
      const rc = cfg.recycle || {};
      if (!rc.enabled || !max) return [];
      return [...app.entries()]
        .filter(([id, e]) => e.kind === kind && !solvedEver.has(id) && state.bank.byId.has(id) &&
          e.last <= n - 1 - rc.gapWeeks && e.count < rc.maxAppearances)
        .sort((a, b) => a[1].last - b[1].last || state.bank.byId.get(a[0]).rating - state.bank.byId.get(b[0]).rating)
        .slice(0, max)
        .map(([id, e]) => ({ p: take(state.bank.byId.get(id)), rep: e.count + 1 }));
    }

    const N = cfg.problemsPerWeek;
    const targets = Array.from({ length: N }, (_, i) => Math.round(level.min + (N === 1 ? 0 : (level.max - level.min) * i / (N - 1))));
    const main = recycleFrom('main', cfg.recycle?.maxPerWeek || 0);
    main.forEach((r) => {
      let best = 0;
      targets.forEach((t, i) => { if (Math.abs(t - r.p.rating) < Math.abs(targets[best] - r.p.rating)) best = i; });
      targets.splice(best, 1);
    });
    targets.forEach((t) => { const p = pickFresh(t); if (p) main.push({ p }); });

    const bonus = [];
    const bc = cfg.bonus || {};
    if (bc.enabled && bc.perWeek) {
      bonus.push(...recycleFrom('bonus', Math.min(cfg.recycle?.maxBonusPerWeek || 0, bc.perWeek)));
      for (let j = bonus.length; j < bc.perWeek; j++) {
        const p = pickFresh(Math.round(level.max + (bc.above * (j + 1)) / bc.perWeek));
        if (p) bonus.push({ p });
      }
    }

    const toEntry = (r, label) => (r.rep ? { id: r.p.id, label, rep: r.rep } : { id: r.p.id, label });
    const byRating = (a, b) => a.p.rating - b.p.rating;
    const start = weekStartMs(n);
    const week = {
      week: n,
      start: isoWib(start),
      end: isoWib(start + 6 * DAY),
      deadline: (start + 7 * DAY) / 1000,
      level,
      generatedAt: new Date().toISOString(),
      regen: opts.regen || 0,
      problems: main.sort(byRating).map((r, i) => toEntry(r, LETTERS[i])),
      bonus: bonus.sort(byRating).map((r, i) => toEntry(r, `B${i + 1}`)),
    };
    if (levelChange) week.levelChange = levelChange;
    return week;
  }

  async function saveWeek(week) {
    state.data.weeks[`w${week.week}`] = week;
    const lvlChanged = !sameLevel(state.data.level, week.level);
    state.data.level = week.level;
    await fbWrite(`weeks/w${week.week}`, week);
    if (lvlChanged) await fbWrite('level', week.level);
  }

  async function ensureCurrentWeek() {
    const n = currentWeekNo();
    if (n < 1 || weekObj(n)) return;
    try {
      await saveWeek(generateWeek(n));
    } catch (_) {
      showBanner('Paket minggu ini belum bisa disimpan ke database. Periksa koneksi atau aturan Firebase untuk jalur /k/<PIN>/math.');
    }
  }

  // ---------- Render: kotak PIN ----------
  function renderSyncBox() {
    const el = $('sync');
    const sy = state.sync;
    if (!sy.url) { el.hidden = false; el.innerHTML = '<p class="sync-err">Alamat Firebase belum diisi di config.json.</p>'; return; }
    el.hidden = false;
    if (sy.ok) {
      el.innerHTML = `<span class="sync-ok">● Perangkat ini tersambung</span> <button class="link-btn" data-sync="logout">Putuskan</button>`;
      return;
    }
    if (document.activeElement?.id === 'sync-pin') return;
    el.innerHTML = `<form class="sync-form" id="sync-form">
        <label for="sync-pin">Masukkan PIN keluarga (sama dengan dashboard OSN Informatika) untuk membuka paket soal dan menyimpan jawaban:</label>
        <div class="sync-row">
          <input id="sync-pin" type="password" autocomplete="off" placeholder="PIN" required>
          <button type="submit" class="btn-ghost">Sambungkan</button>
        </div>
        ${sy.error ? `<p class="sync-err">${esc(sy.error)}. Periksa lagi PIN-nya.</p>` : ''}
      </form>`;
  }

  // ---------- Render: profil ----------
  function renderProfile() {
    const lvl = currentLevel();
    const weeks = sortedWeeks();
    const solved = new Set();
    weeks.forEach((w) => [...w.problems, ...(w.bonus || [])].forEach((p) => {
      if (['ok', 'late'].includes(statusOf(p.id, w).kind)) solved.add(p.id);
    }));
    $('profile').innerHTML = `
      <span class="chip">Level <span class="mono ${rankClass(lvl.max)}">${lvl.min}–${lvl.max}</span></span>
      <span class="chip"><span class="mono">${solved.size}</span> soal benar</span>
      <span class="chip muted">Bank <span class="mono">${state.bank.list.length.toLocaleString('id-ID')}</span> soal</span>`;
  }

  // ---------- Render: minggu ----------
  function familyNote(p) {
    return p.type === 'integer' ? 'Isian 0–999' : 'Pilihan ganda A–E';
  }

  function answerForm(p, w, s) {
    const key = `${w.week}|${p.id}`;
    const draft = state.draft[key];
    const input = p.type === 'integer'
      ? `<input class="aime-input" type="number" inputmode="numeric" min="0" max="999" step="1" placeholder="0–999" data-aime="${key}" value="${draft != null ? esc(draft) : ''}" aria-label="Jawaban (0–999)">`
      : `<span class="choices" role="group" aria-label="Pilihan jawaban">${'ABCDE'.split('').map((c) =>
          `<button type="button" class="choice" data-act="pick" data-val="${c}" aria-pressed="${draft === c}">${c}</button>`).join('')}</span>`;
    const canSave = p.type === 'integer' || draft;
    return `<div class="p-work">
      <div class="answer-row">
        ${input}
        <button type="button" class="mini-btn primary" data-act="save" ${canSave ? '' : 'disabled'}>Simpan jawaban</button>
        <button type="button" class="link-btn muted-btn" data-act="skip">Belum bisa, lewati</button>
      </div>
      <small class="muted">Mulai ${fmtDate(s.att.s, { weekday: 'short', hour: '2-digit', minute: '2-digit' })} · sudah ${minutes(Date.now() - s.att.s)} menit ·
        <button type="button" class="link-btn" data-act="unstart">batal</button></small>
    </div>`;
  }

  function judgeForm(p, s) {
    return `<div class="p-work">
      <p class="answer-line">Jawabanmu: <b class="mono">${esc(s.att.a)}</b>${s.took ? ` · ${minutes(s.took)} menit` : ''}</p>
      <div class="answer-row">
        <a class="mini-btn" href="${p.keyUrl}" target="_blank" rel="noopener">Buka kunci jawaban ↗</a>
        <span class="muted small">lalu tandai:</span>
        <button type="button" class="mini-btn ok" data-act="benar">✓ Benar</button>
        <button type="button" class="mini-btn bad" data-act="salah">✗ Salah</button>
        <button type="button" class="link-btn" data-act="reanswer">Ubah jawaban</button>
      </div>
    </div>`;
  }

  function problemRow(p, entry, w) {
    const s = statusOf(p.id, w);
    const rep = entry.rep ? `<span class="repeat" title="Soal ini pernah muncul dan belum benar">↻ Ulangan ke-${entry.rep - 1}</span>` : '';
    let status;
    let work = '';
    const detail = s.att?.a != null ? `Jawab ${esc(s.att.a)}${s.took ? ` · ${minutes(s.took)} mnt` : ''}` : '';
    const after = `<small><a href="${p.solutionUrl}" target="_blank" rel="noopener">Pembahasan ↗</a> · <button class="link-btn" data-act="unjudge">ubah</button></small>`;
    if (s.kind === 'ok') status = `<span class="status ok">Benar</span><small>${detail}</small>${after}`;
    else if (s.kind === 'late') status = `<span class="status late">Susulan</span><small>${detail}</small>${after}`;
    else if (s.kind === 'wrong') status = `<span class="status tried">Salah</span><small>${detail}</small>${after}`;
    else if (s.kind === 'skip') status = `<span class="status todo">Dilewati</span>${after}`;
    else if (s.kind === 'answered') { status = `<span class="status check">Cek kunci</span>`; work = judgeForm(p, s); }
    else if (s.kind === 'started') { status = `<span class="status working">Dikerjakan</span>`; work = answerForm(p, w, s); }
    else status = `<a class="mini-btn primary" href="${p.url}" target="_blank" rel="noopener" data-act="start">Kerjakan ↗</a>`;
    const rowClass = { ok: 'solved', late: 'late', wrong: 'wrong', started: 'inprogress', answered: 'inprogress' }[s.kind] || '';
    return `<li class="problem ${rowClass}" data-pid="${esc(p.id)}" data-week="${w.week}">
      <span class="p-label">${esc(entry.label)}</span>
      <div class="p-main">
        <a class="p-name" href="${p.url}" target="_blank" rel="noopener" data-act="start">${esc(p.name)}</a>
        <div class="p-sub">
          <span class="rating ${rankClass(p.rating)}">${p.rating}</span>
          <span>${familyNote(p)}</span>
          ${rep}
        </div>
      </div>
      <div class="p-status">${status}</div>
      ${work}
    </li>`;
  }

  function renderWeek() {
    const weeks = sortedWeeks();
    const list = $('problems');
    const settingsEl = $('settings');
    settingsEl.hidden = !state.sync.ok;
    if (!weeks.length) {
      const n = currentWeekNo();
      $('week-title').textContent = 'Belum ada paket soal';
      $('week-dates').textContent = !state.sync.ok
        ? 'Sambungkan perangkat dengan PIN keluarga untuk membuka paket soal.'
        : n < 1 ? `Paket pertama muncul ${fmtDate(weekZero(), { weekday: 'long', day: 'numeric', month: 'long' })}.` : 'Menyiapkan paket…';
      list.innerHTML = '<li class="empty">Soal minggu ini akan muncul di sini.</li>';
      $('week-score').textContent = `0/${state.config.problemsPerWeek}`;
      $('week-meter').style.width = '0';
      $('prev-week').disabled = $('next-week').disabled = true;
      $('levelup').hidden = true;
      $('bonus').hidden = true;
      $('bonus-score').hidden = true;
      $('countdown').textContent = '';
      $('working').hidden = true;
      return;
    }
    if (state.viewWeek == null || !weekObj(state.viewWeek)) state.viewWeek = weeks[weeks.length - 1].week;
    const w = weekObj(state.viewWeek);
    const idx = weeks.indexOf(w);
    const isCurrent = w.week === currentWeekNo();
    $('prev-week').disabled = idx <= 0;
    $('next-week').disabled = idx >= weeks.length - 1;
    $('week-title').textContent = `Minggu ke-${w.week}${isCurrent ? ' · minggu ini' : ''}`;
    $('week-dates').textContent =
      `${fmtIso(w.start, { day: 'numeric', month: 'short' })} – ${fmtIso(w.end, { day: 'numeric', month: 'short', year: 'numeric' })} · rating ${w.level.min}–${w.level.max}`;

    const sc = weekScore(w);
    $('week-score').textContent = `${sc.total}/${sc.count}`;
    $('week-meter').style.width = `${sc.count ? (sc.total / sc.count) * 100 : 0}%`;

    const left = w.deadline * 1000 - Date.now();
    if (left > 0) {
      const d = Math.floor(left / DAY), h = Math.floor((left % DAY) / 3600000);
      $('countdown').textContent = `Sisa waktu ${d} hari ${h} jam · berakhir ${fmtDate(w.deadline * 1000 - 1000, { weekday: 'long', hour: '2-digit', minute: '2-digit' })} WIB`;
    } else {
      $('countdown').textContent = `Minggu ini sudah selesai · ${sc.onTime} tepat waktu, ${sc.late} susulan. Soal yang belum dijawab masih boleh dikerjakan.`;
    }

    // Jangan gambar ulang baris saat Ken sedang mengetik jawaban AIME.
    if (!list.contains(document.activeElement) || document.activeElement.tagName !== 'INPUT') {
      list.innerHTML = w.problems.map((e) => {
        const p = state.bank.byId.get(e.id);
        return p ? problemRow(p, e, w) : '';
      }).join('');
      renderBonus(w);
    }
    renderWorking(w);
    renderLevelUp(isCurrent);
  }

  function renderBonus(w) {
    const list = w.bonus || [];
    $('bonus').hidden = !list.length;
    $('bonus-score').hidden = !list.length;
    if (!list.length) return;
    const bs = bonusScore(w);
    $('bonus-score').textContent = `+ Bonus: ${bs.done}/${bs.count}`;
    $('bonus-list').innerHTML = list.map((e) => {
      const p = state.bank.byId.get(e.id);
      return p ? problemRow(p, e, w) : '';
    }).join('');
  }

  function renderWorking(w) {
    const el = $('working');
    const all = [...w.problems, ...(w.bonus || [])];
    const active = all.filter((e) => statusOf(e.id, w).kind === 'started').map((e) => e.label);
    const toCheck = all.filter((e) => statusOf(e.id, w).kind === 'answered').map((e) => e.label);
    const parts = [];
    if (active.length) parts.push(`<span class="dot-live" aria-hidden="true"></span><strong>Sedang dikerjakan: ${active.join(', ')}</strong>`);
    if (toCheck.length) parts.push(`<span>Belum dicek kuncinya: ${toCheck.join(', ')}</span>`);
    el.hidden = !parts.length;
    el.innerHTML = parts.join('<span class="muted"> · </span>');
  }

  function renderLevelUp(isCurrent) {
    const el = $('levelup');
    const rule = state.config.autoPromote;
    if (!rule?.enabled || !isCurrent) { el.hidden = true; return; }
    el.hidden = false;
    const lvl = currentLevel();
    const atLevel = sortedWeeks().filter((w) => sameLevel(w.level, lvl));
    const pips = atLevel.slice(-rule.consecutiveWeeks).map((w) => {
      const sc = weekScore(w);
      return `<span class="pip ${sc.onTime >= rule.minSolved ? 'done' : ''}">M${w.week}: ${sc.onTime}/${sc.count}</span>`;
    }).join('');
    el.innerHTML = `
      <p><strong>Target naik level:</strong> jawab benar minimal ${rule.minSolved} dari ${state.config.problemsPerWeek} soal
      tepat waktu selama ${rule.consecutiveWeeks} minggu berturut-turut, maka paket berikutnya naik ke rating
      <strong>${lvl.min + rule.step}–${lvl.max + rule.step}</strong>.</p>
      <div class="pips">${pips}</div>`;
  }

  // ---------- Render: riwayat ----------
  function renderHistory() {
    const body = $('history-body');
    const weeks = sortedWeeks();
    if (!weeks.length) { body.innerHTML = '<tr><td colspan="7" class="empty">Belum ada riwayat.</td></tr>'; return; }
    const rows = [];
    [...weeks].reverse().forEach((w) => {
      const sc = weekScore(w);
      const bs = bonusScore(w);
      rows.push(`<tr>
        <td>Minggu ${w.week}</td>
        <td>${fmtIso(w.start, { day: 'numeric', month: 'short' })} – ${fmtIso(w.end, { day: 'numeric', month: 'short', year: '2-digit' })}</td>
        <td class="mono">${w.level.min}–${w.level.max}</td>
        <td class="num">${sc.onTime}/${sc.count}</td>
        <td class="num">${sc.total}/${sc.count}</td>
        <td class="num">${bs.count ? `${bs.done}/${bs.count}` : '–'}</td>
        <td><button class="link-btn" data-open="${w.week}">Lihat</button></td>
      </tr>`);
      if (w.levelChange) {
        const lc = w.levelChange;
        const why = lc.type === 'auto' ? 'Naik level otomatis' : 'Level diubah manual';
        rows.push(`<tr class="lvl"><td colspan="7">${why}: ${lc.from.min}–${lc.from.max} → <strong>${lc.to.min}–${lc.to.max}</strong> mulai minggu ${w.week}</td></tr>`);
      }
    });
    body.innerHTML = rows.join('');
  }

  // ---------- Render: statistik ----------
  function renderStats() {
    const weeks = sortedWeeks();
    // Soal ulangan muncul di beberapa minggu; ambil status terakhirnya saja.
    const latest = new Map();
    const tries = [];
    weeks.forEach((w) => [...w.problems, ...(w.bonus || [])].forEach((e) => {
      const p = state.bank.byId.get(e.id);
      if (!p) return;
      const s = statusOf(e.id, w);
      if (s.kind !== 'todo') latest.set(e.id, { p, s, bonus: (w.bonus || []).includes(e) });
      if (['ok', 'late', 'wrong', 'skip'].includes(s.kind)) tries.push({ p, s });
    }));
    const items = [...latest.values()];
    const isOk = (s) => s.kind === 'ok' || s.kind === 'late';
    const judged = tries.length;
    const right = tries.filter((t) => isOk(t.s)).length;
    const times = tries.filter((t) => isOk(t.s) && t.s.took).map((t) => t.s.took).sort((a, b) => a - b);
    const median = times.length ? minutes(times[Math.floor(times.length / 2)]) : null;

    let streak = 0;
    const cur = currentWeekNo();
    for (let n = cur; n >= 1; n--) {
      const w = weekObj(n);
      if (!w) { if (n === cur) continue; break; }
      const sc = weekScore(w);
      if (sc.total >= Math.ceil(sc.count / 2)) streak++;
      else if (n !== cur) break;
    }

    $('stat-tiles').innerHTML = [
      [items.filter((x) => isOk(x.s)).length, 'soal berbeda dijawab benar'],
      [judged ? `${Math.round((right / judged) * 100)}%` : '–', `ketepatan (${right} dari ${judged} jawaban)`],
      [streak, 'minggu beruntun ≥ 50%'],
      [median ? `${median}′` : '–', 'waktu tengah per soal benar'],
      [items.filter((x) => x.bonus && isOk(x.s)).length, 'bonus tantangan benar'],
    ].map(([v, l]) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`).join('');

    renderChart(weeks);

    const ratioBars = (ul, groups, nameCls) => {
      ul.innerHTML = groups.length ? groups.map(([name, d, t, cls]) => `<li>
        <span class="name ${cls || ''}">${esc(name)}</span>
        <span class="track"><span class="fill" style="width:${(d / t) * 100}%"></span></span>
        <span class="val">${d}/${t}</span></li>`).join('') : '<li class="muted">Belum ada soal yang dinilai.</li>';
    };
    const fam = new Map();
    tries.forEach(({ p, s }) => {
      const e = fam.get(p.family) || [0, 0];
      e[1]++; if (isOk(s)) e[0]++;
      fam.set(p.family, e);
    });
    ratioBars($('family-bars'), Object.keys(state.bank.families).filter((f) => fam.has(f))
      .map((f) => [state.bank.families[f].name, ...fam.get(f)]));
    const band = new Map();
    tries.forEach(({ p, s }) => {
      const b = Math.floor(p.rating / 200) * 200;
      const e = band.get(b) || [0, 0];
      e[1]++; if (isOk(s)) e[0]++;
      band.set(b, e);
    });
    ratioBars($('rating-bars'), [...band.entries()].sort((a, b) => a[0] - b[0])
      .map(([b, [d, t]]) => [`${b}–${b + 199}`, d, t, `rating ${rankClass(b)}`]));
  }

  function renderChart(weeks) {
    const el = $('chart');
    if (!weeks.length) { el.innerHTML = '<p class="muted">Grafik muncul setelah minggu pertama.</p>'; return; }
    const maxN = Math.max(...weeks.map((w) => w.problems.length), 1);
    const barW = 28, gap = 14, padL = 28, padB = 24, padT = 10, h = 180;
    const width = Math.max(300, padL + weeks.length * (barW + gap) + gap);
    const y = (v) => padT + (h - padT - padB) * (1 - v / maxN);
    let svg = `<svg width="${width}" height="${h}" viewBox="0 0 ${width} ${h}" role="img" aria-label="Soal benar per minggu">`;
    for (let v = 0; v <= maxN; v += Math.max(1, Math.round(maxN / 4))) {
      svg += `<line class="grid" x1="${padL}" x2="${width}" y1="${y(v)}" y2="${y(v)}"/><text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    }
    weeks.forEach((w, i) => {
      const sc = weekScore(w);
      const x = padL + gap + i * (barW + gap);
      if (sc.onTime) svg += `<rect class="bar-on" x="${x}" y="${y(sc.onTime)}" width="${barW}" height="${y(0) - y(sc.onTime)}" rx="3"><title>Minggu ${w.week}: ${sc.onTime} tepat waktu</title></rect>`;
      if (sc.late) svg += `<rect class="bar-late" x="${x}" y="${y(sc.total)}" width="${barW}" height="${y(sc.onTime) - y(sc.total)}" rx="3"><title>Minggu ${w.week}: ${sc.late} susulan</title></rect>`;
      svg += `<text x="${x + barW / 2}" y="${h - 6}" text-anchor="middle">M${w.week}</text>`;
    });
    el.innerHTML = svg + '</svg>';
  }

  // ---------- Render: sumber belajar ----------
  const SOURCES = [
    { group: 'Latihan di AoPS', items: [
      ['Alcumus', 'https://artofproblemsolving.com/alcumus', 'Latihan adaptif gratis per topik, langsung dinilai. Mulai dari Prealgebra atau Introduction to Algebra.'],
      ['Arsip AMC 8', 'https://artofproblemsolving.com/wiki/index.php/AMC_8_Problems_and_Solutions', 'Semua naskah AMC 8 dengan kunci dan pembahasan. Cocok untuk simulasi 25 soal / 40 menit.'],
      ['Arsip AMC 10', 'https://artofproblemsolving.com/wiki/index.php/AMC_10_Problems_and_Solutions', 'Langkah berikutnya setelah AMC 8 lancar.'],
      ['Arsip AIME', 'https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions', 'Soal isian 0–999, tingkat lanjut.'],
      ['Contest Collections', 'https://artofproblemsolving.com/community/c13_contest_collections', 'Arsip soal olimpiade banyak negara. Soal OSN SMP ada di koleksi "Indonesia Juniors".'],
    ] },
    { group: 'Lomba lokal & luar negeri', items: [
      ['OSN (Puspresnas)', 'https://pusatprestasinasional.kemdikbud.go.id', 'Pedoman, jadwal, dan syarat OSN resmi. Soal OSN-K/OSN-P tahun lalu biasanya dibagikan guru pembina.'],
      ['SIMCC, SEAMO, LMNAS', null, 'Naskah soalnya tidak diterbitkan bebas di internet. Gunakan buku latihan atau naskah dari penyelenggara/bimbel. Tingkat AMC 8–AMC 10 di sini sudah sejalan dengan lomba-lomba tersebut.'],
    ] },
  ];

  function renderSources() {
    $('sources').innerHTML = SOURCES.map((g) => `<section class="topic-block">
      <h2>${esc(g.group)}</h2>
      <ul class="source-list">${g.items.map(([name, url, note]) => `<li>
        ${url ? `<a class="c-name" href="${url}" target="_blank" rel="noopener">${esc(name)} ↗</a>` : `<span class="c-name">${esc(name)}</span>`}
        <p class="muted small">${esc(note)}</p></li>`).join('')}</ul>
    </section>`).join('') + `<p class="muted small">Rating di aplikasi ini adalah perkiraan dari jenis lomba dan nomor soal:
      AJHSME 500–1460, AMC 8 600–1560, AMC 10 900–2100, AMC 12 1100–2420, AIME 1700–2680.</p>`;
  }

  function renderSettings() {
    const lvl = currentLevel();
    if (document.activeElement?.closest?.('#level-form')) return;
    $('lvl-min').value = lvl.min;
    $('lvl-max').value = lvl.max;
  }

  function selectTab(tab) {
    state.tab = tab;
    document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    document.querySelectorAll('.panel').forEach((p) => { p.hidden = p.id !== `panel-${tab}`; });
    store('mk_tab', tab);
  }

  function renderAll() {
    renderSyncBox();
    renderProfile();
    renderWeek();
    renderHistory();
    renderStats();
    renderSettings();
  }

  // ---------- Aksi ----------
  function rowCtx(el) {
    const li = el.closest('li[data-pid]');
    if (!li) return null;
    const n = Number(li.dataset.week);
    const w = weekObj(n);
    const p = state.bank.byId.get(li.dataset.pid);
    return w && p ? { n, w, p, a: attOf(n, p.id) || {} } : null;
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t || !state.sync.ok) return;
    const c = rowCtx(t);
    if (!c) return;
    const { n, p, a } = c;
    const now = Date.now();
    const key = `${n}|${p.id}`;
    switch (t.dataset.act) {
      case 'start':
        // Link tetap terbuka di tab baru; di sini cukup catat waktu mulai (setelah klik selesai,
        // agar baris tidak digambar ulang sebelum browser membuka link).
        if (!a.s) setTimeout(() => saveAtt(n, p.id, { s: now }), 0);
        break;
      case 'pick':
        state.draft[key] = t.dataset.val;
        renderWeek();
        break;
      case 'save': {
        let ans = state.draft[key];
        if (p.type === 'integer') {
          const input = t.closest('li').querySelector('[data-aime]');
          const v = input ? input.value.trim() : '';
          if (!/^\d{1,3}$/.test(v)) { input?.focus(); return; }
          ans = String(Number(v));
        }
        if (!ans) return;
        delete state.draft[key];
        document.activeElement?.blur();
        saveAtt(n, p.id, { s: a.s || now, a: ans, at: now });
        break;
      }
      case 'skip':
        if (!confirm('Lewati soal ini? Pembahasannya akan terbuka, dan soal ini akan muncul lagi beberapa minggu kemudian.')) return;
        saveAtt(n, p.id, { ...a, s: a.s || now, v: 'lewat', vt: now });
        break;
      case 'benar':
      case 'salah':
        saveAtt(n, p.id, { ...a, v: t.dataset.act, vt: now });
        break;
      case 'unjudge': {
        const { v, vt, ...rest } = a;
        saveAtt(n, p.id, rest.a != null || rest.s ? rest : null);
        break;
      }
      case 'reanswer':
        saveAtt(n, p.id, { s: a.s || now });
        break;
      case 'unstart':
        saveAtt(n, p.id, null);
        break;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches?.('[data-aime]')) {
      e.preventDefault();
      e.target.closest('li').querySelector('[data-act="save"]')?.click();
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.matches?.('[data-aime]')) state.draft[e.target.dataset.aime] = e.target.value;
  });

  document.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (b) selectTab(b.dataset.tab);
  });
  $('prev-week').addEventListener('click', () => {
    const ws = sortedWeeks();
    const i = ws.findIndex((w) => w.week === state.viewWeek);
    if (i > 0) { state.viewWeek = ws[i - 1].week; renderWeek(); }
  });
  $('next-week').addEventListener('click', () => {
    const ws = sortedWeeks();
    const i = ws.findIndex((w) => w.week === state.viewWeek);
    if (i < ws.length - 1) { state.viewWeek = ws[i + 1].week; renderWeek(); }
  });
  $('history-body').addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]');
    if (!b) return;
    state.viewWeek = Number(b.dataset.open);
    selectTab('minggu');
    renderWeek();
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sync="logout"]')) {
      store('syncPin', null);
      state.sync.pin = null;
      state.sync.ok = false;
      state.data = { level: null, weeks: {}, att: {} };
      renderAll();
    }
  });
  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'sync-form') return;
    e.preventDefault();
    const input = $('sync-pin');
    const pin = input.value.trim();
    if (!pin) return;
    input.blur();
    state.sync.pin = pin;
    await syncLoad();
    if (state.sync.ok) { store('syncPin', pin); await ensureCurrentWeek(); }
    else state.sync.pin = null;
    renderAll();
  });

  const weekHasAnswers = (n) => Object.keys(state.data.att[`w${n}`] || {}).length > 0;

  $('level-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const min = Math.round(Number($('lvl-min').value));
    const max = Math.round(Number($('lvl-max').value));
    const msg = $('settings-msg');
    if (!(min >= 400 && max > min)) { msg.textContent = 'Rating maksimum harus lebih besar dari minimum.'; return; }
    const level = { min, max };
    const n = currentWeekNo();
    try {
      if (weekObj(n) && !weekHasAnswers(n)) {
        await saveWeek(generateWeek(n, { level, regen: (weekObj(n).regen || 0) + 1 }));
        msg.textContent = `Level diubah ke ${min}–${max}. Paket minggu ini sudah diganti.`;
      } else {
        state.data.level = level;
        await fbWrite('level', level);
        msg.textContent = `Level diubah ke ${min}–${max}. Berlaku mulai paket minggu depan.`;
      }
    } catch (_) {
      msg.textContent = 'Gagal menyimpan. Periksa koneksi lalu coba lagi.';
    }
    renderAll();
  });

  $('regen').addEventListener('click', async () => {
    const n = currentWeekNo();
    const w = weekObj(n);
    const msg = $('settings-msg');
    if (!w) return;
    if (weekHasAnswers(n)) { msg.textContent = 'Soal minggu ini sudah ada yang dikerjakan, jadi paketnya tidak diganti.'; return; }
    if (!confirm('Ganti semua soal minggu ini dengan soal baru?')) return;
    try {
      await saveWeek(generateWeek(n, { level: w.level, regen: (w.regen || 0) + 1 }));
      msg.textContent = 'Paket minggu ini sudah diganti.';
    } catch (_) {
      msg.textContent = 'Gagal menyimpan. Periksa koneksi lalu coba lagi.';
    }
    state.viewWeek = n;
    renderAll();
  });

  async function init() {
    try {
      const res = await fetch('config.json', { cache: 'no-store' });
      state.config = await res.json();
    } catch (_) {
      showBanner('config.json tidak bisa dibaca.');
      return;
    }
    state.bank = window.MathBank.build(state.config);
    $('title').textContent = `Latihan Matematika ${state.config.displayName || ''}`.trim();
    document.title = $('title').textContent;
    renderSources();
    const savedTab = store('mk_tab');
    if (savedTab && $(`panel-${savedTab}`)) selectTab(savedTab);
    state.sync.url = state.config.firebase?.databaseURL || null;
    state.sync.pin = store('syncPin');
    renderAll();
    if (await syncLoad() || state.sync.ok) await ensureCurrentWeek();
    renderAll();
    // Ambil perubahan dari perangkat lain dan perbarui hitungan waktu setiap menit.
    setInterval(async () => {
      if (document.hidden) return;
      if (state.sync.ok) {
        await syncLoad();
        await ensureCurrentWeek();
      }
      renderAll();
    }, 60000);
  }

  init();
})();
