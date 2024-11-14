import API_BASE_URL from './urlHelper.js';


import { verificarYRenovarToken } from './authToken.js';

// Obtener el token JWT desde localStorage
const token = localStorage.getItem('jwt');

// Decodificar el JWT para obtener el idUsuario
let idUsuario = null;

function decodeJWT(token) {
    try {
        const payloadBase64 = token.split('.')[1];
        const payload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(payload);
    } catch (error) {
        console.error('Error al decodificar el JWT:', error);
        return null;
    }
}

if (token) {
    const decoded = decodeJWT(token);
    if (decoded && decoded.idUsuario) {
        idUsuario = decoded.idUsuario;
    } else {
        showNotification('Token inválido o no contiene idUsuario.', 'bg-red-500');
    }
} else {
    showNotification('No se encontró el token de autenticación.', 'bg-red-500');
}

// Elementos del DOM
const pedidosTableBody = document.getElementById('pedidosTableBody');
const paymentModal = document.getElementById('paymentModalOverlay');
const closeModalButton = document.getElementById('closeModal');
const cancelPaymentButton = document.getElementById('cancelPayment');
const proceedToPaymentButton = document.getElementById('proceedToPayment');
const confirmPaymentTypeButton = document.getElementById('confirmPaymentType');
const closePaymentTypeModalButton = document.getElementById('closePaymentTypeModal');
const modalPedidoId = document.getElementById('modalPedidoId');
const modalTotal = document.getElementById('modalTotal');
const modalDireccion = document.getElementById('modalDireccion'); // Elemento para mostrar la dirección
const notification = document.getElementById('notification');
const paymentTypeModal = document.getElementById('paymentTypeModal');
const paymentMethodSelect = document.getElementById('paymentMethod');
const paymentDetails = document.getElementById('paymentDetails');
const qrImage = document.getElementById('qrImage');
const comprobanteFileInput = document.getElementById('comprobanteFile');

// Variable para almacenar el pedido seleccionado
let pedidoSeleccionado = null;

