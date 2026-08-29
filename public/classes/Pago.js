export default class Pago {
    constructor() {}

    static obtenerPuntosAnteriores() {
        document.getElementById("method-payWPoints").addEventListener("click", async (event) => {
            event.preventDefault();

            const button = document.getElementById("method-payWPoints");

            const respuesta = await fetch("/points", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({sample: "text"})
            })

            const resultado = await respuesta.json();

            if (resultado.mensaje) {
                alert("Debe iniciar sesión para usar esta función.");
            } else {
                const pointsTable = document.getElementById("user-points");

                const row = document.createElement('tr');

                row.innerHTML = `
                <td>Puntos de Usuario actuales: ${resultado.valor}</td>
                <td>
                    <input id="sent-points" type="text" placeholder="Puntos a Pagar">
                </td>
                `;

                pointsTable.appendChild(row);

                button.disabled = true;
            }

        });
    }

    static efectuarPago() {
        
    }
}