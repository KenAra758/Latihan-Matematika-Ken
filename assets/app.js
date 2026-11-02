(function () {
  'use strict';

  const TZ = 'Asia/Jakarta';
  const MAX_COUNT = 30;
  const state = {
    config: null,
    bank: null,
    tab: 'paket',
    viewPack: null,
    draft: {},
    // Semua data latihan disimpan di Firebase:
    // /k/<PIN>/math/{level, prefs, packs/p<N>, att/p<N>/<idSoal>}
    sync: { url: null, pin: null, ok: false, error: null },
    data: { level: null, prefs: null, packs: {}, att: {} },
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
  const minutes = (ms) => Math.max(1, Math.round(ms / 60000));
  const sameLevel = (a, b) => a && b && a.min === b.min && a.max === b.max;
  const clampCount = (n) => Math.min(MAX_COUNT, Math.max(1, Math.round(Number(n) || 0)));

  const packObj = (n) => state.data.packs[`p${n}`] || null;
  const sortedPacks = () => Object.values(state.data.packs).filter(Boolean).sort((a, b) => a.no - b.no);
  const lastPack = () => { const ps = sortedPacks(); return ps[ps.length - 1] || null; };
  const attOf = (n, id) => state.data.att[`p${n}`]?.[id] || null;
  const currentLevel = () => state.data.level || state.config.level;
  const prefs = () => ({
    count: clampCount(state.data.prefs?.count ?? state.config.problemsPerPack),
    bonus: state.data.prefs?.bonus ?? !!state.config.bonus?.enabled,
  });

  // ---------- Firebase ----------
  const mathBase = () => `${state.sync.url.replace(/\/$/, '')}/k/${encodeURIComponent(state.sync.pin)}/math`;

  async function fbWrite(path, value) {
    const res = await fetch(`${mathBase()}/${path}.json`, {
      method: value == null ? 'DELETE' : 'PUT',
      body: value == null ? undefined : JSON.stringify(value),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }

  // Versi pertama memakai paket mingguan (weeks/w<N>). Ubah sekali menjadi packs/p<N>.
  function migrateWeeks(raw) {
    if (!raw.weeks || raw.packs) return null;
    const packs = {};
    const att = {};
    Object.values(raw.weeks).filter(Boolean).forEach((w) => {
      packs[`p${w.week}`] = {
        no: w.week,
        createdAt: Date.parse(w.generatedAt) || Date.now(),
        level: w.level,
        problems: (w.problems || []).map((p, i) => ({ ...p, label: String(i + 1) })),
        bonus: w.bonus || [],
        ...(w.levelChange ? { levelChange: w.levelChange } : {}),
      };
      if (raw.att?.[`w${w.week}`]) att[`p${w.week}`] = raw.att[`w${w.week}`];
    });
    return { packs, att };
  }

  async function syncLoad() {
    const sy = state.sync;
    if (!sy.url || !sy.pin) { sy.ok = false; return false; }
    try {
      const res = await fetch(`${mathBase()}.json`, { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) { sy.ok = false; sy.error = 'PIN salah'; return false; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = (await res.json()) || {};
      const mig = migrateWeeks(raw);
      if (mig) {
        await fbWrite('packs', mig.packs);
        await fbWrite('att', Object.keys(mig.att).length ? mig.att : null);
        await fbWrite('weeks', null);
        raw.packs = mig.packs;
        raw.att = mig.att;
      }
      const next = { level: raw.level || null, prefs: raw.prefs || null, packs: raw.packs || {}, att: raw.att || {} };
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

  async function saveAtt(n, id, value) {
    const g = `p${n}`;
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
  const DONE = ['ok', 'wrong', 'skip'];

  function statusOf(id, pk) {
    const a = attOf(pk.no, id);
    if (!a) return { kind: 'todo' };
    const base = { att: a, took: a.s && a.at ? a.at - a.s : null };
    if (a.v === 'benar') return { ...base, kind: 'ok' };
    if (a.v === 'salah') return { ...base, kind: 'wrong' };
    if (a.v === 'lewat') return { ...base, kind: 'skip' };
    if (a.a != null) return { ...base, kind: 'answered' };
    return { ...base, kind: 'started' };
  }

  function packScore(pk) {
    const sc = { count: pk.problems.length, ok: 0, done: 0, finishedAt: 0 };
    pk.problems.forEach((p) => {
      const s = statusOf(p.id, pk);
      if (s.kind === 'ok') sc.ok++;
      if (DONE.includes(s.kind)) { sc.done++; sc.finishedAt = Math.max(sc.finishedAt, s.att.vt || 0); }
    });
    sc.complete = sc.count > 0 && sc.done === sc.count;
    sc.pct = sc.count ? Math.round((sc.ok / sc.count) * 100) : 0;
    return sc;
  }

  function bonusScore(pk) {
    const list = pk.bonus || [];
    return { done: list.filter((p) => statusOf(p.id, pk).kind === 'ok').length, count: list.length };
  }

  const packHasAnswers = (n) => Object.keys(state.data.att[`p${n}`] || {}).length > 0;

  // ---------- Pembuatan paket ----------
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

  // Syarat naik level: benar >= minPercent% di beberapa paket terakhir berturut-turut pada level yang sama.
  function promotionFor(n, level) {
    const rule = state.config.autoPromote || {};
    if (!rule.enabled) return null;
    const recent = [];
    for (let i = 1; i <= rule.consecutivePacks; i++) { const pk = packObj(n - i); if (!pk) break; recent.push(pk); }
    const cap = rule.maxRatingCap || 2700;
    if (recent.length === rule.consecutivePacks && level.max < cap &&
        recent.every((pk) => sameLevel(pk.level, level) && packScore(pk).pct >= rule.minPercent)) {
      return { type: 'auto', from: level, to: { min: level.min + rule.step, max: Math.min(level.max + rule.step, cap) } };
    }
    return null;
  }

  function generatePack(n, opts) {
    const cfg = state.config;
    const prev = packObj(n - 1);
    let level = opts.level || currentLevel();
    let levelChange = opts.level ? null : promotionFor(n, level);
    if (levelChange) level = levelChange.to;
    if (!levelChange && prev && !sameLevel(prev.level, level)) levelChange = { type: 'manual', from: prev.level, to: level };

    // Riwayat kemunculan soal di paket-paket sebelumnya.
    const seen = new Set();
    const app = new Map();
    const solvedEver = new Set();
    sortedPacks().forEach((pk) => {
      [...pk.problems, ...(pk.bonus || [])].forEach((p) => seen.add(p.id));
      if (pk.no >= n) return;
      const note = (p, kind) => {
        const e = app.get(p.id) || { count: 0, last: 0, kind };
        e.count++; e.last = Math.max(e.last, pk.no);
        app.set(p.id, e);
      };
      pk.problems.forEach((p) => note(p, 'main'));
      (pk.bonus || []).forEach((p) => note(p, 'bonus'));
    });
    Object.values(state.data.att).forEach((g) => Object.entries(g || {}).forEach(([id, a]) => {
      seen.add(id);
      if (a && a.v === 'benar') solvedEver.add(id);
    }));

    // Paket dibuat saat tombol diklik, jadi waktu klik ikut jadi benih acak (paket yang diganti tidak terulang).
    const rand = rng(hashStr(`${n}:${level.min}-${level.max}:${opts.count}:${Date.now()}`));
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
      if (!rc.enabled || max <= 0) return [];
      return [...app.entries()]
        .filter(([id, e]) => e.kind === kind && !solvedEver.has(id) && state.bank.byId.has(id) &&
          e.last <= n - 1 - rc.gapPacks && e.count < rc.maxAppearances)
        .sort((a, b) => a[1].last - b[1].last || state.bank.byId.get(a[0]).rating - state.bank.byId.get(b[0]).rating)
        .slice(0, max)
        .map(([id, e]) => ({ p: take(state.bank.byId.get(id)), rep: e.count + 1 }));
    }

    const N = opts.count;
    const targets = Array.from({ length: N }, (_, i) => Math.round(level.min + (N === 1 ? 0 : (level.max - level.min) * i / (N - 1))));
    // Soal ulangan paling banyak sepertiga paket.
    const main = recycleFrom('main', Math.min(cfg.recycle?.maxPerPack || 0, Math.floor(N / 3)));
    main.forEach((r) => {
      let best = 0;
      targets.forEach((t, i) => { if (Math.abs(t - r.p.rating) < Math.abs(targets[best] - r.p.rating)) best = i; });
      targets.splice(best, 1);
    });
    targets.forEach((t) => { const p = pickFresh(t); if (p) main.push({ p }); });

    const bonus = [];
    const bc = cfg.bonus || {};
    if (opts.bonus && bc.perPack) {
      bonus.push(...recycleFrom('bonus', Math.min(cfg.recycle?.maxBonusPerPack || 0, bc.perPack)));
      for (let j = bonus.length; j < bc.perPack; j++) {
        const p = pickFresh(Math.round(level.max + (bc.above * (j + 1)) / bc.perPack));
        if (p) bonus.push({ p });
      }
    }

    const toEntry = (r, label) => (r.rep ? { id: r.p.id, label, rep: r.rep } : { id: r.p.id, label });
    const byRating = (a, b) => a.p.rating - b.p.rating;
    const pack = {
      no: n,
      createdAt: Date.now(),
      level,
      regen: opts.regen || 0,
      problems: main.sort(byRating).map((r, i) => toEntry(r, String(i + 1))),
      bonus: bonus.sort(byRating).map((r, i) => toEntry(r, `B${i + 1}`)),
    };
    if (levelChange) pack.levelChange = levelChange;
    return pack;
  }

  async function savePack(pack) {
    state.data.packs[`p${pack.no}`] = pack;
    const lvlChanged = !sameLevel(state.data.level, pack.level);
    state.data.level = pack.level;
    await fbWrite(`packs/p${pack.no}`, pack);
    if (lvlChanged) await fbWrite('level', pack.level);
  }

  // ---------- Render: kotak PIN ----------
  function renderSyncBox() {
    const el = $('sync');
    const sy = state.sync;
    el.hidden = false;
    if (!sy.url) { el.innerHTML = '<p class="sync-err">Alamat Firebase belum diisi di config.json.</p>'; return; }
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
    const solved = new Set();
    sortedPacks().forEach((pk) => [...pk.problems, ...(pk.bonus || [])].forEach((p) => {
      if (statusOf(p.id, pk).kind === 'ok') solved.add(p.id);
    }));
    $('profile').innerHTML = `
      <span class="chip">Level <span class="mono ${rankClass(lvl.max)}">${lvl.min}–${lvl.max}</span></span>
      <span class="chip"><span class="mono">${solved.size}</span> soal benar</span>
      <span class="chip muted">Bank <span class="mono">${state.bank.list.length.toLocaleString('id-ID')}</span> soal</span>`;
  }

  // ---------- Render: paket ----------
  const familyNote = (p) => (p.type === 'integer' ? 'Isian 0–999' : 'Pilihan ganda A–E');

  function answerForm(p, pk, s) {
    const key = `${pk.no}|${p.id}`;
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

  function problemRow(p, entry, pk) {
    const s = statusOf(p.id, pk);
    const rep = entry.rep ? `<span class="repeat" title="Soal ini pernah muncul dan belum benar">↻ Ulangan ke-${entry.rep - 1}</span>` : '';
    let status;
    let work = '';
    const detail = s.att?.a != null ? `Jawab ${esc(s.att.a)}${s.took ? ` · ${minutes(s.took)} mnt` : ''}` : '';
    const after = `<small><a href="${p.solutionUrl}" target="_blank" rel="noopener">Pembahasan ↗</a> · <button class="link-btn" data-act="unjudge">ubah</button></small>`;
    if (s.kind === 'ok') status = `<span class="status ok">Benar</span><small>${detail}</small>${after}`;
    else if (s.kind === 'wrong') status = `<span class="status tried">Salah</span><small>${detail}</small>${after}`;
    else if (s.kind === 'skip') status = `<span class="status todo">Dilewati</span>${after}`;
    else if (s.kind === 'answered') { status = `<span class="status check">Cek kunci</span>`; work = judgeForm(p, s); }
    else if (s.kind === 'started') { status = `<span class="status working">Dikerjakan</span>`; work = answerForm(p, pk, s); }
    else status = `<a class="mini-btn primary" href="${p.url}" target="_blank" rel="noopener" data-act="start">Kerjakan ↗</a>`;
    const rowClass = { ok: 'solved', wrong: 'wrong', started: 'inprogress', answered: 'inprogress' }[s.kind] || '';
    return `<li class="problem ${rowClass}" data-pid="${esc(p.id)}" data-pack="${pk.no}">
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

  // Kotak "Keluarkan soal baru": muncul saat belum ada paket, atau paket terakhir sudah selesai semua.
  function renderNewPack() {
    const el = $('newpack');
    const last = lastPack();
    if (!state.sync.ok) { el.hidden = true; return; }
    if (el.contains(document.activeElement)) return; // jangan ganggu saat sedang memilih
    el.hidden = false;
    if (last && !packScore(last).complete) {
      const sc = packScore(last);
      const left = sc.count - sc.done;
      el.className = 'newpack locked-pack';
      el.innerHTML = `<p><strong>Paket ke-${last.no}: ${sc.done} dari ${sc.count} soal selesai.</strong>
        Selesaikan ${left} soal lagi (jawab lalu tandai Benar/Salah, atau lewati) untuk membuka soal baru.</p>`;
      return;
    }
    const pf = prefs();
    const opts = state.config.countOptions || [5, 8, 10, 12, 15, 20, 25];
    const isPreset = opts.includes(pf.count);
    const promo = last ? promotionFor(last.no + 1, currentLevel()) : null;
    const lvl = promo ? promo.to : currentLevel();
    el.className = 'newpack';
    el.innerHTML = `
      ${last ? `<p class="np-title">🎉 Semua soal paket ke-${last.no} sudah selesai: <strong>${packScore(last).ok}/${packScore(last).count} benar</strong>.</p>` : '<p class="np-title">Siap mulai? Pilih jumlah soal untuk paket pertama.</p>'}
      ${promo ? `<p class="np-promo">Naik level! Paket berikutnya memakai rating <strong>${promo.to.min}–${promo.to.max}</strong>.</p>` : ''}
      <form id="newpack-form" class="np-form">
        <fieldset class="np-counts">
          <legend>Jumlah soal</legend>
          ${opts.map((c) => `<label class="np-count"><input type="radio" name="np-count" value="${c}" ${pf.count === c ? 'checked' : ''}><span>${c}</span></label>`).join('')}
          <label class="np-count np-custom"><input type="radio" name="np-count" value="custom" ${isPreset ? '' : 'checked'}><span>Lainnya</span>
            <input type="number" id="np-custom" min="1" max="${MAX_COUNT}" value="${isPreset ? '' : pf.count}" placeholder="1–${MAX_COUNT}" aria-label="Jumlah soal lainnya"></label>
        </fieldset>
        ${state.config.bonus?.perPack ? `<label class="switch"><input type="checkbox" id="np-bonus" ${pf.bonus ? 'checked' : ''}> Tambah ${state.config.bonus.perPack} soal bonus tantangan</label>` : ''}
        <div class="np-actions">
          <button type="submit" class="mini-btn primary np-go">Keluarkan soal baru</button>
          <span class="muted small">Level ${lvl.min}–${lvl.max}</span>
        </div>
      </form>`;
  }

  function renderPack() {
    const packs = sortedPacks();
    const list = $('problems');
    $('settings').hidden = !state.sync.ok || !packs.length;
    if (!packs.length) {
      $('pack-title').textContent = 'Belum ada paket soal';
      $('pack-info').textContent = state.sync.ok
        ? 'Pilih jumlah soal di bawah, lalu klik "Keluarkan soal baru".'
        : 'Sambungkan perangkat dengan PIN keluarga untuk membuka paket soal.';
      list.innerHTML = '<li class="empty">Soal akan muncul di sini.</li>';
      $('pack-score').textContent = '0/0';
      $('pack-meter').style.width = '0';
      $('pack-progress').textContent = '';
      $('prev-pack').disabled = $('next-pack').disabled = true;
      $('levelup').hidden = true;
      $('bonus').hidden = true;
      $('bonus-score').hidden = true;
      $('working').hidden = true;
      return;
    }
    if (state.viewPack == null || !packObj(state.viewPack)) state.viewPack = packs[packs.length - 1].no;
    const pk = packObj(state.viewPack);
    const idx = packs.indexOf(pk);
    const isLatest = idx === packs.length - 1;
    $('prev-pack').disabled = idx <= 0;
    $('next-pack').disabled = isLatest;
    $('pack-title').textContent = `Paket ke-${pk.no}${isLatest ? ' · sekarang' : ''}`;
    $('pack-info').textContent =
      `Dibuat ${fmtDate(pk.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })} · ${pk.problems.length} soal · rating ${pk.level.min}–${pk.level.max}`;

    const sc = packScore(pk);
    $('pack-score').textContent = `${sc.ok}/${sc.count}`;
    $('pack-meter').style.width = `${sc.count ? (sc.ok / sc.count) * 100 : 0}%`;
    $('pack-progress').textContent = sc.complete
      ? `Selesai${sc.finishedAt ? ` ${fmtDate(sc.finishedAt, { day: 'numeric', month: 'short' })}` : ''} · ${sc.pct}% benar`
      : `${sc.done} dari ${sc.count} soal selesai dinilai`;

    // Jangan gambar ulang baris saat Ken sedang mengetik jawaban AIME.
    const typing = document.activeElement?.matches?.('[data-aime]');
    if (!typing) {
      list.innerHTML = pk.problems.map((e) => {
        const p = state.bank.byId.get(e.id);
        return p ? problemRow(p, e, pk) : '';
      }).join('');
      renderBonus(pk);
    }
    renderWorking(pk);
    renderLevelUp(isLatest);
  }

  function renderBonus(pk) {
    const list = pk.bonus || [];
    $('bonus').hidden = !list.length;
    $('bonus-score').hidden = !list.length;
    if (!list.length) return;
    const bs = bonusScore(pk);
    $('bonus-score').textContent = `+ Bonus: ${bs.done}/${bs.count}`;
    $('bonus-list').innerHTML = list.map((e) => {
      const p = state.bank.byId.get(e.id);
      return p ? problemRow(p, e, pk) : '';
    }).join('');
  }

  function renderWorking(pk) {
    const el = $('working');
    const all = [...pk.problems, ...(pk.bonus || [])];
    const active = all.filter((e) => statusOf(e.id, pk).kind === 'started').map((e) => e.label);
    const toCheck = all.filter((e) => statusOf(e.id, pk).kind === 'answered').map((e) => e.label);
    const parts = [];
    if (active.length) parts.push(`<span class="dot-live" aria-hidden="true"></span><strong>Sedang dikerjakan: ${active.join(', ')}</strong>`);
    if (toCheck.length) parts.push(`<span>Belum dicek kuncinya: ${toCheck.join(', ')}</span>`);
    el.hidden = !parts.length;
    el.innerHTML = parts.join('<span class="muted"> · </span>');
  }

  function renderLevelUp(isLatest) {
    const el = $('levelup');
    const rule = state.config.autoPromote;
    if (!rule?.enabled || !isLatest) { el.hidden = true; return; }
    el.hidden = false;
    const lvl = currentLevel();
    const pips = sortedPacks().filter((pk) => sameLevel(pk.level, lvl)).slice(-rule.consecutivePacks).map((pk) => {
      const sc = packScore(pk);
      const label = sc.complete ? `${sc.pct}%` : `${sc.ok}/${sc.count}…`;
      return `<span class="pip ${sc.pct >= rule.minPercent ? 'done' : ''}">P${pk.no}: ${label}</span>`;
    }).join('');
    el.innerHTML = `
      <p><strong>Target naik level:</strong> jawab benar minimal ${rule.minPercent}% soal
      di ${rule.consecutivePacks} paket berturut-turut, maka paket berikutnya naik ke rating
      <strong>${lvl.min + rule.step}–${lvl.max + rule.step}</strong>.</p>
      <div class="pips">${pips}</div>`;
  }

  // ---------- Render: riwayat ----------
  function renderHistory() {
    const body = $('history-body');
    const packs = sortedPacks();
    if (!packs.length) { body.innerHTML = '<tr><td colspan="7" class="empty">Belum ada riwayat.</td></tr>'; return; }
    const rows = [];
    [...packs].reverse().forEach((pk) => {
      const sc = packScore(pk);
      const bs = bonusScore(pk);
      rows.push(`<tr>
        <td>Paket ${pk.no}</td>
        <td>${fmtDate(pk.createdAt, { day: 'numeric', month: 'short', year: '2-digit' })}</td>
        <td>${sc.complete && sc.finishedAt ? fmtDate(sc.finishedAt, { day: 'numeric', month: 'short' }) : `<span class="muted">${sc.done}/${sc.count} dinilai</span>`}</td>
        <td class="mono">${pk.level.min}–${pk.level.max}</td>
        <td class="num">${sc.ok}/${sc.count}</td>
        <td class="num">${bs.count ? `${bs.done}/${bs.count}` : '–'}</td>
        <td><button class="link-btn" data-open="${pk.no}">Lihat</button></td>
      </tr>`);
      if (pk.levelChange) {
        const lc = pk.levelChange;
        const why = lc.type === 'auto' ? 'Naik level otomatis' : 'Level diubah manual';
        rows.push(`<tr class="lvl"><td colspan="7">${why}: ${lc.from.min}–${lc.from.max} → <strong>${lc.to.min}–${lc.to.max}</strong> mulai paket ${pk.no}</td></tr>`);
      }
    });
    body.innerHTML = rows.join('');
  }

  // ---------- Render: statistik ----------
  function renderStats() {
    const packs = sortedPacks();
    const latest = new Map();
    const tries = [];
    packs.forEach((pk) => [...pk.problems, ...(pk.bonus || [])].forEach((e) => {
      const p = state.bank.byId.get(e.id);
      if (!p) return;
      const s = statusOf(e.id, pk);
      if (s.kind !== 'todo') latest.set(e.id, { p, s, bonus: (pk.bonus || []).includes(e) });
      if (DONE.includes(s.kind)) tries.push({ p, s });
    }));
    const items = [...latest.values()];
    const isOk = (s) => s.kind === 'ok';
    const judged = tries.length;
    const right = tries.filter((t) => isOk(t.s)).length;
    const times = tries.filter((t) => isOk(t.s) && t.s.took).map((t) => t.s.took).sort((a, b) => a - b);
    const median = times.length ? minutes(times[Math.floor(times.length / 2)]) : null;

    $('stat-tiles').innerHTML = [
      [items.filter((x) => isOk(x.s)).length, 'soal berbeda dijawab benar'],
      [judged ? `${Math.round((right / judged) * 100)}%` : '–', `ketepatan (${right} dari ${judged} jawaban)`],
      [packs.filter((pk) => packScore(pk).complete).length, 'paket selesai'],
      [median ? `${median}′` : '–', 'waktu tengah per soal benar'],
      [items.filter((x) => x.bonus && isOk(x.s)).length, 'bonus tantangan benar'],
    ].map(([v, l]) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`).join('');

    renderChart(packs);

    const ratioBars = (ul, groups) => {
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

  // Grafik persentase benar per paket (jumlah soal tiap paket bisa berbeda).
  function renderChart(packs) {
    const el = $('chart');
    if (!packs.length) { el.innerHTML = '<p class="muted">Grafik muncul setelah paket pertama.</p>'; return; }
    const barW = 28, gap = 14, padL = 36, padB = 24, padT = 10, h = 180;
    const width = Math.max(300, padL + packs.length * (barW + gap) + gap);
    const y = (v) => padT + (h - padT - padB) * (1 - v / 100);
    let svg = `<svg width="${width}" height="${h}" viewBox="0 0 ${width} ${h}" role="img" aria-label="Persentase benar per paket">`;
    for (let v = 0; v <= 100; v += 25) {
      svg += `<line class="grid" x1="${padL}" x2="${width}" y1="${y(v)}" y2="${y(v)}"/><text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end">${v}%</text>`;
    }
    packs.forEach((pk, i) => {
      const sc = packScore(pk);
      const x = padL + gap + i * (barW + gap);
      if (sc.ok) svg += `<rect class="${sc.complete ? 'bar-on' : 'bar-late'}" x="${x}" y="${y(sc.pct)}" width="${barW}" height="${y(0) - y(sc.pct)}" rx="3"><title>Paket ${pk.no}: ${sc.ok}/${sc.count} benar</title></rect>`;
      svg += `<text x="${x + barW / 2}" y="${h - 6}" text-anchor="middle">P${pk.no}</text>`;
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
    if (document.activeElement?.closest?.('#level-form')) return;
    const lvl = currentLevel();
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
    renderPack();
    renderNewPack();
    renderHistory();
    renderStats();
    renderSettings();
  }

  // ---------- Aksi pada soal ----------
  function rowCtx(el) {
    const li = el.closest('li[data-pid]');
    if (!li) return null;
    const n = Number(li.dataset.pack);
    const pk = packObj(n);
    const p = state.bank.byId.get(li.dataset.pid);
    return pk && p ? { n, p, a: attOf(n, p.id) || {} } : null;
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
        renderPack();
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
        if (!confirm('Lewati soal ini? Pembahasannya akan terbuka, dan soal ini akan muncul lagi di paket berikutnya.')) return;
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
    // Mengetik jumlah lain otomatis memilih "Lainnya".
    if (e.target.id === 'np-custom') { const r = document.querySelector('input[name="np-count"][value="custom"]'); if (r) r.checked = true; }
  });

  // ---------- Paket baru ----------
  function chosenCount() {
    const r = document.querySelector('input[name="np-count"]:checked');
    if (!r) return null;
    const v = r.value === 'custom' ? $('np-custom').value : r.value;
    const n = Math.round(Number(v));
    return n >= 1 && n <= MAX_COUNT ? n : null;
  }

  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'newpack-form') return;
    e.preventDefault();
    const count = chosenCount();
    if (!count) { $('np-custom').focus(); return; }
    const last = lastPack();
    if (last && !packScore(last).complete) return;
    const bonus = !!$('np-bonus')?.checked;
    const btn = e.target.querySelector('.np-go');
    btn.disabled = true;
    btn.textContent = 'Menyiapkan…';
    try {
      const pack = generatePack(last ? last.no + 1 : 1, { count, bonus });
      state.data.prefs = { count, bonus };
      await savePack(pack);
      await fbWrite('prefs', state.data.prefs);
      state.viewPack = pack.no;
    } catch (_) {
      showBanner('Paket baru belum bisa disimpan ke database. Periksa koneksi atau aturan Firebase untuk jalur /k/<PIN>/math.');
    }
    document.activeElement?.blur();
    renderAll();
    $('panel-paket').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---------- Navigasi ----------
  document.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (b) selectTab(b.dataset.tab);
  });
  function stepPack(d) {
    const ps = sortedPacks();
    const i = ps.findIndex((pk) => pk.no === state.viewPack);
    const next = ps[i + d];
    if (next) { state.viewPack = next.no; renderPack(); }
  }
  $('prev-pack').addEventListener('click', () => stepPack(-1));
  $('next-pack').addEventListener('click', () => stepPack(1));
  $('history-body').addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]');
    if (!b) return;
    state.viewPack = Number(b.dataset.open);
    selectTab('paket');
    renderPack();
  });

  // ---------- PIN ----------
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sync="logout"]')) {
      store('syncPin', null);
      state.sync.pin = null;
      state.sync.ok = false;
      state.data = { level: null, prefs: null, packs: {}, att: {} };
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
    if (state.sync.ok) store('syncPin', pin);
    else state.sync.pin = null;
    renderAll();
  });

  // ---------- Pengaturan (orang tua) ----------
  $('level-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const min = Math.round(Number($('lvl-min').value));
    const max = Math.round(Number($('lvl-max').value));
    const msg = $('settings-msg');
    if (!(min >= 400 && max > min)) { msg.textContent = 'Rating maksimum harus lebih besar dari minimum.'; return; }
    const level = { min, max };
    const last = lastPack();
    try {
      if (last && !packHasAnswers(last.no)) {
        await savePack(generatePack(last.no, {
          level, count: last.problems.length, bonus: !!(last.bonus || []).length, regen: (last.regen || 0) + 1,
        }));
        msg.textContent = `Level diubah ke ${min}–${max}. Soal paket ke-${last.no} sudah diganti.`;
      } else {
        state.data.level = level;
        await fbWrite('level', level);
        msg.textContent = `Level diubah ke ${min}–${max}. Berlaku mulai paket berikutnya.`;
      }
    } catch (_) {
      msg.textContent = 'Gagal menyimpan. Periksa koneksi lalu coba lagi.';
    }
    renderAll();
  });

  $('regen').addEventListener('click', async () => {
    const last = lastPack();
    const msg = $('settings-msg');
    if (!last) return;
    if (packHasAnswers(last.no)) { msg.textContent = 'Soal paket ini sudah ada yang dikerjakan, jadi paketnya tidak diganti.'; return; }
    if (!confirm(`Hapus paket ke-${last.no} dan pilih ulang jumlah soalnya?`)) return;
    try {
      delete state.data.packs[`p${last.no}`];
      await fbWrite(`packs/p${last.no}`, null);
      const prev = lastPack();
      // Kembalikan level ke level paket sebelumnya (atau level awal) agar kenaikan level tidak terhitung dua kali.
      state.data.level = prev ? prev.level : (last.levelChange?.from || last.level);
      await fbWrite('level', state.data.level);
      msg.textContent = '';
    } catch (_) {
      msg.textContent = 'Gagal menyimpan. Periksa koneksi lalu coba lagi.';
    }
    state.viewPack = null;
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
    await syncLoad();
    renderAll();
    // Ambil perubahan dari perangkat lain dan perbarui hitungan waktu setiap menit.
    setInterval(async () => {
      if (document.hidden) return;
      if (state.sync.ok) await syncLoad();
      renderAll();
    }, 60000);
  }

  init();
})();
