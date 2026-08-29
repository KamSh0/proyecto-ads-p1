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

    static calcularDescuento(valor) {
        if (valor > 50000) {
            return true;
        } else {
            return false;
        }
    }

    static async efectuarPago() {
        document.getElementById("method-pay").addEventListener("click", async (event) => {
            event.preventDefault();

            if (document.getElementById("method-payWPoints").disabled === true) {
                const sentPoints = document.getElementById("sent-points").value;
                console.log("Puntos enviados " + sentPoints);
            } else {
                const sentPoints = 0;
                console.log(sentPoints + "<- Puntos no enviados");
            }

            const costoTotal = {
                precio,
                puntos
            }
            

            const respuesta = fetch("/payment", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({valorTotal})
            });

            const resultado = respuesta.json();

            console.log(resultado);


        });
    }
}