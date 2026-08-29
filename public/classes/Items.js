export default class Items {
    #ids = [];
    #nombres = [];
    #precios = [];
    
    get precios() {
        return this.#precios;
    }

    set precios(precios) {
        this.#precios = precios;
    }

    get nombres() {
        return this.#nombres;
    }

    set nombres(nombres) {
        this.#nombres = nombres;
    }

    get ids() {
        return this.#ids;
    }

    set ids(ids) {
        this.#ids = ids;
    }

    agregarProducto(id, nombre, precio) {
        this.#ids.push(id);
        this.#nombres.push(nombre);
        this.#precios.push(precio);
    }

    quitarUltimoProducto() {
        this.#precios.pop()
    }

    calcularTotal() {
        let totalPrecios = 0;
        for (let i of this.#precios) {
            totalPrecios += i;
        }

        return totalPrecios;
    }

    reiniciar() {
        this.#ids = [];
        this.#nombres = [];
        this.#precios = [];
    }

    static pedirItem() {
        document.getElementById("item-list-form").addEventListener("submit", async (event) => { // escuchar el submit
            event.preventDefault(); // prevenir recarga
            
            const idSolicitado = parseInt(document.getElementById("requested-item-id").value);

            if (idSolicitado === null || idSolicitado === '' || isNaN(idSolicitado)) {
                console.log("empty ID");
                alert("Por favor, ingrese un ID.");
                return;
            }

            const sentRequest = {
                id: idSolicitado
            }

            console.log(idSolicitado);
            const respuesta = await fetch ("/add-to-cart", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(sentRequest)
            })

            const mensaje = await respuesta.json();

            if (mensaje.existe) {
                console.log("ID Encontrado.");
                

                const itemTable = document.getElementById("dynamic-item-table");
                const row = document.createElement("tr"); // crear elemento en el html


                

                row.innerHTML = `
                <td>${mensaje.id}</td>
                <td>${mensaje.nombre}</td>
                <td>${mensaje.precio}</td>        
                `;

                console.log(itemTable);

                itemTable.appendChild(row); // agregar fila con informacion del item especificado

                const total = await fetch("/payment-preview");

                const totalmensaje = await total.json()

                document.getElementById("dynamic-item-table-total").textContent = totalmensaje.totalPrecios;
            } else {
                console.log("ID No Encontrado.");
                alert("Item no encontrado, asegúrese de que el ID es correcto.");
            }   
        });
    }

    static mostrarCarritoActual() {
        window.addEventListener("DOMContentLoaded", async () => {
            const res = await fetch("/cart"); // nuevo endpoint que debes crear
            const carrito = await res.json();

            const itemTable = document.getElementById("dynamic-item-table");


            for (let i in carrito.ids) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${carrito.ids[i]}</td>
                    <td>${carrito.nombres[i]}</td>
                    <td>${carrito.precios[i]}</td>
                `;

                itemTable.appendChild(row);
            }

            document.getElementById("dynamic-item-table-total").textContent = carrito.total;
        });
    }
}