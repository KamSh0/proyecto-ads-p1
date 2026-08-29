export default class Pago {

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

    static calcularPuntos(valor) {
        return Math.round(valor * 0.01);
    }

    static async facturarCompra() {

        function descargarFactura(url, nombre) {

            const link = document.createElement('a');
            link.href = url;
            
            link.download = nombre; 
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        document.getElementById("method-pay").addEventListener("click", async (event) => {
            event.preventDefault();
            let sentPoints;
            const medioDePago = document.getElementById("payment-options").value;

            if (document.getElementById("method-payWPoints").disabled === true) {
                sentPoints = document.getElementById("sent-points").value;
                console.log("Puntos enviados " + sentPoints);
            } else {
                sentPoints = 0;
                console.log(sentPoints + "<- Puntos no enviados");
            }

            const costoTotal = {
                medioDePago,
                sentPoints,
            }
            

            const respuesta = await fetch("/payment", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(costoTotal)
            });

            const resultado = await respuesta.json();

            console.log(resultado);

            if (resultado.error) {
                alert(resultado.error);

            } else {
                alert(resultado.confirmation);
                descargarFactura("http://localhost:3000/factura.txt", "factura.txt");
                window.location.reload();
            }

        });
    }
}