/**
 * PROYECTO: Tablero Galería de Arte y Subastas
 * ARCHIVO: principal.js
 * DESCRIPCIÓN: Lógica global para la gestión del catálogo de arte (CRUD),
 * subastas virtuales, Drag & Drop nativo y gestión de equipo.
 */

// ==========================================
// 1. INICIALIZACIÓN DE ARREGLOS EN MEMORIA
// ==========================================

// 12 registros precargados con nombres de archivos de imagen correspondientes a la carpeta 'img/productos/'
const obrasPreCargadas = [
    { id: 1, titulo: "Noche Estrellada", artista: "Vincent Van Gogh", puja: 120000, icono: "img/productos/noche_estrellada.jpg", estilo: "Postimpresionismo", vip: false },
    { id: 2, titulo: "La Persistencia de la Memoria", artista: "Salvador Dalí", puja: 95000, icono: "img/productos/persistencia.jpg", estilo: "Surrealismo", vip: false },
    { id: 3, titulo: "El Grito", artista: "Edvard Munch", puja: 110000, icono: "img/productos/el_grito.jpg", estilo: "Expresionismo", vip: false },
    { id: 4, titulo: "Mona Lisa", artista: "Leonardo da Vinci", puja: 850000, icono: "🎨", estilo: "Renacimiento", vip: false },
    { id: 5, titulo: "Guernica", artista: "Pablo Picasso", puja: 300000, icono: "🎨", estilo: "Cubismo", vip: false },
    { id: 6, titulo: "La Joven de la Perla", artista: "Johannes Vermeer", puja: 75000, icono: "🎨", estilo: "Renacimiento", vip: false },
    { id: 7, titulo: "El Beso", artista: "Gustav Klimt", puja: 150000, icono: "🎨", estilo: "Surrealismo", vip: false },
    { id: 8, titulo: "Las Meninas", artista: "Diego Velázquez", puja: 200000, icono: "🎨", estilo: "Renacimiento", vip: false },
    { id: 9, titulo: "Nacimiento de Venus", artista: "Sandro Botticelli", puja: 180000, icono: "🎨", estilo: "Renacimiento", vip: false },
    { id: 10, titulo: "Creación de Adán", artista: "Miguel Ángel", puja: 400000, icono: "🎨", estilo: "Renacimiento", vip: false }
];

// Integrantes precargados sincronizados exactamente con los nombres de archivo de tu carpeta 'img/equipo/'
const equipoPreCargado = [
    { id: 1, nombre: "Jonathan Eli", rol: "Ingeniería en Sistemas", carnet: "JE202601", imagen: "img/equipo/integrante1.jpg" },
    { id: 2, nombre: "Brandon", rol: "Frontend Developer", carnet: "BR202602", imagen: "img/equipo/integrante2.jpg" },
    { id: 3, nombre: "Katherine Peña", rol: "JS Developer", carnet: "KP202604", imagen: "img/equipo/integrante3.jpg" }
];

// Carga del estado desde LocalStorage o arreglos por defecto
let obras = JSON.parse(localStorage.getItem('galeria_obras')) || obrasPreCargadas;
let integrantes = JSON.parse(localStorage.getItem('galeria_equipo')) || equipoPreCargado;

// Variables de control de UI
let obraActualId = null;
let ordenAscendente = true;

// ==========================================
// 2. CONTROLADOR DE EVENTOS DOM (Ciclo de Vida)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización según la página HTML activa en el navegador
    if (document.getElementById('galeriaContenedor')) {
        renderizarGaleria();
        inicializarDragAndDrop();
    }
    if (document.getElementById('tablaObras')) {
        renderizarTablaCRUD();
        document.getElementById('formObra').addEventListener('submit', agregarObra);
    }
    if (document.getElementById('gridIntegrantes')) {
        renderizarEquipo();
        document.getElementById('formIntegrante').addEventListener('submit', guardarIntegrante);
    }
});

