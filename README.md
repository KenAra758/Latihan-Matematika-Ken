# Latihan Matematika Ken

Website latihan matematika mingguan, pasangan dari dashboard OSN Informatika (`latihan-ken`).

- Setiap **Senin 00.00 WIB** muncul **8 soal baru** dari arsip **AoPS Wiki**: AJHSME, AMC 8, AMC 10, AMC 12, dan AIME (sekitar 4.700 soal). Tingkat kesulitannya tersebar dari batas bawah sampai batas atas level (awal: rating 700–1300).
- Ditambah **2 soal bonus tantangan**, sedikit di atas level (sampai +300). Bonus tidak dihitung untuk naik level.
- **Isi soal tidak disalin.** Aplikasi hanya menyimpan nama lomba, tahun, dan nomor soal, lalu menautkan ke halaman AoPS Wiki. Tautan soal mengarah ke naskah lengkap (tanpa pembahasan), jadi aman dibuka saat mengerjakan.
- **Rating** adalah perkiraan dari jenis lomba dan nomor soal: AJHSME 500–1460, AMC 8 600–1560, AMC 10 900–2100, AMC 12 1100–2420, AIME 1700–2680.
- **Alur mengerjakan:** klik *Kerjakan* (waktu mulai tercatat), lalu isi jawaban (A–E, atau 0–999 untuk AIME), buka *Kunci jawaban*, lalu tandai sendiri *Benar*/*Salah*. Jawaban yang diketik tetap tersimpan, jadi orang tua bisa mencocokkannya kapan saja.
- Status soal: **Benar** (sebelum minggu berakhir), **Susulan** (benar setelah minggu berakhir), **Salah**, **Dilewati**, **Dikerjakan**, atau **Cek kunci**.
- **Soal yang belum benar muncul lagi** (ditandai "↻ Ulangan") setelah diselingi minimal 1 minggu. Maksimal 3 soal ulangan + 1 bonus ulangan per minggu, dan satu soal paling banyak muncul 3 kali. Pengaturannya ada di bagian `recycle` pada `config.json`.
- **Naik level otomatis:** jika Ken menjawab benar minimal 6 dari 8 soal tepat waktu selama 2 minggu berturut-turut, level naik 100 (misalnya 700–1300 menjadi 800–1400).
- Tab **Riwayat**, **Statistik** (ketepatan, waktu per soal, hasil per jenis lomba dan per rating), dan **Sumber belajar**.

## Cara kerja

Tidak ada server dan tidak ada workflow terjadwal. Paket mingguan dibuat **di browser** saat website pertama kali dibuka pada minggu itu, lalu disimpan ke **Firebase yang sama dengan dashboard informatika**, di jalur terpisah `/k/<PIN>/math`. Pembuatan paketnya pasti: data yang sama selalu menghasilkan paket yang sama, jadi dua perangkat yang membuka website bersamaan tetap mendapat paket yang identik.

> AoPS memakai pemeriksaan anti-bot (Cloudflare), sehingga kunci jawaban tidak bisa dibaca otomatis. Karena itu Ken menilai jawabannya sendiri dengan membuka halaman kunci jawaban.

## Cara memasang (sekali saja)

1. Buat repository baru di GitHub, misalnya `latihan-matematika-ken`, dengan visibilitas **Public**.
2. Unggah semua isi folder ini (termasuk folder `.github` dan file `.nojekyll`):
   ```bash
   git init -b main
   git add .
   git commit -m "Website latihan matematika Ken"
   git remote add origin https://github.com/USERNAME/latihan-matematika-ken.git
   git push -u origin main
   ```
3. Buka **Settings → Pages**, lalu di bagian **Source** pilih **GitHub Actions**.
4. Website bisa dibuka di `https://USERNAME.github.io/latihan-matematika-ken/`.
5. Masukkan **PIN keluarga** yang sama dengan dashboard informatika. Jika kedua website berada di akun GitHub yang sama, PIN biasanya sudah terisi otomatis.

### Jika muncul pesan "Paket minggu ini belum bisa disimpan"

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
| Mengubah level secara manual | Di halaman *Minggu ini*, buka **Pengaturan level (untuk orang tua)**. Jika soal minggu ini belum ada yang dikerjakan, paketnya langsung diganti. Jika sudah, level baru berlaku minggu depan. |
| Mengganti soal minggu ini | **Pengaturan level → Ganti soal minggu ini** (hanya bisa jika belum ada soal yang dikerjakan). |
| Mengubah syarat naik level | Ubah `minSolved`, `consecutiveWeeks`, atau `step` di bagian `autoPromote` pada `config.json`. |
| Mematikan salah satu jenis lomba | Ubah menjadi `false` di bagian `contests` pada `config.json` (misalnya `"AJHSME": false`). |
| Menambah naskah tahun terbaru | Naikkan angka di `lastYear` pada `config.json` setelah naskahnya ada di AoPS Wiki (misalnya `"AMC10": 2026` setelah AMC 10 bulan November). |
| Mengubah jumlah soal | Ubah `problemsPerWeek` atau `bonus.perWeek` pada `config.json`. |
| Salah menandai Benar/Salah | Klik **ubah** di samping status soal. |

## Menjalankan di komputer sendiri

```bash
python -m http.server 4378
```
Lalu buka <http://localhost:4378>.
