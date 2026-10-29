
"use strict";

window.KopiBanuaData = Object.freeze({
  app: Object.freeze({
    name: "Kopi Banua",
    version: "1.0.0",
    currency: "IDR",
    locale: "id-ID",
    timezone: "Asia/Makassar"
  }),

  contact: Object.freeze({
    phoneDisplay: "+62 857-0596-1143",
    whatsappNumber: "6285705961143",
    email: "fatihhikmalr@gmail.com",
    instagram: "@kopibanua.bjm",
    address: "Jl. Sultan Adam No. 42, Banjarmasin"
  }),

  storage: Object.freeze({
    orders: "kopibanua.orders.v1",
    customer: "kopibanua.customer.v1"
  }),

  order: Object.freeze({
    minimumQuantity: 1,
    maximumQuantity: 20,
    maximumNoteLength: 500
  }),

  menu: Object.freeze([
    Object.freeze({
      id: "kopi-susu",
      name: "Kopi Susu Gula Aren",
      category: "Coffee · Milk",
      description:
        "Perpaduan kopi, susu creamy, dan manis legit gula aren.",
      price: 18000,
      image: "img/es-kopi-susu.jpg",
      available: true,
      featured: true
    }),

    Object.freeze({
      id: "kopi-tubruk",
      name: "Kopi Hitam Tubruk",
      category: "Black Coffee",
      description:
        "Karakter robusta yang kuat dengan aroma kopi yang khas.",
      price: 12000,
      image: "img/americano.jpg",
      available: true,
      featured: true
    }),

    Object.freeze({
      id: "roti-srikaya",
      name: "Roti Bakar Srikaya",
      category: "Light Bites",
      description:
        "Roti hangat dengan isian srikaya yang lembut dan manis.",
      price: 15000,
      image: "img/roti-bakar-srikaya.jpg",
      available: true,
      featured: false
    }),

    Object.freeze({
      id: "teh-tarik",
      name: "Es Teh Tarik",
      category: "Non Coffee",
      description:
        "Teh susu yang creamy dan menyegarkan.",
      price: 8000,
      image: "img/teh-tarik.jpg",
      available: true,
      featured: false
    })
  ]),

  openingHours: Object.freeze([
    Object.freeze({
      days: "Senin–Kamis",
      hours: "15.00–23.00 WITA"
    }),
    Object.freeze({
      days: "Jumat",
      hours: "16.00–00.00 WITA"
    }),
    Object.freeze({
      days: "Sabtu–Minggu",
      hours: "15.00–01.00 WITA"
    })
  ])
});

console.info("Kopi Banua: data.js berhasil dimuat.");