// ==========================================
// 3. FUNCIONES PRINCIPALES DE JAVASCRIPT
// ==========================================

/**
 * FUNCIÓN 1: Renderizar Galería Principal y Salón VIP
 * Dibuja de manera dinámica las tarjetas de las obras aplicando validación de imágenes/emojis.
 */
function renderizarGaleria(obrasFiltradas = obras) {
    const contenedor = document.getElementById('galeriaContenedor');
    const zonaVIP = document.getElementById('zonaVIP');
    
    if (!contenedor) return;

    // Limpiar contenedores cuidando la persistencia estructural
    contenedor.innerHTML = '';
    const elementosVIP = zonaVIP.querySelectorAll('.card');
    elementosVIP.forEach(el => el.remove());

    obrasFiltradas.forEach(obra => {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.dataset.id = obra.id;
        
        // Validación dinámica de recursos: comprueba si es un archivo de imagen o un emoji de respaldo
        const esRutaImagen = obra.icono && (obra.icono.includes('.') || obra.icono.includes('/'));
        const contenidoVisual = esRutaImagen 
            ? `<img src="${obra.icono}" alt="${obra.titulo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`
            : `<div style="font-size: 3rem;">${obra.icono}</div>`;
        
        card.innerHTML = `
            <div class="card-img-placeholder" style="background: #111; overflow: hidden; display: flex; justify-content: center; align-items: center;">
                ${contenidoVisual}
            </div>
            <h3 class="card-title">${obra.titulo}</h3>
            <p class="card-subtitle">${obra.artista} - ${obra.estilo}</p>
            <p class="card-price">Puja: $${obra.puja.toLocaleString()}</p>
            <button class="btn-secondary w-100" style="margin-top: 10px" onclick="abrirModalPuja(${obra.id})">Pujar</button>
        `;

        // Evento nativo DragStart para la transferencia de identificadores
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', obra.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        // Clasificación de destino en el DOM basado en el estado lógico
        if (obra.vip) {
            zonaVIP.appendChild(card);
        } else {
            contenedor.appendChild(card);
        }
    });
}

/**
 * FUNCIÓN 2: Implementación de Drag & Drop Nativo
 * Captura y procesa los eventos dragover, dragleave y drop para actualizar el estado del catálogo.
 */
function inicializarDragAndDrop() {
    const zonaVIP = document.getElementById('zonaVIP');
    const contenedorGeneral = document.getElementById('galeriaContenedor');

    [zonaVIP, contenedorGeneral].forEach(zona => {
        if (!zona) return;
        
        zona.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            zona.classList.add('dragover');
            e.dataTransfer.dropEffect = 'move';
        });

        zona.addEventListener('dragleave', () => {
            zona.classList.remove('dragover');
        });

        zona.addEventListener('drop', (e) => {
            e.preventDefault();
            zona.classList.remove('dragover');
            
            const idObra = parseInt(e.dataTransfer.getData('text/plain'));
            const esVIP = zona.id === 'zonaVIP';
            
            const indice = obras.findIndex(o => o.id === idObra);
            if (indice !== -1) {
                obras[indice].vip = esVIP;
                guardarEnMemoria();
                renderizarGaleria();
                mostrarMensaje('Estado de exhibición actualizado', 'success');
            }
        });
    });
}

/**
 * FUNCIÓN 3: Agregar y Validar Obras (Inventario CRUD)
 * Procesa el formulario, realiza validaciones de negocio y autocompleta rutas locales de productos.
 */
