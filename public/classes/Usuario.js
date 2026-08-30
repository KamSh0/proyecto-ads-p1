export default class Usuario {
    #id;
    #name;
    #lastname;
    #cc;
    #email;
    #pass;
    #points;

    constructor(id, uname, lastname, cc, email, pass) {
        this.#id = id;
        this.#name = uname;
        this.#lastname = lastname;
        this.#cc = cc;
        this.#email = email;
        this.#pass = pass;
    }

    // --- getters ---
    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get lastname() {
        return this.#lastname;
    }

    get cc() {
        return this.#cc;
    }

    get email() {
        return this.#email;
    }

    get pass() {
        return this.#pass;
    }

    // --- setters ---
    set id(id) {
        this.#id = id;
    }

    set name(name) {
        this.#name = name;
    }

    set lastname(lastname) {
        this.#lastname = lastname;
    }

    set cc(cc) {
        this.#cc = cc;
    }

    set email(email) {
        this.#email = email;
    }

    set pass(pass) {
        this.#pass = pass;
    }

    static registrarCliente() {
        document.getElementById('registerForm').addEventListener('submit', async (event) => {
            event.preventDefault(); // evita que la página se recargue

            const nombre = document.getElementById('nombre').value;
            const apellidos = document.getElementById('apellidos').value;
            const cedula = document.getElementById('cedula').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            let usuario = {};

            if (nombre && apellidos && cedula && email && password) { // los atributos deben estar definidos
                usuario = {
                name: nombre,
                lastname: apellidos,
                cc: cedula,
                email: email,
                pass: password,
                points: 0
                }
                console.log("Usuario definido.");
            } else {
                alert("Por favor, rellene todos los campos.");
                console.log("Usuario no definido.");
            }



            const respuesta = await fetch("/register", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(usuario)
            });

            const resultado = await respuesta.json();

            document.getElementById("register-response").textContent = resultado.mensaje;

        });
    }

    static iniciarSesion() {
        document.getElementById('registerForm').addEventListener('submit', async (event) => {
            event.preventDefault(); // evita que la página se recargue

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const user = {
                email: email,
                password: password
            }

            const respuesta = await fetch("/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            const msg = await respuesta.json();

            document.getElementById("login-response").textContent = msg.mensaje;
        });
    }

    static mostrarDatosUsuarioActivo() { // mostrar informacion del usuario en la parte superior

        window.addEventListener("DOMContentLoaded", async () => {
            const respuesta = await fetch("/get-active-user-data"); 

            const info = await respuesta.json();

            if (info.mensaje) {

            } else {
                document.getElementById("active-user-data").textContent = (info.name + " " + info.lastname);
                document.getElementById("active-user-points").textContent = ("Puntos: " + info.points);
                document.getElementById("home-login").hidden = true;
                document.getElementById("home-register").hidden = true;

                const topBar = document.querySelector(".container-top-bar");

                const boton = document.createElement("button");

                boton.textContent = "Cerrar sesión";
                boton.id = ("logout-button");


                boton.addEventListener("click", async () => {

                    await fetch("/logout", {
                        method: "GET"
                    });

                    location.reload();
                });


                topBar.appendChild(boton);
            }
        });
    }

    cerrarSesion() {
        this.#id = undefined;
        this.#name = undefined;
        this.#lastname = undefined;
        this.#cc = undefined;
        this.#email = undefined;
        this.#pass = undefined;
        this.#points = undefined;
    }
}