// Función para mostrar notificaciones
function showNotification(message, bgColor) {
    if (!notification) return;
    notification.textContent = message;
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 text-white font-semibold text-center ${bgColor} rounded shadow-md`;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 5000);
}

// Función para obtener los pedidos desde la API
async function fetchPedidos() {

    // Verificar y renovar el token antes de cualquier solicitud
    await verificarYRenovarToken();

    if (!idUsuario) {
        showNotification('Error: idUsuario no disponible.', 'bg-red-500');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/pedidos/${idUsuario}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success) {
            renderPedidos(data.pedidos);
        } else {
            showNotification(data.message, 'bg-red-500');
        }
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        showNotification('Error al obtener los pedidos. Intenta nuevamente.', 'bg-red-500');
    }
}

// function renderPedidos(pedidos) {
//     pedidosTableBody.innerHTML = '';

//     pedidos.forEach((pedido) => {
//         const tr = document.createElement('tr');

//         // ID Pedido
//         const tdIdPedido = document.createElement('td');
//         tdIdPedido.textContent = pedido.idPedido;
//         tdIdPedido.className = 'py-3 px-6 border-b';
//         tr.appendChild(tdIdPedido);

//         // Total
//         const tdTotal = document.createElement('td');
//         tdTotal.textContent = `S/${Number(pedido.total).toFixed(2)}`;
//         tdTotal.className = 'py-3 px-6 border-b';
//         tr.appendChild(tdTotal);

//         // Estado
//         const tdEstado = document.createElement('td');
//         tdEstado.textContent = capitalizeFirstLetter(pedido.estado);
//         tdEstado.className = pedido.estado.toLowerCase() === 'completado'
//             ? 'py-3 px-6 border-b text-green-500 font-semibold'
//             : 'py-3 px-6 border-b';
//         tr.appendChild(tdEstado);

//         // Acción
//         const tdAccion = document.createElement('td');
//         const estadosConAmbosBotones = ['aprobando', 'en preparacion', 'enviado', 'completado'];

//         if (estadosConAmbosBotones.includes(pedido.estado.toLowerCase())) {
//             const botonVerEstado = document.createElement('button');
//             botonVerEstado.textContent = 'Ver Estado';
//             botonVerEstado.className = `px-4 py-2 ${pedido.estado.toLowerCase() === 'completado' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded mr-2`;
//             botonVerEstado.addEventListener('click', () => abrirEstadoModal(pedido.estado));

//             const botonVerDetalles = document.createElement('button');
//             botonVerDetalles.textContent = 'Ver Detalles';
//             botonVerDetalles.className = `px-4 py-2 ${pedido.estado.toLowerCase() === 'completado' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`;
//             botonVerDetalles.addEventListener('click', () => abrirModal(pedido));

//             tdAccion.appendChild(botonVerEstado);
//             tdAccion.appendChild(botonVerDetalles);
//         } else {
//             const botonDetalles = document.createElement('button');
//             botonDetalles.textContent = 'Ver Detalles';
//             botonDetalles.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
//             botonDetalles.addEventListener('click', () => abrirModal(pedido));
//             tdAccion.appendChild(botonDetalles);
//         }

//         tdAccion.className = 'py-3 px-6 border-b';
//         tr.appendChild(tdAccion);

//         pedidosTableBody.appendChild(tr);
//     });
// }


function renderPedidos(pedidos) {
    pedidosTableBody.innerHTML = '';

    pedidos.forEach((pedido) => {
        const tr = document.createElement('tr');

        // ID Pedido
        const tdIdPedido = document.createElement('td');
        tdIdPedido.textContent = pedido.idPedido;
        tdIdPedido.className = 'py-3 px-6 border-b';
        tr.appendChild(tdIdPedido);

        // Total
        const tdTotal = document.createElement('td');
        tdTotal.textContent = `S/${Number(pedido.total).toFixed(2)}`;
        tdTotal.className = 'py-3 px-6 border-b';
        tr.appendChild(tdTotal);

        // Estado
        const tdEstado = document.createElement('td');
        tdEstado.textContent = capitalizeFirstLetter(pedido.estado);
        tdEstado.className = pedido.estado.toLowerCase() === 'completado'
            ? 'py-3 px-6 border-b text-green-500 font-semibold'
            : 'py-3 px-6 border-b';
        tr.appendChild(tdEstado);

        // Acción
        const tdAccion = document.createElement('td');
        const estadosConAmbosBotones = ['aprobando', 'en preparacion', 'enviado', 'completado'];

        if (estadosConAmbosBotones.includes(pedido.estado.toLowerCase())) {
            const botonVerEstado = document.createElement('button');
            botonVerEstado.textContent = 'Ver Estado';
            botonVerEstado.className = `px-4 py-2 ${pedido.estado.toLowerCase() === 'completado' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded mr-2`;
            botonVerEstado.addEventListener('click', () => abrirEstadoModal(pedido.estado));

            const botonVerDetalles = document.createElement('button');
            botonVerDetalles.textContent = 'Ver Detalles';
            botonVerDetalles.className = `px-4 py-2 ${pedido.estado.toLowerCase() === 'completado' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`;
            botonVerDetalles.addEventListener('click', () => abrirModal(pedido));

            tdAccion.appendChild(botonVerEstado);
            tdAccion.appendChild(botonVerDetalles);
        } else {
            const botonDetalles = document.createElement('button');
            botonDetalles.textContent = 'Ver Detalles';
            botonDetalles.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
            botonDetalles.addEventListener('click', () => abrirModal(pedido));
            tdAccion.appendChild(botonDetalles);
        }

        // Botón Cancelar Pedido (solo si está pendiente)
        if (pedido.estado.toLowerCase() === 'pendiente') {
            const botonCancelar = document.createElement('button');
            botonCancelar.textContent = 'Cancelar Pedido';
            botonCancelar.className = 'px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2';
            botonCancelar.addEventListener('click', () => cancelarPedido(pedido.idPedido));
            tdAccion.appendChild(botonCancelar);
        }

        tdAccion.className = 'py-3 px-6 border-b';
        tr.appendChild(tdAccion);

        pedidosTableBody.appendChild(tr);
    });
}


async function cancelarPedido(idPedido) {

    // Verificar y renovar el token antes de cualquier solicitud
    await verificarYRenovarToken();

    const confirmacion = confirm('¿Estás seguro de que deseas cancelar este pedido?');
    if (!confirmacion) return;

    document.getElementById("loadingScreen").classList.remove("hidden");

    try {
        const response = await fetch(`${API_BASE_URL}/api/cancelarPedido`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ idPedido })
        });

        if (response.ok) {
            alert('Pedido cancelado exitosamente');
            // Ocultar el loader después de la operación
            document.getElementById("loadingScreen").classList.add("hidden");
            // Recargar la página si se cancela el pedido con éxito
            location.reload();
        } else {
            // Ocultar el loader después de la operación
            document.getElementById("loadingScreen").classList.add("hidden");
            alert('Error al cancelar el pedido');
        }
    } catch (error) {
        // Ocultar el loader después de la operación
        document.getElementById("loadingScreen").classList.add("hidden");
        console.error('Error:', error);
    }
}


// Función para obtener la dirección del pedido
async function obtenerDireccionPedido(idPedido) {

        // Verificar y renovar el token antes de cualquier solicitud
        await verificarYRenovarToken();

    try {
        const response = await fetch(`${API_BASE_URL}/api/obtenerDireccionPedidoUser/${idPedido}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success) {
            // Mostrar la dirección en el modal
            const direccion = data.direccion;
            modalDireccion.innerHTML = `
                <p><strong>Región:</strong> ${direccion.region}</p>
                <p><strong>Provincia:</strong> ${direccion.provincia}</p>
                <p><strong>Dirección:</strong> ${direccion.direccion}</p>
            `;
        } else {
            showNotification(data.message, 'bg-red-500');
        }
    } catch (error) {
        console.error('Error al obtener la dirección del pedido:', error);
        showNotification('Error al obtener la dirección del pedido. Intenta nuevamente.', 'bg-red-500');
    }
}

// Función para abrir el modal de detalles del pedido
function abrirModal(pedido) {
    pedidoSeleccionado = pedido;
    modalPedidoId.textContent = pedido.idPedido;
    modalTotal.textContent = `S/${Number(pedido.total).toFixed(2)}`;
    renderDetalles(pedido.detalles);

    // Llamar a la función para obtener y mostrar la dirección
    obtenerDireccionPedido(pedido.idPedido);

    paymentModal.classList.remove('hidden');

    const estadosParaOcultarPago = ['aprobando', 'en preparacion', 'enviando', 'completado'];

    if (estadosParaOcultarPago.includes(pedido.estado.toLowerCase())) {
        proceedToPaymentButton.style.display = 'none';
    } else {
        proceedToPaymentButton.style.display = 'inline-block';
    }
}

// Función para cerrar el modal de detalles
function cerrarModal() {
    if (paymentModal) paymentModal.classList.add('hidden');
    pedidoSeleccionado = null;

    if (proceedToPaymentButton) {
        proceedToPaymentButton.style.display = 'inline-block';
    }
}

if (proceedToPaymentButton) {
    proceedToPaymentButton.addEventListener('click', () => {
        paymentModal.classList.add('hidden');
        paymentTypeModal.classList.remove('hidden');
    });
}

// Controlar la selección de tipo de pago
if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', function() {
        if (this.value === 'yape' || this.value === 'plin') {
            paymentDetails.classList.remove('hidden');
            qrImage.src = this.value === 'yape' ? '../../img/yapeqr.jpg' : '../../img/plinqr.png';
        } else {
            paymentDetails.classList.add('hidden');
        }
    });
}

