// """""""backend?????"""""""
import Usuario from './public/classes/Usuario.js';
import express from 'express';
import fs from 'fs';
import bcrypt from 'bcrypt';
import session from 'express-session';


const app = express();
const PORT = 3000;

const usuarioActivo = new Usuario();

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

    console.log(req.session.usuarioId);
    console.log("Login exitoso");

    res.json({
        mensaje: "Inicio de sesión exitoso."
    });
});

app.post("/logout", (req, res) => { // cerrar sesion

    usuarioActivo = null;

    req.session.destroy(() => {
        res.json({
            mensaje: "Sesión cerrada"
        });
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
    

});


app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});