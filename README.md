# Latihan Matematika Ken

Website latihan matematika, pasangan dari dashboard OSN Informatika (`latihan-ken`). Bedanya: di sini **tidak ada jadwal mingguan**. Ken mengerjakan satu paket sampai selesai, lalu mengeluarkan paket baru sendiri.

- **Isi jumlah soal** (1–30) di kolom *Jumlah soal* di atas daftar soal. Soal yang tampil persis sejumlah itu. Angka terakhir diingat.
- **Tombol "Keluarkan soal baru"** selalu terlihat, tetapi baru **aktif setelah semua soal yang tampil selesai dikerjakan**, yaitu sudah ditandai Benar/Salah atau dilewati.
- Soal diambil dari arsip **AoPS Wiki**: AJHSME, AMC 8, AMC 10, AMC 12, dan AIME (sekitar 4.700 soal). Tingkat kesulitannya tersebar dari batas bawah sampai batas atas level (awal: rating 700–1300).
- **Soal bonus dimatikan** (`"bonus": { "enabled": false }` di `config.json`), jadi tidak ada soal tambahan di luar jumlah yang diisi.
- **Isi soal tidak disalin.** Aplikasi hanya menyimpan nama lomba, tahun, dan nomor soal, lalu menautkan ke halaman AoPS Wiki. Tautan soal mengarah ke naskah lengkap (tanpa pembahasan).
- **Rating** adalah perkiraan dari jenis lomba dan nomor soal: AJHSME 500–1460, AMC 8 600–1560, AMC 10 900–2100, AMC 12 1100–2420, AIME 1700–2680.
- **Alur mengerjakan:** klik *Kerjakan* (waktu mulai tercatat), lalu isi jawaban (A–E, atau 0–999 untuk AIME), buka *Kunci jawaban*, lalu tandai sendiri *Benar*/*Salah*. Jawaban yang diketik tetap tersimpan, jadi orang tua bisa mencocokkannya kapan saja.
- **Soal yang belum benar muncul lagi** (ditandai "↻ Ulangan") setelah diselingi minimal 1 paket. Maksimal 3 soal ulangan per paket (dan tidak lebih dari sepertiga paket), dan satu soal paling banyak muncul 3 kali.
- **Naik level otomatis:** jika Ken menjawab benar minimal **75%** soal di **2 paket berturut-turut**, level naik 100 (misalnya 700–1300 menjadi 800–1400).
- Tab **Riwayat**, **Statistik** (ketepatan, waktu per soal, persentase benar per paket, hasil per jenis lomba dan per rating), dan **Sumber belajar**.

## Cara kerja

Tidak ada server dan tidak ada workflow terjadwal. Paket dibuat **di browser** saat tombol *Keluarkan soal baru* diklik, lalu disimpan ke **Firebase yang sama dengan dashboard informatika**, di jalur terpisah `/k/<PIN>/math`.

> AoPS memakai pemeriksaan anti-bot (Cloudflare), sehingga kunci jawaban tidak bisa dibaca otomatis. Karena itu Ken menilai jawabannya sendiri dengan membuka halaman kunci jawaban.

## Alamat

- Website: <https://kenara758.github.io/Latihan-Matematika-Ken/>
- Repository: <https://github.com/KenAra758/Latihan-Matematika-Ken>

Pertama kali membuka website di sebuah perangkat, masukkan **PIN keluarga** yang sama dengan dashboard informatika.

### Jika muncul pesan "Paket baru belum bisa disimpan"

Artinya aturan (rules) Firebase hanya mengizinkan jalur tertentu. Buka **Firebase Console → Realtime Database → Rules**. Pastikan izin baca/tulis diberikan pada tingkat `k/$pin`, bukan hanya untuk `registered` dan `started`. Contoh:

```json
{
  "rules": {
    "k": {
      "$pin": {
        ".read": "$pin === 'PIN_KELUARGA'",
        ".write": "$pin === 'PIN_KELUARGA'"
      }
    }
  }
}
```

## Pemakaian sehari-hari

| Ingin… | Caranya |
|---|---|
| Mengubah level secara manual | Buka **Pengaturan level (untuk orang tua)** di bawah daftar soal. Jika soal paket sekarang belum ada yang dikerjakan, soalnya langsung diganti. Jika sudah, level baru berlaku mulai paket berikutnya. |
| Salah memilih jumlah soal | **Pengaturan level → Batalkan paket sekarang & pilih ulang jumlah soal** (hanya bisa jika belum ada soal yang dikerjakan). |
| Mengubah jumlah soal awal | Ubah `problemsPerPack` pada `config.json` (dipakai sebelum ada angka yang diisi). |
| Mengubah syarat naik level | Ubah `minPercent`, `consecutivePacks`, atau `step` di bagian `autoPromote` pada `config.json`. |
| Mematikan salah satu jenis lomba | Ubah menjadi `false` di bagian `contests` pada `config.json` (misalnya `"AMC12": false`). |
| Menambah naskah tahun terbaru | Naikkan angka di `lastYear` pada `config.json` setelah naskahnya ada di AoPS Wiki (misalnya `"AMC10": 2026` setelah AMC 10 bulan November). |
| Salah menandai Benar/Salah | Klik **ubah** di samping status soal. |

## Menjalankan di komputer sendiri

```bash
python -m http.server 4378
```
Lalu buka <http://localhost:4378>.
