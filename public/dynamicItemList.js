import itemData from './items.json' with {type: 'json'}; // importar json

let itemTotal = 0

// manejo de la lista de productos
document.getElementById("item-list-form").addEventListener("submit", async (event) => { // escuchar el submit
    event.preventDefault(); // prevenir recarga
    
    const userRequestedId = parseInt(document.getElementById("requested-item-id").value);

    if (userRequestedId === null || userRequestedId === '') {
        console.log("empty ID");
        alert("Por favor, ingrese un ID.");
    }
    
    console.log(userRequestedId);
    
    const item = itemData.find(producto => producto.id === userRequestedId);

    itemTotal += item.price;

    if (item) {
        console.log("ID Encontrado.");
    } else {
        console.log("ID No Encontrado.");
        alert("Item no encontrado, asegúrese de que el ID es correcto.");
    }   

    const itemTable = document.getElementById("dynamic-item-table");
    const row = document.createElement("tr"); // crear elemento en el html

    row.innerHTML = `
    <td>${item.id}</td>
    <td>${item.name}</td>
    <td>${item.price}</td>        
    `;

    console.log(itemTable);

    itemTable.appendChild(row); // agregar fila con informacion del item especificado

    document.getElementById("dynamic-item-table-total").textContent = itemTotal;
});



/*


const userRequestedId = document.getElementById("requested-item-id");



alert('2');

const result = itemData.find()
*/