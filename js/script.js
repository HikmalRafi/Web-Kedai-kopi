
"use strict";

(() => {
  const DATA = window.KopiBanuaData;

  if (!DATA) {
    console.error("Kopi Banua: data.js belum dimuat.");
    return;
  }

  const MENU = DATA.menu;
  const CONFIG = DATA.order;
  const STORAGE = DATA.storage;
  const WHATSAPP = DATA.contact.whatsappNumber;

  const STATUS = Object.freeze({
    PENDING: "menunggu_konfirmasi",
    CONFIRMED: "dikonfirmasi",
    PROCESSING: "diproses",
    COMPLETED: "selesai",
    CANCELLED: "dibatalkan"
  });

  const ALLOWED_STATUSES = new Set(Object.values(STATUS));

  const getMenu = (id) =>
    MENU.find((item) => item.id === id);

  const formatRupiah = (amount) =>
    new Intl.NumberFormat(DATA.app.locale, {
      style: "currency",
      currency: DATA.app.currency,
      maximumFractionDigits: 0
    }).format(amount);

  function createId() {
    const randomPart = window.crypto?.randomUUID
      ? window.crypto.randomUUID().replaceAll("-", "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);

    return `KB-${Date.now().toString(36).toUpperCase()}-${randomPart.toUpperCase()}`;
  }

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);

      if (raw === null) return fallback;

      return JSON.parse(raw);
    } catch (error) {
      console.warn(`Kopi Banua: gagal membaca ${key}.`, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Kopi Banua: gagal menyimpan ${key}.`, error);
      return false;
    }
  }

  function getOrders() {
    const orders = readStorage(STORAGE.orders, []);

    return Array.isArray(orders) ? orders : [];
  }

  function getOrder(orderId) {
    return getOrders().find((order) => order.id === orderId) || null;
  }

  function saveOrder(order) {
    const orders = getOrders();

    // Jangan menambahkan ID pesanan yang sama dua kali.
    if (orders.some((item) => item.id === order.id)) {
      return false;
    }

    orders.unshift(order);

    // Batas riwayat lokal agar penyimpanan browser tidak membesar.
    const success = writeStorage(STORAGE.orders, orders.slice(0, 100));

    return success;
  }

  function updateOrderStatus(orderId, newStatus) {
    if (!ALLOWED_STATUSES.has(newStatus)) {
      throw new Error("Status pesanan tidak valid.");
    }

    const orders = getOrders();
    const index = orders.findIndex((order) => order.id === orderId);

    if (index === -1) return false;

    orders[index] = {
      ...orders[index],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    return writeStorage(STORAGE.orders, orders);
  }

  function getCustomer() {
    const customer = readStorage(STORAGE.customer, {});

    return customer && typeof customer === "object"
      ? customer
      : {};
  }

  function saveCustomer(customer) {
    return writeStorage(STORAGE.customer, {
      name: customer.name,
      phone: customer.phone
    });
  }

  function normalizePhone(value) {
    return value.trim().replace(/[\s().-]/g, "");
  }

  function isValidPhone(value) {
    return /^\+?\d{9,16}$/.test(value);
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
  }

  function showMessage(statusElement, message) {
    statusElement.replaceChildren(
      makeElement("p", "", message)
    );
  }

  function buildSummary(order, statusElement) {
    statusElement.replaceChildren();

    const summary = makeElement("div", "order-summary");
    const heading = makeElement("h3", "", "Ringkasan Pesanan");
    const id = makeElement("p", "", `ID Pesanan: ${order.id}`);
    const name = makeElement("p", "", `Nama: ${order.customer.name}`);
    const phone = makeElement(
      "p",
      "",
      `WhatsApp: ${order.customer.phone}`
    );
    const product = makeElement(
      "p",
      "",
      `Menu: ${order.item.name} × ${order.item.quantity}`
    );
    const unitPrice = makeElement(
      "p",
      "",
      `Harga satuan: ${formatRupiah(order.item.unitPrice)}`
    );
    const total = makeElement(
      "p",
      "order-total",
      `Total: ${formatRupiah(order.total)}`
    );
    const note = makeElement(
      "p",
      "",
      `Catatan: ${order.note || "-"}`
    );
    const orderStatus = makeElement(
      "p",
      "",
      "Status: Menunggu konfirmasi kedai"
    );

    const waButton = makeElement(
      "a",
      "btn btn-primary",
      "Lanjutkan ke WhatsApp"
    );

    const message = [
      `Halo ${DATA.app.name}! Saya ingin memesan.`,
      "",
      `ID Pesanan: ${order.id}`,
      `Nama: ${order.customer.name}`,
      `Nomor WhatsApp: ${order.customer.phone}`,
      "",
      `Menu: ${order.item.name}`,
      `Harga satuan: ${formatRupiah(order.item.unitPrice)}`,
      `Jumlah: ${order.item.quantity}`,
      `Total: ${formatRupiah(order.total)}`,
      `Catatan: ${order.note || "-"}`,
      "",
      "Mohon konfirmasi ketersediaan dan pesanan saya.",
      "Terima kasih!"
    ].join("\n");

    waButton.href =
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    waButton.target = "_blank";
    waButton.rel = "noopener noreferrer";

    const disclaimer = makeElement(
      "p",
      "form-footnote",
      "Pesanan belum dikonfirmasi. Kirim pesan melalui WhatsApp dan tunggu balasan kedai."
    );

    summary.append(
      heading,
      id,
      name,
      phone,
      product,
      unitPrice,
      total,
      note,
      orderStatus,
      waButton,
      disclaimer
    );

    statusElement.appendChild(summary);
  }

  function initializeMenuButtons() {
    document.querySelectorAll("[data-menu]").forEach((button) => {
      const menuId = button.dataset.menu;
      const item = getMenu(menuId);

      if (!item || !item.available) {
        button.setAttribute("aria-disabled", "true");
        return;
      }

      button.addEventListener("click", () => {
        const select = document.getElementById("menu-pilihan");

        if (!select) return;

        select.value = item.id;
      });
    });
  }

  function initializeForm() {
    const form = document.getElementById("form-pemesanan");
    const statusElement = document.getElementById("status-form");

    if (!form || !statusElement) return;

    const nameInput = document.getElementById("nama");
    const phoneInput = document.getElementById("wa");
    const menuSelect = document.getElementById("menu-pilihan");
    const quantityInput = document.getElementById("jumlah");
    const noteInput = document.getElementById("catatan");

    // Isi data pelanggan sebelumnya, bila tersedia.
    const customer = getCustomer();

    if (customer.name && !nameInput.value) {
      nameInput.value = customer.name;
    }

    if (customer.phone && !phoneInput.value) {
      phoneInput.value = customer.phone;
    }

    // Perbarui opsi dari katalog pusat.
    // Opsi hanya memuat produk yang tersedia.
    const currentSelection = menuSelect.value;

    menuSelect.replaceChildren(
      new Option("Pilih menu favoritmu", "", true, false)
    );

    MENU.filter((item) => item.available).forEach((item) => {
      menuSelect.add(
        new Option(
          `${item.name} — ${formatRupiah(item.price)}`,
          item.id
        )
      );
    });

    if (getMenu(currentSelection)?.available) {
      menuSelect.value = currentSelection;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const name = nameInput.value.trim();
      const phone = normalizePhone(phoneInput.value);
      const menuId = menuSelect.value;
      const quantity = Number(quantityInput.value);
      const note = noteInput.value.trim();
      const item = getMenu(menuId);

      if (name.length < 2 || name.length > 100) {
        showMessage(
          statusElement,
          "Nama harus terdiri dari 2–100 karakter."
        );
        nameInput.focus();
        return;
      }

      if (!isValidPhone(phone)) {
        showMessage(
          statusElement,
          "Nomor WhatsApp tidak valid. Periksa kembali nomor yang kamu masukkan."
        );
        phoneInput.focus();
        return;
      }

      if (!item || !item.available) {
        showMessage(
          statusElement,
          "Menu tidak tersedia. Silakan pilih menu lain."
        );
        menuSelect.focus();
        return;
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < CONFIG.minimumQuantity ||
        quantity > CONFIG.maximumQuantity
      ) {
        showMessage(
          statusElement,
          `Jumlah harus ${CONFIG.minimumQuantity}–${CONFIG.maximumQuantity}.`
        );
        quantityInput.focus();
        return;
      }

      if (note.length > CONFIG.maximumNoteLength) {
        showMessage(
          statusElement,
          `Catatan maksimal ${CONFIG.maximumNoteLength} karakter.`
        );
        noteInput.focus();
        return;
      }

      const now = new Date().toISOString();

      const order = {
        id: createId(),
        createdAt: now,
        updatedAt: now,
        status: STATUS.PENDING,

        customer: {
          name,
          phone
        },

        item: {
          id: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity
        },

        subtotal: item.price * quantity,
        total: item.price * quantity,
        note,

        currency: DATA.app.currency
      };

      // Simpan data pelanggan dan pesanan secara lokal.
      const savedCustomer = saveCustomer(order.customer);
      const savedOrder = saveOrder(order);

      if (!savedOrder) {
        showMessage(
          statusElement,
          "Pesanan tidak dapat disimpan di browser ini. Periksa pengaturan penyimpanan browser dan coba kembali."
        );
        return;
      }

      buildSummary(order, statusElement);

      // Tampilkan peringatan bila browser menolak penyimpanan profil.
      if (!savedCustomer) {
        console.warn("Profil pelanggan tidak berhasil disimpan.");
      }

      statusElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    });
  }

  function initialize() {
    initializeMenuButtons();
    initializeForm();

    console.info(`${DATA.app.name} v${DATA.app.version} siap.`);
  }

  // API frontend untuk kebutuhan fitur lain dan pengujian.
  // Semua data di sini berasal dari browser lokal, bukan server.
  window.KopiBanua = Object.freeze({
    getMenu,
    getOrders,
    getOrder,
    updateOrderStatus,
    formatRupiah,

    getStatuses() {
      return { ...STATUS };
    },

    clearLocalCustomer() {
      try {
        localStorage.removeItem(STORAGE.customer);
        return true;
      } catch (error) {
        console.error("Gagal menghapus profil lokal.", error);
        return false;
      }
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }
})();