function agregarObra(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value.trim();
    const artista = document.getElementById('artista').value.trim();
    const puja = parseFloat(document.getElementById('puja').value);
    let entradaIcono = document.getElementById('icono').value.trim();
    const estilo = document.getElementById('estilo').value;

    // Validación obligatoria de datos numéricos
    if (puja <= 0) {
        mostrarMensaje('Error: La puja inicial debe ser mayor a $0', 'error');
        return;
    }

    // Autocompletado inteligente hacia la carpeta local del proyecto
    if (entradaIcono.includes('.') && !entradaIcono.startsWith('img/') && !entradaIcono.startsWith('http')) {
        entradaIcono = `img/productos/${entradaIcono}`;
    }

    const nuevaObra = {
        id: Date.now(), 
        titulo,
        artista,
        puja,
        icono: entradaIcono || "🎨",
        estilo,
        vip: false
    };

    obras.push(nuevaObra);
    guardarEnMemoria();
    renderizarTablaCRUD();
    e.target.reset();
    mostrarMensaje('Obra incorporada al inventario', 'success');
}

/**
 * FUNCIÓN 4: Filtrado y Ordenación Algorítmica del Catálogo
 * Realiza el ordenamiento por valor monetario y aplica filtros por categorías de estilos artísticos.
 */
function filtrarYOrdenar() {
    const estiloFiltro = document.getElementById('filtroEstilo').value;
    let filtradas = estiloFiltro === 'Todos' ? [...obras] : obras.filter(o => o.estilo === estiloFiltro);
    renderizarGaleria(filtradas);
}

function ordenarPorValor() {
    ordenAscendente = !ordenAscendente;
    const estiloFiltro = document.getElementById('filtroEstilo').value;
    let arregloAOrdenar = estiloFiltro === 'Todos' ? [...obras] : obras.filter(o => o.estilo === estiloFiltro);
    
    // Algoritmo de ordenación nativo basado en el precio de puja
    arregloAOrdenar.sort((a, b) => ordenAscendente ? a.puja - b.puja : b.puja - a.puja);
    renderizarGaleria(arregloAOrdenar);
    mostrarMensaje(`Ordenado de ${ordenAscendente ? 'menor a mayor' : 'mayor a menor'} valor`, 'success');
}

/**
 * FUNCIÓN 5: Gestión del Registro de Ofertas Económicas (Ventanas Modales)
 * Controla el flujo interactivo de validación de ofertas simuladas utilizando la API HTML5 <dialog>.
 */
function abrirModalPuja(id) {
    obraActualId = id;
    const obra = obras.find(o => o.id === id);
    document.getElementById('obraTituloPuja').textContent = obra.titulo;
    document.getElementById('pujaActualTexto').textContent = `$${obra.puja.toLocaleString()}`;
    document.getElementById('nuevaPuja').value = obra.puja + 500; // Incremento sugerido estándar
    document.getElementById('modalPuja').showModal();
}

function cerrarModalPuja() {
    document.getElementById('modalPuja').close();
    obraActualId = null;
}

// Vinculación del envío del formulario del diálogo de pujas
const formPuja = document.getElementById('formPuja');
if (formPuja) {
    formPuja.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevaPuja = parseFloat(document.getElementById('nuevaPuja').value);
        const obra = obras.find(o => o.id === obraActualId);

        // Validación estricta: la oferta debe superar el valor histórico anterior
        if (nuevaPuja > obra.puja) {
            obra.puja = nuevaPuja;
            guardarEnMemoria();
            renderizarGaleria();
            cerrarModalPuja();
            mostrarMensaje('¡Oferta aceptada y registrada!', 'success');
        } else {
            mostrarMensaje('Error: La oferta debe ser estrictamente superior a la puja actual', 'error');
        }
    });
}

// ==========================================
// 4. FUNCIONES AUXILIARES Y GESTIÓN DE EQUIPO
// ==========================================

/**
 * Renders de las tablas de administración (Inventario)
 */
