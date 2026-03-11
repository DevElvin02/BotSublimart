const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
    headless: true
  }
});

let pedidos = {};

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot listo');
});

client.on('message', async msg => {

    if (msg.fromMe) return;
    if (msg.from === 'status@broadcast') return;
    if (msg.from.includes('@g.us')) return;
    if (!msg.body) return;

    const texto = msg.body.toLowerCase();
    const chat = msg.from;

    // Crear registro si no existe
    if (!pedidos[chat]) {
        pedidos[chat] = { paso: "menu" };
    }

    // =========================
    // FLUJO DEL PEDIDO
    // =========================

    if (pedidos[chat].paso === "producto") {

        pedidos[chat].producto = msg.body;
        pedidos[chat].paso = "cantidad";

        await msg.reply("🔢 ¿Cuántas unidades deseas?");
        return;
    }

    if (pedidos[chat].paso === "cantidad") {

        pedidos[chat].cantidad = msg.body;

        await msg.reply(`✅ *Pedido registrado*

📦 Producto: ${pedidos[chat].producto}
🔢 Cantidad: ${pedidos[chat].cantidad}

En breve confirmaremos tu pedido.

Gracias por comprar en *Sublimart* 🙌`);

        delete pedidos[chat];
        return;
    }

    // =========================
    // MENÚ PRINCIPAL
    // =========================

    const saludos = [
    "hola",
    "buenos dias",
    "buenos días",
    "buenas tardes",
    "buenas noches",
    "menu",
    "menú"
];
    if (saludos.some(s => texto.includes(s))) {

         msg.reply(`👋 Bienvenido a *Sublimart*

Escribe una opción:

1️⃣ precios  
2️⃣ pedido  
3️⃣ ubicación  
4️⃣ catálogo`);
        return;
    }

    // PRECIOS
    if (texto === "1" || texto.includes("precio")) {

        await msg.reply(`💰 *Lista de precios Sublimart*

👕 Camisa sublimada $8  
👕 Camisa estampada $12  
🔑 Llavero sublimado $3.50  
🔑 Llavero acrílico $2.50  
🪧 Banner (metro cuadrado) $12  
🥤 Termo o botella $10  
🕒 Reloj sublimado $10  
🪙 Lámina de aluminio 20x30 cm $8  
🧩 Rompecabezas $4  
🧥 Sudadera / Suéter $25  

Escribe *pedido* o *2* para realizar un pedido.`);
        return;
    }

    // UBICACION
    if (texto === "3" || texto.includes("ubicacion") || texto.includes("ubicación")) {

        await msg.reply(`📍 *Nuestra ubicación es:*

https://maps.app.goo.gl/DNNZEz8AdcnhadgN6`);
        return;
    }

    // CATALOGO
    if (texto === "4" || texto.includes("catalogo") || texto.includes("catálogo")) {

        const media = MessageMedia.fromFilePath('./img/logo.jpg');

        await client.sendMessage(chat, media, {
            caption: "📸 *Catálogo Sublimart*\nPronto agregaremos más productos."
        });

        return;
    }

    // PEDIDO
    if (texto === "2" || texto.includes("pedido")) {

        pedidos[chat].paso = "producto";

        await msg.reply(`🛒 *Vamos a registrar tu pedido.*

Escribe el producto que deseas:

• camisa sublimada  
• camisa estampada  
• llavero sublimado  
• llavero acrilico  
• banner  
• termo  
• reloj  
• lamina aluminio  
• rompecabezas  
• sudadera`);

        return;
    }

});

client.initialize();