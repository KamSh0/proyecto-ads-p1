// """""""backend?????"""""""
import Items from './public/classes/Items.js';
import Pago from './public/classes/Pago.js';
import Usuario from './public/classes/Usuario.js';
import express from 'express';
import fs from 'fs';
import bcrypt from 'bcrypt';
import session from 'express-session';
import items from './items.json' with {type: 'json'};
import readline from 'readline/promises';


const app = express();
const PORT = 3000;

const usuarioActivo = new Usuario();
const itemsActivos = new Items();

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const rl =  readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

app.use(express.json()); // interpretar JSON como objeto
app.use(express.static("public")); // los archivos dentro de la carpeta public pueden ser enviados directamente al navegador

app.use(session({
    secret: 'the-chinese-godfather',
    resave: false,
    saveUninitialized: false
}));

app.post("/register", async (req, res) => { // Cuando alguien haga una petición HTTP POST a /registrar, ejecuta esta función

    const {
        name,
        lastname,
        cc,
        email,
        pass
    } = req.body // datos del formulario

    // Leer usuarios existentes
    const usuarios = JSON.parse(
        fs.readFileSync("./usuarios.json", "utf8") 
    );

    // Comprobar si el correo ya existe
    const existe = usuarios.find(
        usuario => usuario.email === email
    );

    if (existe) {
        return res.status(400).json({ // respuesta si el correo existe
            mensaje: "Este correo ya está registrado."
        });
    }

    // Crear hash de la contraseña
    const passwordHash = await bcrypt.hash(pass, 12);

    // Crear nuevo usuario (con datos del formulario)
    const nuevoUsuario = {
        id: usuarios.length + 1,
        name: name,
        lastname: lastname,
        cc: cc,
        email: email,
        pass: passwordHash,
        points: 0
    };


    // Agregarlo al array
    usuarios.push(nuevoUsuario);

    // Guardar nuevamente el JSON
    fs.writeFileSync(
        "usuarios.json",
        JSON.stringify(usuarios, null, 4)
    );

    req.session.usuarioId = nuevoUsuario.id;

    // Instancia class Usuario
    usuarioActivo.id = nuevoUsuario.id;
    usuarioActivo.name = nuevoUsuario.name;
    usuarioActivo.lastname = nuevoUsuario.lastname;
    usuarioActivo.cc = nuevoUsuario.cc;
    usuarioActivo.email = nuevoUsuario.email;
    usuarioActivo.pass = nuevoUsuario.pass;
    usuarioActivo.points = nuevoUsuario.points;

    res.json({ // respuesta si todo el proceso es exitoso
        mensaje: "Usuario registrado correctamente."
    });

});

app.post("/login", async (req, res) => { // Login del usuario
    console.log("Inicio login");

    const {
        email,
        password
    } = req.body;

    const usuarios = JSON.parse( // obtener usuarios
        fs.readFileSync("./usuarios.json", "utf8")
    );

    const usuario = usuarios.find(user => user.email === email); // comparar si el email existe

    if (!usuario) {
        console.log("Usuario no existe")
        return res.status(401).json({
            mensaje: "Correo o contraseña incorrectos."
        });
    };

    const correcta = await bcrypt.compare( // comparar contraseñas
        password,
        usuario.pass
    );

    if (!correcta) {
        console.log("Password incorrecta");
        return res.status(401).json({
            mensaje: "Correo o contraseña incorrectos."
        });
    };

    // guardar informacion de sesion

    req.session.usuarioId = usuario.id;

    // Instanciar class Usuario
    usuarioActivo.id = usuario.id;
    usuarioActivo.name = usuario.name;
    usuarioActivo.lastname = usuario.lastname;
    usuarioActivo.cc = usuario.cc;
    usuarioActivo.email = usuario.email;
    usuarioActivo.pass = usuario.pass;
    usuarioActivo.points = usuario.points;

    console.log(req.session.usuarioId);
    console.log("Login exitoso");

    res.json({
        mensaje: "Inicio de sesión exitoso."
    });
});

app.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error al cerrar sesión:", err);
            return res.status(500).json({ error: "No se pudo cerrar sesión" });
        }
        console.log("Sesión cerrada.");
        res.clearCookie('connect.sid');
        res.json({ mensaje: "Sesión cerrada exitosamente" }); // 👈 esto faltaba
    });
});

