// Tab "EMC Final": paket latihan final EMC yang bisa dikerjakan langsung di website.
// Jawaban disimpan di Firebase yang sama: /k/<PIN>/math/emc/<idPaket>
//   { ans: { "<no>": "A".."D" | "isian" }, startedAt, submittedAt, score, history: [{ at, score, took }] }
(function () {
  'use strict';

  const SETS = [{
    id: 'final2026',
    title: 'Paket Latihan Final EMC 2026',
    subtitle: '40 soal (30 pilihan ganda + 10 isian) mengikuti pola soal final 2019–2025 · tanpa kalkulator',
    minutes: 120,
    problems: [
      { n: 1, topic: 'Rata-rata yang berubah', q: 'Rata-rata nilai 25 siswa adalah 70. Ternyata nilai seorang siswa tercatat 48, padahal seharusnya 98. Rata-rata yang benar adalah ….', opts: ['71', '73', '72', '74'], key: 'C', sol: 'Total naik 98 − 48 = 50. Rata-rata naik 50 ÷ 25 = 2, jadi 70 + 2 = <b>72</b>.' },
      { n: 2, topic: 'Rata-rata yang berubah', q: 'Rata-rata nilai 20 siswa adalah 75. Jika nilai tertinggi dan terendah tidak dihitung, rata-rata 18 siswa sisanya menjadi 76. Selisih nilai tertinggi dan terendah adalah 40. Nilai tertinggi adalah ….', opts: ['86', '84', '88', '90'], key: 'A', sol: 'Total 20 × 75 = 1500; total 18 siswa = 18 × 76 = 1368. Tertinggi + terendah = 132 dan selisihnya 40, maka tertinggi = (132 + 40) ÷ 2 = <b>86</b>.' },
      { n: 3, topic: 'Rata-rata yang berubah', q: 'Rata-rata kelas A adalah 80 dan rata-rata kelas B adalah 68. Rata-rata gabungan kedua kelas adalah 75. Jika kelas A terdiri dari 35 siswa, banyak siswa kelas B adalah ….', opts: ['21', '28', '30', '25'], key: 'D', sol: 'Jarak ke rata-rata gabungan: A lebih 5, B kurang 7. Maka 35 × 5 = n<sub>B</sub> × 7, jadi n<sub>B</sub> = <b>25</b>.' },
      { n: 4, topic: 'Rata-rata yang berubah', q: 'Rata-rata ujian 32 siswa adalah 65. Sebanyak 8 siswa mengikuti remedial sehingga rata-rata kelas menjadi 69. Rata-rata kenaikan nilai tiap siswa remedial adalah … poin.', key: '16', sol: 'Total kelas naik 32 × 4 = 128. Dibagi 8 siswa: 128 ÷ 8 = <b>16</b> poin.' },
      { n: 5, topic: 'Luas daerah arsir', q: 'Sebuah persegi bersisi 8. Pada tiap sudutnya digambar seperempat lingkaran berjari-jari 4 yang berpusat di sudut tersebut. Luas daerah di dalam persegi yang tidak tertutup seperempat lingkaran adalah ….', opts: ['64 − 4π', '64 − 16π', '64 − 8π', '32 − 8π'], key: 'B', sol: 'Empat seperempat lingkaran = satu lingkaran penuh berjari-jari 4, luasnya 16π. Sisa = <b>64 − 16π</b>.' },
      { n: 6, topic: 'Luas daerah arsir', q: 'Persegi ABCD bersisi 6. Titik E adalah titik tengah CD. Garis AE memotong diagonal BD di titik F. Luas segitiga DEF adalah ….', opts: ['2', '3', '4', '6'], key: 'B', sol: 'Segitiga DFE sebangun dengan BFA dengan rasio DE : AB = 1 : 2, jadi tinggi F dari DE = ⅓ × 6 = 2. Luas = ½ × 3 × 2 = <b>3</b>.' },
      { n: 7, topic: 'Luas daerah arsir', q: 'Dua lingkaran berjari-jari 2 saling memotong sehingga masing-masing melalui pusat lingkaran lainnya. Luas daerah irisan kedua lingkaran adalah ….', opts: ['(4π/3) − √3', '(8π/3) − √3', '(4π/3) − 2√3', '(8π/3) − 2√3'], key: 'D', sol: 'Pusat dan dua titik potong membentuk dua segitiga sama sisi (sisi 2), sehingga tiap juring bersudut 120°. Irisan = 2 × (juring 120° − segitiga) = 2 × (4π/3 − √3) = <b>8π/3 − 2√3</b>.' },
      { n: 8, topic: 'Sisa pembagian', q: 'Bilangan tiga digit terkecil yang jika dibagi 4 bersisa 3, dibagi 5 bersisa 4, dan dibagi 6 bersisa 5 adalah ….', opts: ['119', '109', '139', '179'], key: 'A', sol: 'Setiap sisa kurang 1 dari pembaginya, jadi n + 1 habis dibagi KPK(4, 5, 6) = 60. n = 60k − 1; tiga digit terkecil: <b>119</b>.' },
      { n: 9, topic: 'Sisa pembagian', q: 'Bilangan n dengan 100 &lt; n &lt; 200 memenuhi: n dibagi 7 bersisa 3 dan n dibagi 9 bersisa 5. Jumlah semua nilai n yang mungkin adalah ….', key: '307', sol: 'Sisa 3 = 7 − 4 dan sisa 5 = 9 − 4, jadi n + 4 habis dibagi 63. n = 59, 122, 185, … Yang memenuhi: 122 dan 185, jumlahnya <b>307</b>.' },
      { n: 10, topic: 'Sisa pembagian', q: 'Sisa pembagian 2<sup>100</sup> oleh 7 adalah ….', opts: ['1', '4', '2', '6'], key: 'C', sol: '2<sup>3</sup> = 8 ≡ 1 (mod 7). Karena 100 = 3 × 33 + 1, maka 2<sup>100</sup> ≡ 2<sup>1</sup> = <b>2</b>.' },
      { n: 11, topic: 'Inklusi–eksklusi kelipatan', q: 'Banyak bilangan asli kurang dari atau sama dengan 300 yang merupakan kelipatan 3 atau 5, tetapi bukan kelipatan 7, adalah ….', key: '120', sol: 'Kelipatan 3 atau 5: 100 + 60 − 20 = 140. Dari itu, yang juga kelipatan 7 (kelipatan 21 atau 35): 14 + 8 − 2 = 20. Jawaban 140 − 20 = <b>120</b>.' },
      { n: 12, topic: 'Inklusi–eksklusi kelipatan', q: 'Banyak bilangan bulat dari 1 sampai 1000 yang tidak habis dibagi 2, 3, maupun 5 adalah ….', opts: ['267', '268', '334', '266'], key: 'D', sol: 'Habis dibagi 2, 3, atau 5: (500 + 333 + 200) − (166 + 100 + 66) + 33 = 734. Jawaban 1000 − 734 = <b>266</b>.' },
      { n: 13, topic: 'Kombinatorika', q: 'Banyak susunan berbeda dari huruf-huruf pada kata KOMPETISI adalah ….', opts: ['40.320', '181.440', '90.720', '362.880'], key: 'B', sol: '9 huruf dengan huruf I muncul dua kali: 9! ÷ 2! = <b>181.440</b>.' },
      { n: 14, topic: 'Kombinatorika', q: '4 anak laki-laki dan 4 anak perempuan duduk melingkar sehingga laki-laki dan perempuan duduk selang-seling. Banyak susunan yang mungkin adalah ….', opts: ['72', '576', '144', '1152'], key: 'C', sol: 'Atur 4 laki-laki melingkar: (4 − 1)! = 6. Empat perempuan mengisi 4 celah: 4! = 24. Total 6 × 24 = <b>144</b>.' },
      { n: 15, topic: 'Kombinatorika', q: 'Dari 6 laki-laki dan 5 perempuan akan dipilih komite 4 orang yang beranggotakan paling sedikit 2 perempuan. Banyak cara memilih adalah ….', opts: ['215', '150', '195', '330'], key: 'A', sol: '2P2L: 10 × 15 = 150; 3P1L: 10 × 6 = 60; 4P: 5. Total <b>215</b>.' },
      { n: 16, topic: 'Aljabar manipulatif', q: 'Jika x + 1/x = 4, maka nilai x<sup>3</sup> + 1/x<sup>3</sup> adalah ….', opts: ['48', '60', '64', '52'], key: 'D', sol: 'x<sup>3</sup> + 1/x<sup>3</sup> = (x + 1/x)<sup>3</sup> − 3(x + 1/x) = 64 − 12 = <b>52</b>.' },
      { n: 17, topic: 'Aljabar manipulatif', q: 'Jika x<sup>2</sup> − 3x + 1 = 0, maka nilai x<sup>4</sup> + 1/x<sup>4</sup> adalah ….', key: '47', sol: 'Bagi dengan x: x + 1/x = 3. Lalu x<sup>2</sup> + 1/x<sup>2</sup> = 9 − 2 = 7, dan x<sup>4</sup> + 1/x<sup>4</sup> = 49 − 2 = <b>47</b>.' },
      { n: 18, topic: 'Aljabar manipulatif', q: 'Nilai dari √(6 + √(6 + √(6 + …))) adalah ….', opts: ['2', '√6', '3', '6'], key: 'C', sol: 'Misal nilainya y, maka y = √(6 + y), sehingga y<sup>2</sup> − y − 6 = 0, (y − 3)(y + 2) = 0. Karena y positif, y = <b>3</b>.' },
      { n: 19, topic: 'Aljabar manipulatif', q: 'Nilai dari 1/(√5 − √3) + 1/(√5 + √3) adalah ….', opts: ['√3', '√5', '2√5', '(√5)/2'], key: 'B', sol: 'Samakan penyebut: [(√5 + √3) + (√5 − √3)] ÷ (5 − 3) = 2√5 ÷ 2 = <b>√5</b>.' },
      { n: 20, topic: 'Aljabar manipulatif', q: 'Jika a + b = 5 dan ab = 3, maka a<sup>3</sup> + b<sup>3</sup> = ….', opts: ['80', '98', '116', '125'], key: 'A', sol: 'a<sup>3</sup> + b<sup>3</sup> = (a + b)<sup>3</sup> − 3ab(a + b) = 125 − 45 = <b>80</b>.' },
      { n: 21, topic: 'Aljabar manipulatif', q: 'Nilai x yang memenuhi 2<sup>x+3</sup> − 2<sup>x</sup> = 112 adalah ….', opts: ['3', '5', '6', '4'], key: 'D', sol: '2<sup>x</sup>(8 − 1) = 112, jadi 2<sup>x</sup> = 16 dan x = <b>4</b>.' },
      { n: 22, topic: 'Aljabar manipulatif', q: 'Nilai dari x = 2 + 1/(2 + 1/(2 + 1/(2 + …))) adalah ….', opts: ['2 + √2', '1 + √2', '1 + √3', '(1 + √5)/2'], key: 'B', sol: 'x = 2 + 1/x, sehingga x<sup>2</sup> − 2x − 1 = 0, x = 1 ± √2. Ambil yang positif: <b>1 + √2</b>.' },
      { n: 23, topic: 'Geometri koordinat', q: 'Titik berat segitiga dengan titik sudut A(1, 2), B(7, −4), dan C(4, 11) adalah (a, b). Nilai a + b adalah ….', opts: ['5', '6', '7', '9'], key: 'C', sol: 'Titik berat = rata-rata koordinat: ((1 + 7 + 4)/3, (2 − 4 + 11)/3) = (4, 3). a + b = <b>7</b>.' },
      { n: 24, topic: 'Geometri koordinat', q: 'Jarak titik (3, 4) ke garis 3x + 4y − 5 = 0 adalah ….', opts: ['4', '3', '5', '6'], key: 'A', sol: 'Jarak = |3·3 + 4·4 − 5| ÷ √(3<sup>2</sup> + 4<sup>2</sup>) = 20 ÷ 5 = <b>4</b>.' },
      { n: 25, topic: 'Geometri koordinat', q: 'Luas segitiga dengan titik sudut (0, 0), (6, 2), dan (2, 8) adalah ….', key: '22', sol: 'Luas = ½ |x<sub>1</sub>y<sub>2</sub> − x<sub>2</sub>y<sub>1</sub>| = ½ |6 · 8 − 2 · 2| = ½ × 44 = <b>22</b>.' },
      { n: 26, topic: 'Geometri ruang & lingkaran', q: 'Sebuah kubus memiliki luas permukaan 150 cm². Panjang diagonal ruangnya adalah ….', opts: ['5√2 cm', '10 cm', '6√3 cm', '5√3 cm'], key: 'D', sol: '6s² = 150, jadi s = 5. Diagonal ruang = s√3 = <b>5√3 cm</b>.' },
      { n: 27, topic: 'Geometri ruang & lingkaran', q: 'Sebuah kerucut terpancung memiliki jari-jari atas 3, jari-jari bawah 6, dan tinggi 7. Volumenya adalah ….', opts: ['105π', '147π', '126π', '189π'], key: 'B', sol: 'V = (πt/3)(R<sup>2</sup> + Rr + r<sup>2</sup>) = (7π/3)(36 + 18 + 9) = (7π/3)(63) = <b>147π</b>.' },
      { n: 28, topic: 'Geometri ruang & lingkaran', q: 'Pada lingkaran berjari-jari 13 terdapat dua tali busur sejajar dengan panjang 10 dan 24, terletak di sisi yang berlawanan terhadap pusat. Jarak kedua tali busur adalah ….', key: '17', sol: 'Jarak tali 10 ke pusat: √(13<sup>2</sup> − 5<sup>2</sup>) = 12. Jarak tali 24 ke pusat: √(13<sup>2</sup> − 12<sup>2</sup>) = 5. Berlawanan sisi: 12 + 5 = <b>17</b>.' },
      { n: 29, topic: 'Faktor, FPB, dan KPK', q: 'Banyak faktor positif dari 720 adalah ….', opts: ['24', '28', '30', '36'], key: 'C', sol: '720 = 2<sup>4</sup> × 3<sup>2</sup> × 5. Banyak faktor = (4 + 1)(2 + 1)(1 + 1) = <b>30</b>.' },
      { n: 30, topic: 'Faktor, FPB, dan KPK', q: 'Jumlah semua faktor positif dari 360 adalah ….', key: '1170', sol: '360 = 2<sup>3</sup> × 3<sup>2</sup> × 5. Jumlah faktor = (1 + 2 + 4 + 8)(1 + 3 + 9)(1 + 5) = 15 × 13 × 6 = <b>1170</b>.' },
      { n: 31, topic: 'Faktor, FPB, dan KPK', q: 'FPB dua bilangan adalah 12 dan KPK-nya 360. Jika salah satu bilangan adalah 72, bilangan lainnya adalah ….', opts: ['60', '48', '90', '120'], key: 'A', sol: 'FPB × KPK = hasil kali kedua bilangan: 12 × 360 = 72 × n, jadi n = <b>60</b>.' },
      { n: 32, topic: 'Peluang', q: 'Dua dadu dilempar bersamaan. Peluang jumlah mata dadu sama dengan 8 adalah ….', opts: ['1/9', '1/6', '7/36', '5/36'], key: 'D', sol: 'Pasangan: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 dari 36. Peluang <b>5/36</b>.' },
      { n: 33, topic: 'Peluang', q: 'Tiga dadu dilempar bersamaan. Peluang jumlah mata dadu sama dengan 10 adalah ….', opts: ['5/36', '25/216', '1/8', '1/6'], key: 'C', sol: 'Banyak cara jumlah 10 ada 27 dari 216 kemungkinan, peluang 27/216 = <b>1/8</b>. (Cara cepat: hitung tripel a + b + c = 10 dengan 1 ≤ a, b, c ≤ 6.)' },
      { n: 34, topic: 'Peluang', q: 'Sebuah koin dilempar 5 kali. Peluang muncul sisi angka paling sedikit satu kali adalah ….', opts: ['1/32', '31/32', '5/32', '15/16'], key: 'B', sol: 'Komplemen: peluang tidak pernah muncul angka = (1/2)<sup>5</sup> = 1/32. Jawaban 1 − 1/32 = <b>31/32</b>.' },
      { n: 35, topic: 'Peluang', q: 'Sebuah kotak berisi 4 bola merah dan 6 bola biru. Diambil 2 bola sekaligus. Jika diketahui paling sedikit satu bola yang terambil merah, peluang kedua bola merah adalah ….', opts: ['2/15', '1/3', '2/5', '1/5'], key: 'D', sol: 'P(dua merah) = C(4,2)/C(10,2) = 6/45. P(paling sedikit satu merah) = 1 − C(6,2)/45 = 30/45. Peluang bersyarat = 6/30 = <b>1/5</b>.' },
      { n: 36, topic: 'Peluang', q: 'Sebuah dadu dicurangi sehingga peluang muncul mata k sebanding dengan k. Peluang muncul mata genap adalah ….', opts: ['4/7', '1/2', '3/7', '2/3'], key: 'A', sol: 'P(k) = k/21 (karena 1 + 2 + … + 6 = 21). Genap: (2 + 4 + 6)/21 = 12/21 = <b>4/7</b>.' },
      { n: 37, topic: 'Digit satuan, fungsional, pola, fungsi kuadrat', q: 'Digit satuan dari 7<sup>2026</sup> adalah ….', opts: ['1', '3', '9', '7'], key: 'C', sol: 'Digit satuan 7<sup>n</sup> berulang 7, 9, 3, 1. 2026 = 4 × 506 + 2, jadi sama dengan 7<sup>2</sup>: <b>9</b>.' },
      { n: 38, topic: 'Digit satuan, fungsional, pola, fungsi kuadrat', q: 'Fungsi f memenuhi f(x) + 2f(1/x) = 3x untuk setiap x ≠ 0. Nilai f(2) adalah ….', opts: ['1', '2', '−1', '−2'], key: 'C', sol: 'x = 2: f(2) + 2f(½) = 6. x = ½: f(½) + 2f(2) = 3/2, jadi f(½) = 3/2 − 2f(2). Substitusi: f(2) + 3 − 4f(2) = 6, f(2) = <b>−1</b>.' },
      { n: 39, topic: 'Digit satuan, fungsional, pola, fungsi kuadrat', q: 'Suku berikutnya dari barisan 1, 2, 5, 11, 21, 36, … adalah ….', key: '57', sol: 'Selisih: 1, 3, 6, 10, 15 (bilangan segitiga). Selisih berikutnya 21, maka 36 + 21 = <b>57</b>.' },
      { n: 40, topic: 'Digit satuan, fungsional, pola, fungsi kuadrat', q: 'Garis y = 2x + k menyinggung parabola y = x<sup>2</sup> + 4x + 5. Nilai k adalah ….', opts: ['4', '2', '3', '5'], key: 'A', sol: 'x<sup>2</sup> + 4x + 5 = 2x + k → x<sup>2</sup> + 2x + (5 − k) = 0. Menyinggung jika D = 0: 4 − 4(5 − k) = 0, k = <b>4</b>.' },
    ],
  }];

  const LETTERS = ['A', 'B', 'C', 'D'];
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const set = SETS[0];
  const ui = { onlyWrong: false };
  const timers = {};

  const app = () => window.MathApp;
  const rec = () => app()?.data().emc?.[set.id] || {};
  // Isian: abaikan spasi dan pemisah ribuan, jadi "1.170" atau "1 170" sama dengan 1170.
  const norm = (v) => String(v ?? '').replace(/[\s.,]/g, '').replace(/−/g, '-').toLowerCase();
  const isRight = (p, v) => (p.opts ? v === p.key : v != null && v !== '' && norm(v) === norm(p.key));
  const answerText = (p, v) => {
    if (v == null || v === '') return '<span class="muted">kosong</span>';
    if (!p.opts) return esc(v);
    const i = LETTERS.indexOf(v);
    return `${v}) ${p.opts[i] ?? ''}`;
  };
  const minutes = (ms) => Math.max(1, Math.round(ms / 60000));

  function local(patch) {
    const d = app().data();
    d.emc = d.emc || {};
    d.emc[set.id] = { ...rec(), ...patch };
  }

  async function write(path, value) {
    try {
      await app().write(`emc/${set.id}${path ? `/${path}` : ''}`, value);
      $('emc-msg').textContent = '';
    } catch (_) {
      $('emc-msg').textContent = 'Jawaban belum tersimpan karena koneksi bermasalah. Coba lagi sebentar lagi.';
    }
  }

  async function saveAnswer(n, v) {
    const r = rec();
    const ans = { ...(r.ans || {}) };
    if (v == null || v === '') delete ans[n]; else ans[n] = v;
    const patch = { ans };
    if (!r.startedAt) patch.startedAt = Date.now();
    local(patch);
    render();
    if (patch.startedAt) await write('startedAt', patch.startedAt);
    await write(`ans/${n}`, v == null || v === '' ? null : v);
  }

  function scoreOf(ans) {
    const byTopic = new Map();
    let ok = 0;
    set.problems.forEach((p) => {
      const t = byTopic.get(p.topic) || { ok: 0, count: 0 };
      t.count++;
      if (isRight(p, ans[p.n])) { t.ok++; ok++; }
      byTopic.set(p.topic, t);
    });
    return { ok, count: set.problems.length, byTopic };
  }

  function problemHtml(p, r, done) {
    const v = (r.ans || {})[p.n];
    const right = done && isRight(p, v);
    const cls = done ? (right ? 'ok' : 'bad') : (v != null && v !== '' ? 'filled' : '');
    let work;
    if (done) {
      work = `<p class="emc-result">${right ? '✓ Benar' : '✗ Salah'} · Jawabanmu: <b>${answerText(p, v)}</b>
        ${right ? '' : ` · Kunci: <b>${answerText(p, p.key)}</b>`}</p>
        <details class="emc-sol"${right ? '' : ' open'}><summary>Pembahasan</summary><p>${p.sol}</p></details>`;
    } else if (p.opts) {
      work = `<div class="emc-opts" role="group" aria-label="Pilihan soal ${p.n}">${p.opts.map((o, i) => {
        const L = LETTERS[i];
        return `<button type="button" class="emc-opt" data-n="${p.n}" data-v="${L}" aria-pressed="${v === L}"><b>${L})</b> ${o}</button>`;
      }).join('')}</div>`;
    } else {
      work = `<label class="emc-fill">Jawaban:
        <input type="text" inputmode="numeric" autocomplete="off" data-n="${p.n}" value="${esc(v ?? '')}" placeholder="isi angka">
      </label>`;
    }
    return `<li class="emc-q ${cls}" id="emc-q${p.n}">
      <p class="emc-text"><span class="emc-no">${p.n}.</span> ${p.q}${p.opts ? '' : ' <em class="muted">(Isian)</em>'}</p>
      ${work}
    </li>`;
  }

  function render() {
    const panel = $('panel-emc');
    if (!panel || !app()) return;
    // Jangan menimpa kotak isian yang sedang diketik.
    if (panel.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
    const body = $('emc-body');
    if (!app().sync().ok) {
      body.innerHTML = '<p class="emc-note">Masukkan PIN keluarga di bagian atas halaman dulu, supaya jawaban Ken tersimpan.</p>';
      return;
    }
    const r = rec();
    const ans = r.ans || {};
    const done = !!r.submittedAt;
    const answered = set.problems.filter((p) => ans[p.n] != null && ans[p.n] !== '').length;
    const total = set.problems.length;

    let head;
    if (done) {
      const sc = scoreOf(ans);
      const nilai = Math.round((sc.ok / sc.count) * 100);
      const took = r.startedAt ? `${minutes(r.submittedAt - r.startedAt)} menit` : '—';
      const topics = [...sc.byTopic.entries()].map(([t, s]) => {
        const pct = Math.round((s.ok / s.count) * 100);
        return `<li><span class="name" title="${esc(t)}">${esc(t)}</span><span class="track"><span class="fill${pct < 50 ? ' weak' : ''}" style="width:${pct}%"></span></span><span class="val">${s.ok}/${s.count}</span></li>`;
      }).join('');
      const hist = (r.history || []).map((h, i) => `<li>Percobaan ${i + 1}: <b>${h.score}/${total}</b>${h.took ? ` · ${h.took} menit` : ''}</li>`).join('');
      head = `<div class="emc-score">
          <div><span class="emc-big">${nilai}</span><span class="muted">nilai (0–100)</span></div>
          <div><span class="emc-big">${sc.ok}/${sc.count}</span><span class="muted">benar</span></div>
          <div><span class="emc-big">${took}</span><span class="muted">waktu pengerjaan</span></div>
        </div>
        <figure class="chart-card"><figcaption>Benar per materi</figcaption><ul class="tag-bars emc-topics">${topics}</ul>
          <p class="muted small">Materi dengan banyak jawaban salah perlu diulang sebelum final.</p></figure>
        ${hist ? `<details class="howto"><summary>Percobaan sebelumnya</summary><ul>${hist}</ul></details>` : ''}
        <div class="emc-actions">
          <button type="button" class="btn-ghost" data-emc="wrong">${ui.onlyWrong ? 'Tampilkan semua soal' : 'Tampilkan soal yang salah saja'}</button>
          <button type="button" class="btn-ghost" data-emc="retry">Kerjakan ulang</button>
        </div>`;
    } else {
      const left = r.startedAt ? set.minutes - Math.floor((Date.now() - r.startedAt) / 60000) : null;
      const time = left == null ? `Waktu ${set.minutes} menit mulai dihitung saat soal pertama dijawab.`
        : left > 0 ? `Sisa waktu sekitar <b>${left} menit</b> dari ${set.minutes} menit.`
          : `<b class="emc-late">Waktu ${set.minutes} menit sudah habis.</b> Selesaikan lalu lihat nilai.`;
      head = `<p class="emc-progress"><b>${answered}/${total}</b> soal terjawab · ${time}</p>
        <div class="meter" aria-hidden="true"><span style="width:${(answered / total) * 100}%"></span></div>`;
    }

    let lastTopic = null;
    const items = set.problems
      .filter((p) => !(done && ui.onlyWrong && isRight(p, ans[p.n])))
      .map((p) => {
        const h = p.topic !== lastTopic ? `<li class="emc-topic">${esc(p.topic)}</li>` : '';
        lastTopic = p.topic;
        return h + problemHtml(p, r, done);
      }).join('');

    body.innerHTML = `
      <header class="emc-head">
        <h2>${esc(set.title)}</h2>
        <p class="muted">${esc(set.subtitle)}</p>
        ${head}
      </header>
      <ol class="emc-list">${items || '<li class="emc-note">Semua soal benar. Hebat!</li>'}</ol>
      ${done ? '' : `<div class="emc-actions">
        <button type="button" class="mini-btn primary emc-submit" data-emc="submit">Selesai &amp; lihat nilai</button>
        <span class="muted small">Setelah selesai, nilai, kunci jawaban, dan pembahasan langsung tampil.</span>
      </div>`}`;
  }

  async function submit() {
    const r = rec();
    const ans = r.ans || {};
    const empty = set.problems.filter((p) => ans[p.n] == null || ans[p.n] === '').map((p) => p.n);
    const ask = empty.length
      ? `Masih ada ${empty.length} soal kosong (no. ${empty.slice(0, 10).join(', ')}${empty.length > 10 ? ', …' : ''}). Soal kosong dihitung salah. Tetap selesai?`
      : 'Selesai dan lihat nilai? Jawaban tidak bisa diubah lagi.';
    if (!confirm(ask)) return;
    const submittedAt = Date.now();
    const score = scoreOf(ans).ok;
    local({ submittedAt, score });
    ui.onlyWrong = false;
    render();
    window.scrollTo({ top: $('panel-emc').offsetTop - 12, behavior: 'smooth' });
    await write('submittedAt', submittedAt);
    await write('score', score);
  }

  async function retry() {
    if (!confirm('Kerjakan ulang paket ini dari awal? Nilai sekarang tetap tercatat di "Percobaan sebelumnya".')) return;
    const r = rec();
    const took = r.startedAt && r.submittedAt ? minutes(r.submittedAt - r.startedAt) : null;
    const history = [...(r.history || []), { at: r.submittedAt, score: r.score ?? scoreOf(r.ans || {}).ok, ...(took ? { took } : {}) }];
    const next = { history };
    app().data().emc[set.id] = next;
    ui.onlyWrong = false;
    render();
    await write('', next);
  }

  document.addEventListener('click', (e) => {
    const opt = e.target.closest('.emc-opt');
    if (opt) {
      const n = Number(opt.dataset.n);
      const cur = (rec().ans || {})[n];
      // Klik pilihan yang sama sekali lagi untuk mengosongkan.
      saveAnswer(n, cur === opt.dataset.v ? null : opt.dataset.v);
      return;
    }
    const act = e.target.closest('[data-emc]');
    if (!act) return;
    if (act.dataset.emc === 'submit') submit();
    if (act.dataset.emc === 'retry') retry();
    if (act.dataset.emc === 'wrong') { ui.onlyWrong = !ui.onlyWrong; render(); }
  });

  document.addEventListener('input', (e) => {
    const inp = e.target.closest('.emc-fill input');
    if (!inp) return;
    const n = Number(inp.dataset.n);
    clearTimeout(timers[n]);
    timers[n] = setTimeout(() => saveAnswerQuiet(n, inp.value.trim()), 800);
  });
  document.addEventListener('change', (e) => {
    const inp = e.target.closest('.emc-fill input');
    if (!inp) return;
    const n = Number(inp.dataset.n);
    clearTimeout(timers[n]);
    saveAnswerQuiet(n, inp.value.trim());
  });

  // Simpan isian tanpa menggambar ulang kotak yang sedang diketik.
  async function saveAnswerQuiet(n, v) {
    const r = rec();
    if (((r.ans || {})[n] ?? '') === v) return;
    const ans = { ...(r.ans || {}) };
    if (v === '') delete ans[n]; else ans[n] = v;
    const patch = { ans };
    if (!r.startedAt) patch.startedAt = Date.now();
    local(patch);
    $(`emc-q${n}`)?.classList.toggle('filled', v !== '');
    const head = document.querySelector('.emc-progress b');
    if (head) head.textContent = `${set.problems.filter((p) => ans[p.n] != null && ans[p.n] !== '').length}/${set.problems.length}`;
    if (patch.startedAt) await write('startedAt', patch.startedAt);
    await write(`ans/${n}`, v === '' ? null : v);
  }

  window.EmcFinal = { render };
  // Data bisa sudah tersinkron sebelum file ini selesai dimuat.
  render();
})();
