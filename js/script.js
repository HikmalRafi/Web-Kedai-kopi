```javascript
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  console.info("Kopi Banua: JavaScript berhasil dijalankan.");

  // 1. Mengambil elemen formulir
  const formPemesanan = document.querySelector("#pesan form");
  const selectMenu = document.querySelector("#menu-pilihan");
  const inputJumlah = document.querySelector("#jumlah");
  const inputWhatsApp = document.querySelector("#wa");

  // 2. Tombol pesan otomatis memilih menu
  const tombolPesan = document.querySelectorAll("[data-menu]");

  tombolPesan.forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      const menu = tombol.dataset.menu;

      if (selectMenu && menu) {
        selectMenu.value = menu;
      }
    });
  });

  // 3. Validasi jumlah pesanan, minimal 1 dan maksimal 20
  if (inputJumlah) {
    function validasiJumlah() {
      const jumlah = Number(inputJumlah.value);

      if (
        inputJumlah.value === "" ||
        !Number.isInteger(jumlah) ||
        jumlah < 1 ||
        jumlah > 20
      ) {
        inputJumlah.setCustomValidity(
          "Jumlah pesanan harus antara 1 sampai 20."
        );
      } else {
        inputJumlah.setCustomValidity("");
      }
    }

    inputJumlah.addEventListener("input", validasiJumlah);
    inputJumlah.addEventListener("change", validasiJumlah);
  }

  // 4. Validasi nomor WhatsApp
  if (inputWhatsApp) {
    inputWhatsApp.addEventListener("input", function () {
      const nomor = inputWhatsApp.value.trim();
      const nomorBersih = nomor.replace(/[\s()-]/g, "");

      if (
        nomorBersih !== "" &&
        !/^\+?[0-9]{9,16}$/.test(nomorBersih)
      ) {
        inputWhatsApp.setCustomValidity(
          "Masukkan nomor WhatsApp yang valid."
        );
      } else {
        inputWhatsApp.setCustomValidity("");
      }
    });
  }

  // 5. Validasi sebelum formulir dikirim
  if (formPemesanan) {
    formPemesanan.addEventListener("submit", function (event) {
      if (!formPemesanan.checkValidity()) {
        event.preventDefault();
        formPemesanan.reportValidity();
      }
    });
  }

  // 6. Memperbarui tahun pada footer secara otomatis
  const footer = document.querySelector("footer");
  const teksFooter = footer
    ? footer.querySelector("p")
    : null;

  if (teksFooter) {
    const tahun = new Date().getFullYear();

    teksFooter.innerHTML =
      "&copy; " +
      tahun +
      " <strong>Kopi Banua</strong>. Seluruh hak cipta dilindungi.";
  }

  // 7. Navigasi menuju bagian halaman
  const tautanNavigasi = document.querySelectorAll(
    'nav a[href^="#"]'
  );

  tautanNavigasi.forEach(function (tautan) {
    tautan.addEventListener("click", function () {
      const targetId = tautan.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
});
```