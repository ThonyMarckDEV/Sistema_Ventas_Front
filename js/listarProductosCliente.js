import API_BASE_URL from './urlHelper.js';
import { agregarAlCarrito } from './agregarCarrito.js';
import { verificarYRenovarToken } from './authToken.js';

document.addEventListener("DOMContentLoaded", () => {
    fetchProductos();
});

async function fetchProductos() {
    await verificarYRenovarToken();

    const token = localStorage.getItem("jwt"); 

    try {
        const response = await fetch(`${API_BASE_URL}/api/productos`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            throw new Error("Error al cargar productos");
        }

        const data = await response.json();
        displayProductos(data.data);
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

function displayProductos(productos) {
    const tableBody = document.querySelector("#productosTable tbody");
    tableBody.innerHTML = "";

    productos.forEach(producto => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${producto.nombreProducto}</td>
            <td>${producto.descripcion}</td>
            <td>${producto.nombreCategoria}</td>
            <td>${producto.precio}</td>
            <td>${producto.stock}</td>
            <td><img src="${producto.imagen ? `${API_BASE_URL}/storage/${producto.imagen}` : '../../img/default-product.jpg'}" alt="${producto.nombreProducto}" class="w-20 h-20 object-cover rounded"></td>
            <td>
                <button onclick="agregarAlCarrito(${producto.idProducto})" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Agregar al Carrito
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Añadir un log para verificar que se agregaron correctamente las filas
    console.log("Productos cargados: ", document.querySelectorAll("#productosTable tbody tr"));
}

function buscarProducto() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#productosTable tbody tr");

    console.log("Buscando: ", input); // Para verificar qué se está buscando

    rows.forEach(row => {
        const productoNombre = row.cells[0].innerText.toLowerCase();
        if (productoNombre.includes(input)) {
            row.style.display = ""; // Muestra la fila si coincide con la búsqueda
        } else {
            row.style.display = "none"; // Oculta la fila si no coincide
        }
    });

    // Verificar qué filas están visibles después de filtrar
    console.log("Filas después de buscar: ", rows);
}

// Asignar las funciones al contexto global para que estén disponibles en HTML
window.agregarAlCarrito = agregarAlCarrito;
window.buscarProducto = buscarProducto;
