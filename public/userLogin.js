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