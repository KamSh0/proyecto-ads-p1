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