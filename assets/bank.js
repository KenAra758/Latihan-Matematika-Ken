// Bank soal dari AoPS Wiki. Isi soal TIDAK disalin: alamat halaman AoPS Wiki punya pola tetap
// (mis. "2019_AMC_8_Problems#Problem_12"), jadi daftar soal cukup disusun dari lomba, tahun, dan nomor.
// Rating adalah perkiraan tingkat kesulitan (skala mirip Codeforces) dari jenis lomba dan nomor soal.
(function () {
  'use strict';

  const WIKI = 'https://artofproblemsolving.com/wiki/index.php/';

  const FAMILIES = {
    AJHSME: { name: 'AJHSME', count: 25, type: 'choice', rating: (n) => 500 + 40 * (n - 1) },
    AMC8: { name: 'AMC 8', count: 25, type: 'choice', rating: (n) => 600 + 40 * (n - 1) },
    AMC10: { name: 'AMC 10', count: 25, type: 'choice', rating: (n) => 900 + 50 * (n - 1) },
    AMC12: { name: 'AMC 12', count: 25, type: 'choice', rating: (n) => 1100 + 55 * (n - 1) },
    AIME: { name: 'AIME', count: 15, type: 'integer', rating: (n) => 1700 + 70 * (n - 1) },
  };

  // Satu "paper" = satu naskah lomba (mis. AMC 10A 2021 Fall).
  function papers(cfg) {
    const enabled = cfg.contests || {};
    const last = cfg.lastYear || {};
    const out = [];
    const add = (family, year, variant, fall) => {
      const v = variant ? (family === 'AIME' ? `_${variant}` : variant) : '';
      const familySlug = { AJHSME: 'AJHSME', AMC8: 'AMC_8', AMC10: 'AMC_10', AMC12: 'AMC_12', AIME: 'AIME' }[family];
      out.push({
        family,
        year,
        code: `${family}${variant || ''}_${year}${fall ? 'F' : ''}`,
        title: `${year}${fall ? '_Fall' : ''}_${familySlug}${v}`,
        label: `${FAMILIES[family].name}${variant ? (family === 'AIME' ? ` ${variant}` : variant) : ''} ${year}${fall ? ' Fall' : ''}`,
      });
    };
    if (enabled.AJHSME !== false) for (let y = 1985; y <= 1998; y++) add('AJHSME', y);
    if (enabled.AMC8 !== false) for (let y = 1999; y <= (last.AMC8 || 2026); y++) if (y !== 2021) add('AMC8', y);
    ['AMC10', 'AMC12'].forEach((f) => {
      if (enabled[f] === false) return;
      for (let y = 2000; y <= (last[f] || 2025); y++) {
        if (y < 2002) { add(f, y); continue; }
        add(f, y, 'A'); add(f, y, 'B');
        if (y === 2021) { add(f, y, 'A', true); add(f, y, 'B', true); }
      }
    });
    if (enabled.AIME !== false) {
      for (let y = 1983; y <= (last.AIME || 2026); y++) {
        if (y < 2000) add('AIME', y);
        else { add('AIME', y, 'I'); add('AIME', y, 'II'); }
      }
    }
    return out;
  }

  function build(cfg) {
    const list = [];
    const byId = new Map();
    papers(cfg).forEach((pp) => {
      const fam = FAMILIES[pp.family];
      for (let n = 1; n <= fam.count; n++) {
        const p = {
          id: `${pp.code}_${n}`,
          family: pp.family,
          year: pp.year,
          n,
          type: fam.type,
          paper: pp.code,
          name: `${pp.label} · No. ${n}`,
          rating: Math.round(fam.rating(n) / 10) * 10,
          // Halaman naskah lengkap hanya berisi soal (tanpa pembahasan), jadi aman dibuka saat mengerjakan.
          url: `${WIKI}${pp.title}_Problems#Problem_${n}`,
          solutionUrl: `${WIKI}${pp.title}_Problems/Problem_${n}`,
          keyUrl: `${WIKI}${pp.title}_Answer_Key`,
        };
        list.push(p);
        byId.set(p.id, p);
      }
    });
    return { list, byId, families: FAMILIES };
  }

  window.MathBank = { build };
})();