async function requiereLogin(req, res, next) { // detener accion, si no hay sesion activa
    console.log("Inicio login check");

    if (!req.session.usuarioId) {
        console.log("Sesion no iniciada");
        return res.status(401).json({
            mensaje: "Debes iniciar sesión"
        });
    }

    console.log("Sesion iniciada (next)")
    next(); // continuar, en caso de que exista usuarioId
}

app.post("/points", requiereLogin, async (req, res) => { // acceder a los puntos
    const x = req.body;

    console.log("Inicio acceso a puntos");

    const usuarios = JSON.parse( // obtener usuarios
        fs.readFileSync("./usuarios.json", "utf8")
    );

    const usuario = usuarios.find(user => user.id === parseInt(req.session.usuarioId)); // detectar al usuario
    console.log(usuario);

    const points = usuario.points;
    console.log(points);

    res.json({
        valor: points
    });
});

app.post("/payment", async (req, res) => {
    try {
        if (itemsActivos.calcularTotal() <= 0 || isNaN(itemsActivos.calcularTotal())) {
            console.log("Error: Productos no ingresados");
            return res.status(400).json({
                error: "Por favor, ingrese productos."
            });
        }

        let {
            medioDePago,
            sentPoints,
        } = req.body;

        let extraPoints = 0;

        if (!req.session.usuarioId) {
            console.log("No hay sesion de usuario");
            sentPoints *= 0;
        }  
        if (sentPoints > usuarioActivo.points || sentPoints < 0) {
            console.log("Error: Se ha intentado pagar con mas puntos de los existentes.");
            return res.status(400).json({
                error: "Por favor, ingrese una cantidad válida de puntos."
            });
        } else {
            console.log("Inicio solicitud de pago.")

            let totalPayment = itemsActivos.calcularTotal();
            const hasSpecialDiscount = Pago.calcularDescuento(totalPayment);

            console.log("A pagar antes de descuentos: " + totalPayment)
            
            if (hasSpecialDiscount && req.session.usuarioId) {
                console.log("El usuario tiene descuento.")
                totalPayment *= 0.9
            } else {
                console.log("El usuario NO tiene descuento.")
                !hasSpecialDiscount;
            }

            if (req.session.usuarioId) {
                console.log("El usuario acumula puntos.")
                extraPoints = Pago.calcularPuntos(totalPayment);
                usuarioActivo.points += extraPoints;
            }

            const finalTotalPayment = {
                final: (totalPayment - parseInt(sentPoints))
            }; 

            console.log("Pago final (- puntos - descuentos) = " + finalTotalPayment.final)

            const respuesta = await fetch(`${baseUrl}/payment-confirmation`, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(finalTotalPayment)
            })

            const mensaje = await respuesta.json();

            if (mensaje.failed) {
                console.log("Pago rechazado (/payment)");
                res.json({
                    error: mensaje.failed
                });
            } else {
                console.log("Pago confirmado (/payment)");

                const infoFactura = {
                    cashOrCard: medioDePago,
                    final: totalPayment,
                    hasSpecialDiscount: hasSpecialDiscount,
                    spentPoints: sentPoints,
                    addedPoints: extraPoints
                };

                await fetch(`${baseUrl}/get-ticket`, {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify(infoFactura)
                });

                console.log("Reiniciar items.")
                itemsActivos.reiniciar();

                if (req.session.usuarioId) {
                    const usuarios = JSON.parse( // obtener usuarios
                        fs.readFileSync("./usuarios.json", "utf8")
                    );

                    const usuario = usuarios.find(user => user.id === usuarioActivo.id);

                    console.log("\nPuntos ganados = " + extraPoints);
                    console.log("Puntos pagados = " + sentPoints);

                    usuario.points += extraPoints;
                    usuario.points -= sentPoints;

                    fs.writeFileSync("./usuarios.json", JSON.stringify(usuarios, null, 4));

                    console.log("\nCierre de sesion.")

                    usuarioActivo.cerrarSesion();
                    req.session.destroy((err) => {
                        if (err) console.log("Error al cerrar sesión:", err);
                        else console.log("Sesión cerrada tras el pago.");
                    });
                }

                console.log("\n\nMostrar mensaje de confirmacion...")
                res.json({
                    confirmation: mensaje.confirmation
                })
            }
        }
    } catch (error) {
        console.error("Error en /payment:", error);
        res.status(500).json({ error: "Error interno al procesar el pago." });
    }

    
});

