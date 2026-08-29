export default class Usuario {
    #id
    #name
    #lastname
    #cc
    #email
    #pass

    constructor(id, name, lastname, cc, email, pass) {
        this.#id = id;
        this.#name = name;
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

    static registrar() {
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
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault(); // evita que la página se recargue

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
}