// Validar archivo adjunto
function validarArchivoAdjunto() {
    const selectedMethod = paymentMethodSelect.value;
    const file = comprobanteFileInput.files[0];

    if ((selectedMethod === 'yape' || selectedMethod === 'plin') && !file) {
        alert('Por favor, adjunte un archivo de comprobante para proceder.');
        return false;
    }
    return true;
}

// Confirmar el tipo de pago y adjuntar comprobante
if (confirmPaymentTypeButton) {
    confirmPaymentTypeButton.addEventListener('click', async () => {


        const selectedMethod = paymentMethodSelect.value;

        // Si es Yape o Plin, validamos el archivo adjunto y enviamos con comprobante
        if (selectedMethod === 'yape' || selectedMethod === 'plin') {
            if (!validarArchivoAdjunto()) {
                return;
            }

            const formData = new FormData();
            formData.append('comprobante', comprobanteFileInput.files[0]);
            formData.append('metodo_pago', selectedMethod);

  

            document.getElementById("loadingScreen").classList.remove("hidden");

            // Verificar y renovar el token antes de cualquier solicitud
            await verificarYRenovarToken();
         
            fetch(`${API_BASE_URL}/api/procesar-pago/${pedidoSeleccionado.idPedido}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            }).then(response => response.json()).then(data => {
                document.getElementById("loadingScreen").classList.add("hidden");
                if (data.success) {
                    var sonido = new Audio('../../songs/success.mp3');
                    sonido.play().catch(error => console.error("Error al reproducir el sonido:", error));
                    showNotification('Pago procesado exitosamente.', 'bg-green-500');
                    cerrarPaymentTypeModal();
                    fetchPedidos();
                } else {
                    var sonido = new Audio('../../songs/error.mp3');
                    sonido.play().catch(error => console.error("Error al reproducir el sonido:", error));
                    showNotification(data.message || 'Error al procesar el pago.', 'bg-red-500');
                }
            }).catch(error => console.error("Error al procesar el pago:", error));
        
        // Si es "Pago en efectivo", solo enviamos el método de pago sin comprobante
        } else if (selectedMethod === 'efectivo') {
            document.getElementById("loadingScreen").classList.remove("hidden");

            // Verificar y renovar el token antes de cualquier solicitud
            await verificarYRenovarToken();

            fetch(`${API_BASE_URL}/api/procesar-pago/${pedidoSeleccionado.idPedido}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ metodo_pago: 'efectivo' })
            }).then(response => response.json()).then(data => {
                document.getElementById("loadingScreen").classList.add("hidden");
                if (data.success) {
                    var sonido = new Audio('../../songs/success.mp3');
                    sonido.play().catch(error => console.error("Error al reproducir el sonido:", error));
                    showNotification('Pago en efectivo confirmado', 'bg-green-500');
                    cerrarPaymentTypeModal();
                    fetchPedidos();
                } else {
                    var sonido = new Audio('../../songs/error.mp3');
                    sonido.play().catch(error => console.error("Error al reproducir el sonido:", error));
                    showNotification(data.message || 'Error al confirmar el pago en efectivo.', 'bg-red-500');
                }
            }).catch(error => console.error("Error al confirmar el pago en efectivo:", error));
        }
    });
}

