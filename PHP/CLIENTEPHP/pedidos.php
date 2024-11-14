<!-- resources/views/pedidos.php -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Pedidos</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body class="bg-gray-100 min-h-screen flex flex-col lg:flex-row">

    <!-- Notificación -->
    <div id="notification" class="hidden fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 text-white font-semibold text-center rounded shadow-md z-50"></div>
    
    <!-- Sidebar -->
    <?php include 'sidebarCLIENTE.php'; ?>

    <!-- Contenido Principal -->
    <div class="flex-1 p-4 sm:p-6 md:p-8 lg:ml-64 w-full lg:w-full mx-auto">
        
        <!-- Encabezado -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
            <div>
                <h1 class="text-2xl font-bold">Mis Pedidos</h1>
                <nav class="text-gray-500 text-sm">
                    <span>Pedidos</span> &gt; <span>Mis Pedidos</span>
                </nav>
            </div>
        </div>

        <!-- Tabla de Pedidos -->
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded-lg overflow-hidden">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="py-3 px-6 text-left">ID Pedido</th>
                        <th class="py-3 px-6 text-left">Total</th>
                        <th class="py-3 px-6 text-left">Estado</th>
                        <th class="py-3 px-6 text-left">Acción</th>
                    </tr>
                </thead>
                <tbody id="pedidosTableBody" class="text-gray-700">
                    <!-- Las filas de pedidos serán insertadas aquí por JavaScript -->
                </tbody>
            </table>
        </div>

    </div>


<!-- Modal de detalles del pedido con overlay incluido -->
<div id="paymentModalOverlay" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative"> <!-- Ajuste de ancho aquí -->
        <!-- Botón de cierre -->
        <button id="closeModal" class="absolute top-2 right-2 text-gray-500 text-2xl font-bold hover:text-gray-700">
            &times;
        </button>
        
        <h2 class="text-xl font-bold mb-4">Detalles del Pedido</h2>
        
        <p><strong>ID Pedido:</strong> <span id="modalPedidoId"></span></p>
        <p><strong>Total:</strong> <span id="modalTotal"></span></p>
        
        <!-- Información de dirección -->
        <div id="modalDireccion" class="mb-4">
            <!-- Aquí se insertarán región, provincia y dirección del pedido -->
        </div>

       <!-- Contenedor de desplazamiento para la tabla -->
        <div class="overflow-x-auto">
            <!-- Tabla de detalles del pedido -->
            <table class="w-full border">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="px-4 py-2 border">ID Detalle</th>
                        <th class="px-4 py-2 border">ID Producto</th>
                        <th class="px-4 py-2 border">Producto</th>
                        <th class="px-4 py-2 border">Cantidad</th>
                        <th class="px-4 py-2 border">Precio Unitario</th>
                        <th class="px-4 py-2 border">Subtotal</th>
                    </tr>
                </thead>
                <tbody id="modalDetalles">
                    <!-- Detalles del pedido generados dinámicamente -->
                </tbody>
            </table>
        </div>
        
        <!-- Botón de acción para proceder al pago -->
        <div class="flex justify-end mt-4">
            <button id="proceedToPayment" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Proceder al Pago
            </button>
        </div>
    </div>
</div>
        

  <!-- Modal de Selección de Tipo de Pago -->
<div id="paymentTypeModal" class="hidden fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
    <div class="bg-white rounded-lg p-6 w-80 relative">
        <!-- Botón "X" para cerrar el modal -->
        <button id="closePaymentTypeModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-xl">X</button>

        <h2 class="text-lg font-bold mb-4">Seleccione el Tipo de Pago</h2>
        
        <!-- Opciones de Pago -->
        <select id="paymentMethod" class="w-full mb-4 p-2 border rounded">
            <option value="" selected disabled>Seleccione el tipo de pago</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
            <option value="efectivo">Efectivo</option>
        </select>
        
        <!-- Campo para el Comprobante (solo para Yape o Plin) -->
        <div id="paymentDetails" class="hidden">
            <img id="qrImage" src="../../img/yapeqr.jpg" alt="QR" class="w-32 h-32 mx-auto mb-4">
            <label class="block mb-2">Adjuntar Comprobante:</label>
            <input type="file" id="comprobanteFile" class="w-full p-2 border rounded">
        </div>
        
        <div class="flex justify-end mt-4">
            <button id="confirmPaymentType" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Confirmar</button>
        </div>
    </div>
</div>

    <!-- Modal de Estado -->
    <div id="estadoModal" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white rounded-lg w-full max-w-xs md:max-w-md lg:max-w-lg p-4 md:p-6 relative overflow-y-auto">
            <button id="closeEstadoModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
            <h2 class="text-lg md:text-xl font-bold mb-4 text-center">Estado del Pedido</h2>
            
            <!-- Línea de Tiempo -->
            <div id="timeline" class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
                <!-- Los estados de la línea de tiempo se generarán dinámicamente -->
            </div>
        </div>
    </div>

    <!-- Script para cargar pedidos -->
    <script type="module" src="../../js/pedido.js"></script>
</body>
</html>
