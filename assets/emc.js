// Tab "EMC Final" dan "Soal Final EMC Lanjutan": paket latihan final EMC yang dikerjakan langsung di website.
// Jawaban disimpan di Firebase yang sama: /k/<PIN>/math/emc/<idPaket>
//   { ans: { "<no>": "A".."D" | "isian" }, startedAt, submittedAt, score, history: [{ at, score, took }] }
(function () {
  'use strict';

  const SETS = [{
    id: 'final2026',
    tab: 'emc',
    tabLabel: 'EMC Final',
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
  }, {
    id: 'lanjutan2026',
    tab: 'emc2',
    tabLabel: 'Soal Final EMC Lanjutan',
    // Terbuka setelah paket ini selesai dikerjakan minimal sekali.
    after: 'final2026',
    title: 'Soal Final EMC Lanjutan',
    subtitle: '30 soal (22 pilihan ganda + 8 isian) setara soal final 2022 dan 2024 · tanpa kalkulator',
    note: 'Jangan khawatir jika awalnya hanya bisa 50–60%. Targetnya adalah memahami polanya lewat pembahasan.',
    minutes: 90,
    problems: [
      { n: 1, topic: 'Aljabar', q: 'Diketahui a + b + c = 6, ab + bc + ca = 11, dan abc = 6. Nilai a<sup>3</sup> + b<sup>3</sup> + c<sup>3</sup> adalah ….', opts: ['42', '36', '54', '216'], key: 'B', sol: 'Gunakan a<sup>3</sup> + b<sup>3</sup> + c<sup>3</sup> = (a+b+c)<sup>3</sup> − 3(a+b+c)(ab+bc+ca) + 3abc = 216 − 198 + 18 = <b>36</b>. (Cek: a, b, c = 1, 2, 3.)' },
      { n: 2, topic: 'Aljabar', q: 'Bilangan positif a, b, c memenuhi a(a + b + c) = 18, b(a + b + c) = 12, dan c(a + b + c) = 6. Nilai abc adalah ….', opts: ['8', '12', '36', '6'], key: 'D', sol: 'Jumlahkan ketiganya: (a + b + c)<sup>2</sup> = 36, jadi a + b + c = 6. Maka a = 3, b = 2, c = 1, sehingga abc = <b>6</b>.' },
      { n: 3, topic: 'Aljabar', q: 'Diketahui A = √(12 + √(12 + √(12 + …))) dan B = √(12√(12√(12…))). Nilai B − A adalah ….', opts: ['8', '4', '6', '12'], key: 'A', sol: 'A<sup>2</sup> = 12 + A memberi A = 4. B<sup>2</sup> = 12B memberi B = 12. B − A = <b>8</b>.' },
      { n: 4, topic: 'Aljabar', q: 'Jika x<sup>1/4</sup> + x<sup>−1/4</sup> = √5, maka nilai x<sup>3/2</sup> + x<sup>−3/2</sup> adalah ….', opts: ['21', '24', '18', '27'], key: 'C', sol: 'Kuadratkan: x<sup>1/2</sup> + x<sup>−1/2</sup> = 5 − 2 = 3. Misal u = 3, maka x<sup>3/2</sup> + x<sup>−3/2</sup> = u<sup>3</sup> − 3u = 27 − 9 = <b>18</b>.' },
      { n: 5, topic: 'Aljabar', q: 'Nilai dari 1/(√1 + √2) + 1/(√2 + √3) + 1/(√3 + √4) + … + 1/(√99 + √100) adalah ….', key: '9', sol: 'Rasionalkan tiap suku: 1/(√k + √(k+1)) = √(k+1) − √k. Deretnya teleskopik: √100 − √1 = <b>9</b>.' },
      { n: 6, topic: 'Aljabar', q: 'Suku banyak P(x) jika dibagi (x − 1) bersisa 5 dan jika dibagi (x − 2) bersisa 7. Jika sisa pembagian P(x) oleh (x − 1)(x − 2) adalah ax + b, nilai a × b adalah ….', opts: ['5', '10', '6', '12'], key: 'C', sol: 'Teorema sisa: a + b = P(1) = 5 dan 2a + b = P(2) = 7. Jadi a = 2, b = 3, a × b = <b>6</b>.' },
      { n: 7, topic: 'Aljabar', q: 'Akar-akar persamaan x<sup>2</sup> − 5x + 3 = 0 adalah p dan q. Nilai p/q + q/p adalah ….', opts: ['19/3', '25/3', '17/3', '22/3'], key: 'A', sol: 'p/q + q/p = (p<sup>2</sup> + q<sup>2</sup>)/pq = [(p + q)<sup>2</sup> − 2pq]/pq = (25 − 6)/3 = <b>19/3</b>.' },
      { n: 8, topic: 'Teori bilangan', q: 'Banyak pasangan bilangan bulat positif (x, y) yang memenuhi 1/x + 1/y = 1/6 adalah ….', key: '9', sol: 'Kalikan 6xy: 6y + 6x = xy, sehingga (x − 6)(y − 6) = 36. Banyak faktor positif 36 = 9, jadi ada <b>9</b> pasangan.' },
      { n: 9, topic: 'Teori bilangan', q: 'Jumlah semua bilangan bulat positif n sehingga (n + 24)/(n + 2) merupakan bilangan bulat adalah ….', opts: ['9', '20', '31', '29'], key: 'D', sol: '(n + 24)/(n + 2) = 1 + 22/(n + 2), jadi n + 2 membagi 22. Dengan n ≥ 1: n + 2 = 11 atau 22, n = 9 atau 20. Jumlah <b>29</b>.' },
      { n: 10, topic: 'Teori bilangan', q: 'Dua digit terakhir dari 7<sup>2026</sup> adalah ….', opts: ['07', '49', '43', '01'], key: 'B', sol: '7<sup>4</sup> = 2401 ≡ 01 (mod 100). 2026 = 4 × 506 + 2, jadi 7<sup>2026</sup> ≡ 7<sup>2</sup> = <b>49</b>.' },
      { n: 11, topic: 'Teori bilangan', q: 'Banyak faktor positif dari 10! yang merupakan bilangan kuadrat sempurna adalah ….', opts: ['24', '36', '270', '30'], key: 'D', sol: '10! = 2<sup>8</sup> × 3<sup>4</sup> × 5<sup>2</sup> × 7. Faktor kuadrat: pangkat 2 ∈ {0,2,4,6,8} (5), pangkat 3 ∈ {0,2,4} (3), pangkat 5 ∈ {0,2} (2), pangkat 7 = 0. Total 5 × 3 × 2 = <b>30</b>.' },
      { n: 12, topic: 'Teori bilangan', q: 'Bilangan bulat terkecil N &gt; 1 yang bersisa 1 jika dibagi 2, 3, 4, 5, maupun 6, dan habis dibagi 7, adalah ….', opts: ['121', '301', '241', '421'], key: 'B', sol: 'N − 1 habis dibagi KPK(2, …, 6) = 60, jadi N = 61, 121, 181, 241, 301, … Yang pertama habis dibagi 7: <b>301</b>.' },
      { n: 13, topic: 'Teori bilangan', q: 'Jumlah semua bilangan asli ≤ 200 yang habis dibagi 3 atau 4, tetapi tidak habis dibagi 6, adalah ….', key: '6735', sol: 'Kelipatan 3 bukan 6 = kelipatan 3 ganjil: 3 + 9 + … + 195 = 33 × 99 = 3267. Kelipatan 4 bukan 6 = kelipatan 4 bukan 12: 5100 − 1632 = 3468. Total <b>6735</b>.' },
      { n: 14, topic: 'Teori bilangan', q: 'Banyak pasangan bilangan bulat positif (x, y) yang memenuhi x<sup>2</sup> − y<sup>2</sup> = 2025 adalah ….', key: '7', sol: '(x − y)(x + y) = 2025 = 3<sup>4</sup> × 5<sup>2</sup>, yang punya 15 faktor (semua ganjil, jadi x dan y pasti bulat). Pasangan dengan x − y &lt; x + y: (15 − 1)/2 = <b>7</b> (pasangan 45 × 45 memberi y = 0).' },
      { n: 15, topic: 'Geometri bidang', q: 'Segitiga memiliki panjang sisi 13, 14, dan 15. Jari-jari lingkaran luar segitiga tersebut adalah ….', opts: ['65/8', '7', '8', '33/4'], key: 'A', sol: 'Luas (Heron, s = 21): √(21·8·7·6) = 84. R = abc/(4L) = 2730/336 = <b>65/8</b>.' },
      { n: 16, topic: 'Geometri bidang', q: 'Persegi ABCD bersisi 12. E titik tengah AB dan F titik tengah BC. Garis DE dan AF berpotongan di G. Luas segiempat GFCD adalah …. <em class="muted">(dalam bentuk desimal)</em>', key: '79,2', accept: ['79,2', '79.2'], sol: 'Koordinat A(0,0), B(12,0), C(12,12), D(0,12). DE: y = 12 − 2x; AF: y = x/2. G = (4,8; 2,4). Rumus shoelace untuk G, F(12,6), C(12,12), D(0,12) memberi luas <b>79,2</b>. (Fakta menarik: DE ⊥ AF.)' },
      { n: 17, topic: 'Geometri bidang', q: 'Tiga lingkaran berjari-jari 1 saling bersinggungan luar. Luas daerah yang dibatasi ketiga lingkaran (di antara ketiganya) adalah ….', opts: ['√3 − π/3', '2√3 − π', '√3 − π/2', '√3/2 − π/6'], key: 'C', sol: 'Pusat-pusatnya membentuk segitiga sama sisi bersisi 2, luasnya √3. Tiga juring 60° = setengah lingkaran = π/2. Luas = <b>√3 − π/2</b>.' },
      { n: 18, topic: 'Geometri bidang', q: 'Dari titik P di luar lingkaran ditarik garis yang memotong lingkaran di A dan B (P–A–B) dengan PA = 4 dan AB = 5, serta garis singgung PT. Panjang PT adalah ….', opts: ['5', '√20', '3√5', '6'], key: 'D', sol: 'Kuasa titik: PT<sup>2</sup> = PA × PB = 4 × 9 = 36, jadi PT = <b>6</b>.' },
      { n: 19, topic: 'Geometri ruang', q: 'Kubus ABCD.EFGH memiliki rusuk 6. Jarak titik E ke bidang BDG adalah ….', opts: ['4√3', '2√3', '3√3', '6√2'], key: 'A', sol: 'Diagonal ruang EC tegak lurus bidang BDG dan bidang BDG memotongnya di ⅓ dari C. Jarak E = ⅔ × 6√3 = <b>4√3</b>.' },
      { n: 20, topic: 'Geometri ruang', q: 'Pada kubus ABCD.EFGH, nilai kosinus sudut antara diagonal ruang AG dan BH adalah ….', opts: ['1/2', '1/3', '√3/3', '2/3'], key: 'B', sol: 'Dengan rusuk 1: AG = (1,1,1), BH = (−1,1,1). cos θ = (−1 + 1 + 1)/(√3 × √3) = <b>1/3</b>.' },
      { n: 21, topic: 'Geometri ruang', q: 'Sebuah bola dimasukkan ke dalam kerucut sehingga menyinggung alas dan selimut kerucut. Kerucut memiliki jari-jari alas 6 dan tinggi 8. Volume bola adalah ….', opts: ['27π', '48π', '36π', '288π'], key: 'C', sol: 'Penampang: segitiga sama kaki alas 12, sisi miring 10. Jari-jari bola = luas/s = 48/16 = 3. Volume = (4/3)π × 27 = <b>36π</b>.' },
      { n: 22, topic: 'Kombinatorika & peluang', q: 'Banyak bilangan empat digit dengan semua digit berbeda yang habis dibagi 5 adalah ….', opts: ['952', '504', '896', '1008'], key: 'A', sol: 'Berakhiran 0: 9 × 8 × 7 = 504. Berakhiran 5: digit pertama 8 pilihan (bukan 0, bukan 5), lalu 8 × 7, jadi 448. Total <b>952</b>.' },
      { n: 23, topic: 'Kombinatorika & peluang', q: 'Banyak susunan huruf MATEMATIKA sehingga kedua huruf T tidak berdampingan adalah ….', key: '120960', sol: 'Total: 10!/(3! 2! 2!) = 151.200. T berdampingan (TT satu blok): 9!/(3! 2!) = 30.240. Jawaban 151.200 − 30.240 = <b>120.960</b>.' },
      { n: 24, topic: 'Kombinatorika & peluang', q: 'Banyak solusi bilangan bulat tak negatif dari a + b + c = 10 dengan a ≤ 5 adalah ….', opts: ['45', '56', '66', '51'], key: 'D', sol: 'Tanpa syarat: C(12, 2) = 66. Kurangi a ≥ 6 (misal a = a\' + 6, a\' + b + c = 4): C(6, 2) = 15. Jawaban <b>51</b>.' },
      { n: 25, topic: 'Kombinatorika & peluang', q: 'Tiga dadu dilempar. Peluang hasil kali ketiga mata dadu habis dibagi 4 adalah ….', opts: ['1/2', '5/8', '3/4', '7/8'], key: 'B', sol: 'Komplemen: hasil kali ganjil (1/8) atau tepat satu faktor 2 — satu dadu bernilai 2 atau 6 dan dua lainnya ganjil: 3 × (1/3)(1/2)(1/2) = 1/4. Jawaban 1 − 1/8 − 1/4 = <b>5/8</b>.' },
      { n: 26, topic: 'Kombinatorika & peluang', q: '2% penduduk mengidap suatu penyakit. Tes memberi hasil positif pada 90% pengidap dan pada 5% orang sehat. Jika hasil tes seseorang positif, peluang ia benar-benar sakit adalah ….', opts: ['9/10', '2/7', '18/67', '18/49'], key: 'C', sol: 'P(positif) = 0,02 × 0,9 + 0,98 × 0,05 = 0,018 + 0,049 = 0,067. P(sakit | positif) = 0,018/0,067 = <b>18/67</b>.' },
      { n: 27, topic: 'Fungsi, barisan, statistik', q: 'Fungsi f memenuhi f(x) + 2f(2026 − x) = 3x untuk semua bilangan real x. Nilai f(1013) adalah ….', key: '1013', sol: 'Ganti x dengan 2026 − x: f(2026 − x) + 2f(x) = 3(2026 − x). Eliminasi f(2026 − x) memberi f(x) = 4052 − 3x. Jadi f(1013) = 4052 − 3039 = <b>1013</b>.' },
      { n: 28, topic: 'Fungsi, barisan, statistik', q: 'Jumlah 10 suku pertama sebuah deret aritmetika adalah 145 dan jumlah 20 suku pertamanya 490. Jumlah 30 suku pertamanya adalah ….', key: '1035', sol: 'Sifat deret aritmetika: S<sub>10</sub>, S<sub>20</sub> − S<sub>10</sub>, S<sub>30</sub> − S<sub>20</sub> juga barisan aritmetika: 145, 345, 545. S<sub>30</sub> = 490 + 545 = <b>1035</b>.' },
      { n: 29, topic: 'Fungsi, barisan, statistik', q: 'Parabola y = x<sup>2</sup> − (k + 1)x + k memotong sumbu x di dua titik yang berjarak 5. Jumlah semua nilai k yang mungkin adalah ….', opts: ['2', '−2', '5', '6'], key: 'A', sol: 'x<sup>2</sup> − (k+1)x + k = (x − 1)(x − k), akarnya 1 dan k. |k − 1| = 5, jadi k = 6 atau −4. Jumlah <b>2</b>.' },
      { n: 30, topic: 'Fungsi, barisan, statistik', q: 'Lima bilangan bulat positif memiliki rata-rata 10, median 11, modus tunggal 13, dan jangkauan 9. Setelah diurutkan dari yang terkecil, bilangan urutan kedua adalah ….', opts: ['7', '9', '8', '10'], key: 'B', sol: 'Modus tunggal 13 dan median 11 berarti dua bilangan terbesar 13 dan 13. Jangkauan 9: terkecil 4. Jumlah 50, jadi urutan ke-2 = 50 − 4 − 11 − 26 = <b>9</b>. Data: 4, 9, 11, 13, 13.' },
    ],
  }];

  const LETTERS = ['A', 'B', 'C', 'D'];
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const byId = new Map(SETS.map((s) => [s.id, s]));
  const ui = {};
  const timers = {};

  const app = () => window.MathApp;
  const rec = (set) => app()?.data().emc?.[set.id] || {};
  const finishedOnce = (set) => { const r = rec(set); return !!r.submittedAt || !!(r.history || []).length; };
  const unlocked = (set) => !set.after || finishedOnce(byId.get(set.after));
  // Isian: abaikan spasi dan pemisah ribuan, jadi "1.170" atau "1 170" sama dengan 1170.
  // Soal berjawaban desimal memakai daftar `accept` dan dicocokkan apa adanya (tanpa spasi).
  const norm = (v) => String(v ?? '').replace(/[\s.,]/g, '').replace(/−/g, '-').toLowerCase();
  const filled = (v) => v != null && v !== '';
  const isRight = (p, v) => {
    if (p.opts) return v === p.key;
    if (!filled(v)) return false;
    if (p.accept) return p.accept.includes(String(v).replace(/\s/g, ''));
    return norm(v) === norm(p.key);
  };
  const answerText = (p, v) => {
    if (!filled(v)) return '<span class="muted">kosong</span>';
    if (!p.opts) return esc(v);
    const i = LETTERS.indexOf(v);
    return `${v}) ${p.opts[i] ?? ''}`;
  };
  const minutes = (ms) => Math.max(1, Math.round(ms / 60000));
  const countFilled = (set, ans) => set.problems.filter((p) => filled(ans[p.n])).length;

  function local(set, patch) {
    const d = app().data();
    d.emc = d.emc || {};
    d.emc[set.id] = { ...rec(set), ...patch };
  }

  async function write(set, path, value) {
    try {
      await app().write(`emc/${set.id}${path ? `/${path}` : ''}`, value);
      $(`${set.tab}-msg`).textContent = '';
    } catch (_) {
      $(`${set.tab}-msg`).textContent = 'Jawaban belum tersimpan karena koneksi bermasalah. Coba lagi sebentar lagi.';
    }
  }

  async function saveAnswer(set, n, v, quiet) {
    const r = rec(set);
    if (quiet && ((r.ans || {})[n] ?? '') === (v ?? '')) return;
    const ans = { ...(r.ans || {}) };
    if (filled(v)) ans[n] = v; else delete ans[n];
    const patch = { ans };
    if (!r.startedAt) patch.startedAt = Date.now();
    local(set, patch);
    if (quiet) {
      // Isian: jangan menggambar ulang kotak yang sedang diketik.
      $(`${set.tab}-q${n}`)?.classList.toggle('filled', filled(v));
      const head = $(`panel-${set.tab}`).querySelector('.emc-progress b');
      if (head) head.textContent = `${countFilled(set, ans)}/${set.problems.length}`;
    } else {
      render();
    }
    if (patch.startedAt) await write(set, 'startedAt', patch.startedAt);
    await write(set, `ans/${n}`, filled(v) ? v : null);
  }

  function scoreOf(set, ans) {
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

  function problemHtml(set, p, r, done) {
    const v = (r.ans || {})[p.n];
    const right = done && isRight(p, v);
    const cls = done ? (right ? 'ok' : 'bad') : (filled(v) ? 'filled' : '');
    let work;
    if (done) {
      work = `<p class="emc-result">${right ? '✓ Benar' : '✗ Salah'} · Jawabanmu: <b>${answerText(p, v)}</b>
        ${right ? '' : ` · Kunci: <b>${answerText(p, p.key)}</b>`}</p>
        <details class="emc-sol"${right ? '' : ' open'}><summary>Pembahasan</summary><p>${p.sol}</p></details>`;
    } else if (p.opts) {
      work = `<div class="emc-opts" role="group" aria-label="Pilihan soal ${p.n}">${p.opts.map((o, i) => {
        const L = LETTERS[i];
        return `<button type="button" class="emc-opt" data-set="${set.id}" data-n="${p.n}" data-v="${L}" aria-pressed="${v === L}"><b>${L})</b> ${o}</button>`;
      }).join('')}</div>`;
    } else {
      work = `<label class="emc-fill">Jawaban:
        <input type="text" inputmode="${p.accept ? 'decimal' : 'numeric'}" autocomplete="off" data-set="${set.id}" data-n="${p.n}" value="${esc(v ?? '')}" placeholder="isi angka">
      </label>`;
    }
    return `<li class="emc-q ${cls}" id="${set.tab}-q${p.n}">
      <p class="emc-text"><span class="emc-no">${p.n}.</span> ${p.q}${p.opts ? '' : ' <em class="muted">(Isian)</em>'}</p>
      ${work}
    </li>`;
  }

  function renderTabs() {
    SETS.forEach((set) => {
      const tab = $(`tab-${set.tab}`);
      if (!tab) return;
      const open = unlocked(set);
      tab.disabled = !open;
      tab.textContent = `${open ? '' : '🔒 '}${set.tabLabel}`;
      tab.title = open ? '' : `Terbuka setelah ${byId.get(set.after).title} selesai dikerjakan`;
      // Tab yang terkunci tidak boleh tetap terbuka (misalnya dari tab terakhir yang diingat).
      if (!open && app().sync().ok && tab.getAttribute('aria-selected') === 'true') $(`tab-${byId.get(set.after).tab}`)?.click();
    });
  }

  function renderSet(set) {
    const panel = $(`panel-${set.tab}`);
    if (!panel) return;
    // Jangan menimpa kotak isian yang sedang diketik.
    if (panel.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
    const body = $(`${set.tab}-body`);
    if (!app().sync().ok) {
      body.innerHTML = '<p class="emc-note">Masukkan PIN keluarga di bagian atas halaman dulu, supaya jawaban Ken tersimpan.</p>';
      return;
    }
    if (!unlocked(set)) {
      body.innerHTML = `<p class="emc-note">🔒 Soal ini terbuka setelah <b>${esc(byId.get(set.after).title)}</b> selesai dikerjakan.</p>`;
      return;
    }
    const st = ui[set.id] || (ui[set.id] = { onlyWrong: false });
    const r = rec(set);
    const ans = r.ans || {};
    const done = !!r.submittedAt;
    const total = set.problems.length;
    const nextSet = SETS.find((s) => s.after === set.id);

    let head;
    if (done) {
      const sc = scoreOf(set, ans);
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
        ${nextSet ? `<p class="emc-unlock">🔓 <b>${esc(nextSet.title)}</b> sudah terbuka. <button type="button" class="link-btn" data-goto="${nextSet.tab}">Buka sekarang →</button></p>` : ''}
        ${hist ? `<details class="howto"><summary>Percobaan sebelumnya</summary><ul>${hist}</ul></details>` : ''}
        <div class="emc-actions">
          <button type="button" class="btn-ghost" data-emc="wrong" data-set="${set.id}">${st.onlyWrong ? 'Tampilkan semua soal' : 'Tampilkan soal yang salah saja'}</button>
          <button type="button" class="btn-ghost" data-emc="retry" data-set="${set.id}">Kerjakan ulang</button>
        </div>`;
    } else {
      const left = r.startedAt ? set.minutes - Math.floor((Date.now() - r.startedAt) / 60000) : null;
      const time = left == null ? `Waktu ${set.minutes} menit mulai dihitung saat soal pertama dijawab.`
        : left > 0 ? `Sisa waktu sekitar <b>${left} menit</b> dari ${set.minutes} menit.`
          : `<b class="emc-late">Waktu ${set.minutes} menit sudah habis.</b> Selesaikan lalu lihat nilai.`;
      const answered = countFilled(set, ans);
      head = `${set.note ? `<p class="muted small">${esc(set.note)}</p>` : ''}
        <p class="emc-progress"><b>${answered}/${total}</b> soal terjawab · ${time}</p>
        <div class="meter" aria-hidden="true"><span style="width:${(answered / total) * 100}%"></span></div>`;
    }

    let lastTopic = null;
    const items = set.problems
      .filter((p) => !(done && st.onlyWrong && isRight(p, ans[p.n])))
      .map((p) => {
        const h = p.topic !== lastTopic ? `<li class="emc-topic">${esc(p.topic)}</li>` : '';
        lastTopic = p.topic;
        return h + problemHtml(set, p, r, done);
      }).join('');

    body.innerHTML = `
      <header class="emc-head">
        <h2>${esc(set.title)}</h2>
        <p class="muted">${esc(set.subtitle)}</p>
        ${head}
      </header>
      <ol class="emc-list">${items || '<li class="emc-note">Semua soal benar. Hebat!</li>'}</ol>
      ${done ? '' : `<div class="emc-actions">
        <button type="button" class="mini-btn primary emc-submit" data-emc="submit" data-set="${set.id}">Selesai &amp; lihat nilai</button>
        <span class="muted small">Setelah selesai, nilai, kunci jawaban, dan pembahasan langsung tampil.</span>
      </div>`}`;
  }

  function render() {
    if (!app()) return;
    renderTabs();
    SETS.forEach(renderSet);
  }

  async function submit(set) {
    const ans = rec(set).ans || {};
    const empty = set.problems.filter((p) => !filled(ans[p.n])).map((p) => p.n);
    const ask = empty.length
      ? `Masih ada ${empty.length} soal kosong (no. ${empty.slice(0, 10).join(', ')}${empty.length > 10 ? ', …' : ''}). Soal kosong dihitung salah. Tetap selesai?`
      : 'Selesai dan lihat nilai? Jawaban tidak bisa diubah lagi.';
    if (!confirm(ask)) return;
    const submittedAt = Date.now();
    const score = scoreOf(set, ans).ok;
    local(set, { submittedAt, score });
    ui[set.id] = { onlyWrong: false };
    render();
    window.scrollTo({ top: $(`panel-${set.tab}`).offsetTop - 12, behavior: 'smooth' });
    await write(set, 'submittedAt', submittedAt);
    await write(set, 'score', score);
  }

  async function retry(set) {
    if (!confirm('Kerjakan ulang paket ini dari awal? Nilai sekarang tetap tercatat di "Percobaan sebelumnya".')) return;
    const r = rec(set);
    const took = r.startedAt && r.submittedAt ? minutes(r.submittedAt - r.startedAt) : null;
    const history = [...(r.history || []), { at: r.submittedAt, score: r.score ?? scoreOf(set, r.ans || {}).ok, ...(took ? { took } : {}) }];
    const next = { history };
    app().data().emc[set.id] = next;
    ui[set.id] = { onlyWrong: false };
    render();
    await write(set, '', next);
  }

  const setOf = (el) => byId.get(el.dataset.set);

  document.addEventListener('click', (e) => {
    const opt = e.target.closest('.emc-opt');
    if (opt) {
      const set = setOf(opt);
      const n = Number(opt.dataset.n);
      const cur = (rec(set).ans || {})[n];
      // Klik pilihan yang sama sekali lagi untuk mengosongkan.
      saveAnswer(set, n, cur === opt.dataset.v ? null : opt.dataset.v);
      return;
    }
    const go = e.target.closest('[data-goto]');
    if (go) { $(`tab-${go.dataset.goto}`)?.click(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const act = e.target.closest('[data-emc]');
    if (!act) return;
    const set = setOf(act);
    if (act.dataset.emc === 'submit') submit(set);
    if (act.dataset.emc === 'retry') retry(set);
    if (act.dataset.emc === 'wrong') { ui[set.id].onlyWrong = !ui[set.id].onlyWrong; render(); }
  });

  document.addEventListener('input', (e) => {
    const inp = e.target.closest('.emc-fill input');
    if (!inp) return;
    const key = `${inp.dataset.set}:${inp.dataset.n}`;
    clearTimeout(timers[key]);
    timers[key] = setTimeout(() => saveAnswer(setOf(inp), Number(inp.dataset.n), inp.value.trim(), true), 800);
  });
  document.addEventListener('change', (e) => {
    const inp = e.target.closest('.emc-fill input');
    if (!inp) return;
    clearTimeout(timers[`${inp.dataset.set}:${inp.dataset.n}`]);
    saveAnswer(setOf(inp), Number(inp.dataset.n), inp.value.trim(), true);
  });

  window.EmcFinal = { render };
  // Data bisa sudah tersinkron sebelum file ini selesai dimuat.
  render();
})();