app.post("/payment-confirmation", async (req, res) => { // Confirmacion de pago (backend)
    const {
        final
    } = req.body;

    console.log("Valor a pagar = " + final);
    const received = await rl.question("\n\nCONFIMAR PAGO  =  ");

    if (parseInt(received) === final) {
        console.log("------PAGO APROBADO------")

        res.json({
            confirmation: "Pago realizado exitosamente."
        });
    } else {
        console.log("------PAGO RECHAZADO------")

        res.json({
            failed: "Pago rechazado. Por favor, intente efectuarlo nuevamente."
        });
    }
});

app.post("/add-to-cart", async (req, res) => {
    const {
        id
    } = req.body

    console.log("Solicitud de agregar al carrito.");
    console.log(items);
    console.log(id);

    const item = items.find(producto => producto.id === parseInt(id))

    console.log(item);

    if (item) {
        itemsActivos.agregarProducto(item.id, item.name, item.price);

        res.json({
            existe: true,
            id: item.id,
            precio: item.price,
            nombre: item.name
        })
    } else {
        res.json({
            error: "El ID solicitado no corresponde a ningún producto."
        })
    }
});

app.get("/cart", (req, res) => {
    console.log("\nCarrito en backend: " + itemsActivos.ids)

    res.json({
        ids: itemsActivos.ids,  
        nombres: itemsActivos.nombres,
        precios: itemsActivos.precios
    });
});

app.get("/payment-preview", async (req, res) => {
    const totalPrecios = itemsActivos.calcularTotal();

    console.log("Total de precios backend = "+ totalPrecios)

    res.json({
        totalPrecios: totalPrecios
    });
});

app.get("/get-active-user-data", requiereLogin, async (req, res) => {
    
    res.json({
        id: usuarioActivo.id,
        name: usuarioActivo.name,
        lastname: usuarioActivo.lastname,
        cc: usuarioActivo.cc,
        points: usuarioActivo.points
    })

});

function descargarFactura(url, nombre) {
  // Create a temporary hidden anchor element
  const link = document.createElement('a');
  link.href = url;
  
  // The download attribute forces the browser to save instead of navigate
  link.download = nombre; 
  
  // Append to the body, click it programmatically, then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

app.post("/get-ticket", async (req, res) => {
    const {
        cashOrCard,
        final,
        hasSpecialDiscount,
        spentPoints,
        addedPoints
    } = req.body

    console.log("Generando factura...\n\n");

    let factura = `
FACTURA DE VENTA
TIENDA UPB

`;

    factura += `FECHA: ${new Date().toISOString()}\n`

    if (usuarioActivo.id) {
        factura += `CLIENTE: ${usuarioActivo.name + " " + usuarioActivo.lastname}\n`
        factura += `CC CLIENTE: ${usuarioActivo.cc}\n`
        factura += `CLIENTE REGISTRADO EN TIENDA UPB\n`
    } else {
        factura += `CLIENTE: CONSUMIDOR FINAL\n`
        factura += `CC CLIENTE: 222222222222\n`
        factura += `CLIENTE NO REGISTRADO EN TIENDA UPB\n`
    }

    factura += `\n`
    factura += `PRODUCTOS: \n`

    for (let i in itemsActivos.ids) {
        factura += `    ITEM: ${i}  ID: ${itemsActivos.ids[i]}  NOMBRE: ${itemsActivos.nombres[i]}  PRECIO: ${itemsActivos.precios[i]}\n`
    }

    factura += `\n`
    factura += `SUBTOTAL: ${itemsActivos.calcularTotal()}\n`

    if (hasSpecialDiscount) {
        factura += `DESCUENTO: ${itemsActivos.calcularTotal()*0.1}\n`
    } else {
        factura += `DESCUENTO: NO APLICA\n`
    }

    factura += `\n`

    if (usuarioActivo.id) {
        factura += `PUNTOS PAGADOS: ${spentPoints}\n`
        factura += `PUNTOS GANADOS: ${addedPoints}\n`
    } else {
        factura += `PUNTOS PAGADOS: NO APLICA\n`
        factura += `PUNTOS GANADOS: NO APLICA\n`
    }

    factura += `\n`

    factura += `TOTAL A PAGAR: ${final}\n`
    factura += `MEDIO DE PAGO: ${cashOrCard}\n`

    console.log(factura);

    fs.writeFileSync("./public/factura.txt", factura);

    res.json({
        mensaje: "Factura exitosa."
    })
});



app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});