function renderizarTablaCRUD() {
    const tbody = document.getElementById('tablaObras');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    obras.forEach(obra => {
        const esRutaImagen = obra.icono && (obra.icono.includes('.') || obra.icono.includes('/'));
        const contenidoVisual = esRutaImagen 
            ? `<img src="${obra.icono}" alt="img" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px;">`
            : `<span style="font-size: 1.5rem;">${obra.icono}</span>`;

        tbody.innerHTML += `
            <tr>
                <td>${contenidoVisual}</td>
                <td><strong>${obra.titulo}</strong></td>
                <td>${obra.artista}</td>
                <td style="color: var(--accent-orange); font-weight: bold;">$${obra.puja.toLocaleString()}</td>
                <td>${obra.estilo}</td>
                <td>
                    <button class="btn-danger" onclick="eliminarObra(${obra.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function eliminarObra(id) {
    if (confirm('¿Seguro que desea eliminar de forma permanente esta obra?')) {
        obras = obras.filter(o => o.id !== id);
        guardarEnMemoria();
        renderizarTablaCRUD();
        mostrarMensaje('Obra eliminada de la memoria', 'success');
    }
}

/**
 * Gestión del Equipo de Trabajo (Página integrantes.html)
 */
function renderizarEquipo() {
    const grid = document.getElementById('gridIntegrantes');
    if (!grid) return;
    
    grid.innerHTML = '';
    integrantes.forEach(int => {
        const esRutaImagen = int.imagen && (int.imagen.includes('.') || int.imagen.includes('/'));
        const contenidoVisual = esRutaImagen 
            ? `<img src="${int.imagen}" alt="${int.nombre}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`
            : int.imagen;

        grid.innerHTML += `
            <div class="card" style="display: flex; gap: 1rem; align-items: center; cursor: default;">
                <div style="width: 80px; height: 80px; background: #1a1a1a; display: flex; justify-content: center; align-items: center; border-radius: 8px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--border-color);">
                    ${contenidoVisual}
                </div>
                <div style="flex: 1">
                    <h3 style="margin-bottom: 5px">${int.nombre}</h3>
                    <p style="color: var(--primary); margin-bottom: 5px">${int.rol}</p>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Carnet: ${int.carnet}</p>
                </div>
                <div>
                    <button class="btn-danger" onclick="eliminarIntegrante(${int.id})">🗑️</button>
                </div>
            </div>
        `;
    });
}

function abrirModalIntegrante() { document.getElementById('modalIntegrante').showModal(); }
function cerrarModalIntegrante() { document.getElementById('modalIntegrante').close(); }

function guardarIntegrante(e) {
    e.preventDefault();
    
    let entradaImagen = document.getElementById('intImagen').value.trim();
    
    // Autocompletado de carpetas relativas del espacio de trabajo de equipo
    if (!entradaImagen.startsWith('img/') && !entradaImagen.startsWith('http') && entradaImagen !== "") {
        entradaImagen = `img/equipo/${entradaImagen}`;
    }

    const nuevoInt = {
        id: Date.now(),
        nombre: document.getElementById('intNombre').value.trim(),
        rol: document.getElementById('intRol').value.trim(),
        carnet: document.getElementById('intCarnet').value.trim(),
        imagen: entradaImagen || "👨‍🎓" 
    };
    
    integrantes.push(nuevoInt);
    guardarEnMemoria();
    renderizarEquipo();
    cerrarModalIntegrante();
    e.target.reset();
    mostrarMensaje('Integrante registrado exitosamente', 'success');
}

function eliminarIntegrante(id) {
    if (confirm('¿Remover a este integrante del equipo de trabajo?')) {
        integrantes = integrantes.filter(i => i.id !== id);
        guardarEnMemoria();
        renderizarEquipo();
        mostrarMensaje('Integrante removido', 'success');
    }
}

/**
 * Persistencia interna y Toasts de notificación
 */
function guardarEnMemoria() {
    localStorage.setItem('galeria_obras', JSON.stringify(obras));
    localStorage.setItem('galeria_equipo', JSON.stringify(integrantes));
}

function mostrarMensaje(msg, tipo) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast ${tipo}`;
    setTimeout(() => toast.className = 'toast', 3000);
}