// Función para cerrar el modal de tipo de pago
function cerrarPaymentTypeModal() {
    paymentTypeModal.classList.add('hidden');
}

// Evento para cerrar el modal al hacer clic en el botón "X"
if (closePaymentTypeModalButton) {
    closePaymentTypeModalButton.addEventListener('click', cerrarPaymentTypeModal);
}

// También permite cerrar el modal con la tecla "Escape"
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        cerrarPaymentTypeModal();
    }
});

// Función para renderizar los detalles del pedido en el modal
function renderDetalles(detalles) {
    const modalDetalles = document.getElementById('modalDetalles');
    modalDetalles.innerHTML = '';

    detalles.forEach(detalle => {
        const tr = document.createElement('tr');
        
        const tdIdDetalle = document.createElement('td');
        tdIdDetalle.textContent = detalle.idDetallePedido;
        tdIdDetalle.className = 'py-2 px-4 border';
        tr.appendChild(tdIdDetalle);

        const tdIdProducto = document.createElement('td');
        tdIdProducto.textContent = detalle.idProducto;
        tdIdProducto.className = 'py-2 px-4 border';
        tr.appendChild(tdIdProducto);

        const tdProducto = document.createElement('td');
        tdProducto.textContent = detalle.nombreProducto;
        tdProducto.className = 'py-2 px-4 border';
        tr.appendChild(tdProducto);

        const tdCantidad = document.createElement('td');
        tdCantidad.textContent = detalle.cantidad;
        tdCantidad.className = 'py-2 px-4 border';
        tr.appendChild(tdCantidad);

        const tdPrecioUnitario = document.createElement('td');
        tdPrecioUnitario.textContent = `S/${Number(detalle.precioUnitario).toFixed(2)}`;
        tdPrecioUnitario.className = 'py-2 px-4 border';
        tr.appendChild(tdPrecioUnitario);

        const tdSubtotal = document.createElement('td');
        tdSubtotal.textContent = `S/${Number(detalle.subtotal).toFixed(2)}`;
        tdSubtotal.className = 'py-2 px-4 border';
        tr.appendChild(tdSubtotal);

        modalDetalles.appendChild(tr);
    });
}

// Función para abrir el modal de estado con línea de tiempo
function abrirEstadoModal(estadoActual) {
    const estados = ['aprobando', 'en preparacion', 'enviado', 'completado'];
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    estados.forEach((estado, index) => {
        const estadoElement = document.createElement('div');
        estadoElement.className = 'flex flex-col items-center';
        const isActive = estados.indexOf(estadoActual.toLowerCase()) >= index;
        
        estadoElement.innerHTML = `
            <div class="w-8 h-8 flex items-center justify-center rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}">
                <span class="text-white font-bold">${index + 1}</span>
            </div>
            <p class="mt-2 text-sm ${isActive ? 'text-green-600 font-semibold' : 'text-gray-600'}">${capitalizeFirstLetter(estado)}</p>
            ${index < estados.length - 1 ? '<div class="h-8 border-l-2 border-gray-300"></div>' : ''}
        `;
        timeline.appendChild(estadoElement);
    });

    document.getElementById('estadoModal').classList.remove('hidden');
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function cerrarEstadoModal() {
    document.getElementById('estadoModal').classList.add('hidden');
}


// Asignar eventos para cerrar el modal de detalles si los elementos existen
if (closeModalButton) closeModalButton.addEventListener('click', cerrarModal);
if (cancelPaymentButton) cancelPaymentButton.addEventListener('click', cerrarModal);

// Inicializar la carga de pedidos al cargar la página
document.addEventListener('DOMContentLoaded', fetchPedidos);



// Asignar eventos de cierre al botón de cierre del modal de estado
const closeEstadoModalButton = document.getElementById('closeEstadoModal');
if (closeEstadoModalButton) {
    closeEstadoModalButton.addEventListener('click', cerrarEstadoModal);
}
