/**
 * PROYECTO: Tablero Galería de Arte y Subastas
 * ARCHIVO: principal.js
 * DESCRIPCIÓN: Lógica global para la gestión del catálogo de arte (CRUD),
 * subastas virtuales, Drag & Drop nativo y gestión de equipo.
 */

// ==========================================
// 1. INICIALIZACIÓN DE ARREGLOS EN MEMORIA
// ==========================================

// 10 registros precargados obligatorios para la galería con rutas relativas a 'img/productos/'
const obrasPreCargadas = [
    { id: 1, titulo: "Noche Estrellada", artista: "Vincent Van Gogh", puja: 120000, icono: "img/productos/obra1.jpg", estilo: "Postimpresionismo", vip: false },
    { id: 2, titulo: "La Persistencia de la Memoria", artista: "Salvador Dalí", puja: 95000, icono: "img/productos/obra2.jpg", estilo: "Surrealismo", vip: false },
    { id: 3, titulo: "El Grito", artista: "Edvard Munch", puja: 110000, icono: "img/productos/obra3.jpg", estilo: "Expresionismo", vip: false },
    { id: 4, titulo: "Mona Lisa", artista: "Leonardo da Vinci", puja: 850000, icono: "img/productos/obra4.jpg", estilo: "Renacimiento", vip: false },
    { id: 5, titulo: "Guernica", artista: "Pablo Picasso", puja: 300000, icono: "img/productos/obra5.jpg", estilo: "Cubismo", vip: false },
    { id: 6, titulo: "La Joven de la Perla", artista: "Johannes Vermeer", puja: 75000, icono: "img/productos/obra6.jpg", estilo: "Renacimiento", vip: false },
    { id: 7, titulo: "El Beso", artista: "Gustav Klimt", puja: 150000, icono: "img/productos/obra7.jpg", estilo: "Surrealismo", vip: false },
    { id: 8, titulo: "Las Meninas", artista: "Diego Velázquez", puja: 200000, icono: "img/productos/obra8.jpg", estilo: "Renacimiento", vip: false },
    { id: 9, titulo: "Nacimiento de Venus", artista: "Sandro Botticelli", puja: 180000, icono: "img/productos/obra9.jpg", estilo: "Renacimiento", vip: false },
    { id: 10, titulo: "Creación de Adán", artista: "Miguel Ángel", puja: 400000, icono: "img/productos/obra10.jpg", estilo: "Renacimiento", vip: false }
];

// Integrantes del equipo precargados con Código de Estudiante y Número de Expediente por separado
const equipoPreCargado = [
    { id: 1, nombre: "BRANDON GEOVANNY RIVERA OLIVO", rol: "Ciberseguridad", codigoEstudiante: "RO24-I04-001", expediente: "27581", imagen: "img/equipo/integrante1.jpg" },
    { id: 2, nombre: "JONATHAN ELI MAYE AREVALO", rol: "Full Stack", codigoEstudiante: "MA24-I04-001", expediente: "27291", imagen: "img/equipo/integrante2.jpg" },
    { id: 3, nombre: "JOSE ALEXANDER RECINOS SERMEÑO", rol: "Ciberseguridad", codigoEstudiante: "RS24-I04-001", expediente: "27189", imagen: "img/equipo/integrante3.jpg" },
    { id: 4, nombre: "BRANDON ISRAEL PEREZ AREVALO", rol: "Data cientifico", codigoEstudiante: "PA24-I04-001", expediente: "27187", imagen: "img/equipo/integrante4.jpg" },
    { id: 5, nombre: "GILBERTO JOSE QUINTANILLA SARMIENTO", rol: "Analista", codigoEstudiante: "QS24-I04-001", expediente: "27729", imagen: "img/equipo/integrante5.jpg" }
];


let obras = JSON.parse(localStorage.getItem('galeria_obras_v3')) || obrasPreCargadas;
let integrantes = JSON.parse(localStorage.getItem('galeria_equipo_v3')) || equipoPreCargado;

// Variables de control de la interfaz
let obraActualId = null;
let ordenAscendente = true;

// ==========================================
// 2. CONTROLADOR DE EVENTOS DOM (Ciclo de Vida)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
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
 */
function renderizarGaleria(obrasFiltradas = obras) {
    const contenedor = document.getElementById('galeriaContenedor');
    const zonaVIP = document.getElementById('zonaVIP');
    
    if (!contenedor) return;

    contenedor.innerHTML = '';
    const elementosVIP = zonaVIP.querySelectorAll('.card');
    elementosVIP.forEach(el => el.remove());

    obrasFiltradas.forEach(obra => {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.dataset.id = obra.id;
        
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

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', obra.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        if (obra.vip) {
            zonaVIP.appendChild(card);
        } else {
            contenedor.appendChild(card);
        }
    });
}

/**
 * FUNCIÓN 2: Implementación de Drag & Drop Nativo
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
            
            const intent = obras.findIndex(o => o.id === idObra);
            if (intent !== -1) {
                obras[intent].vip = esVIP;
                guardarEnMemoria();
                renderizarGaleria();
                mostrarMensaje('Posición de la obra actualizada', 'success');
            }
        });
    });
}

/**
 * FUNCIÓN 3: Agregar y Validar Obras (Inventario CRUD)
 */
function agregarObra(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value.trim();
    const artista = document.getElementById('artista').value.trim();
    const puja = parseFloat(document.getElementById('puja').value);
    let entradaIcono = document.getElementById('icono').value.trim();
    const estilo = document.getElementById('estilo').value;

    if (puja <= 0) {
        mostrarMensaje('Error: La puja debe ser mayor a cero', 'error');
        return;
    }

    if (entradaIcono.includes('.') && !entradaIcono.startsWith('img/') && !entradaIcono.startsWith('http')) {
        entradaIcono = `img/productos/${entradaIcono}`;
    }

    const nuevaObra = {
        id: Date.now(), 
        titulo,
        artista,
        puja,
        icono: entradaIcono || "img/logo/logo.png",
        estilo,
        vip: false
    };

    obras.push(nuevaObra);
    guardarEnMemoria();
    renderizarTablaCRUD();
    e.target.reset();
    mostrarMensaje('Obra agregada exitosamente', 'success');
}

/**
 * FUNCIÓN 4: Filtrado y Ordenación Algorítmica del Catálogo
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
    
    arregloAOrdenar.sort((a, b) => ordenAscendente ? a.puja - b.puja : b.puja - a.puja);
    renderizarGaleria(arregloAOrdenar);
    mostrarMensaje(`Ordenado de ${ordenAscendente ? 'menor a mayor' : 'mayor a menor'}`, 'success');
}

/**
 * FUNCIÓN 5: Control de Ventanas Modales y Validación de Ofertas
 */
function abrirModalPuja(id) {
    obraActualId = id;
    const obra = obras.find(o => o.id === id);
    document.getElementById('obraTituloPuja').textContent = obra.titulo;
    document.getElementById('pujaActualTexto').textContent = `$${obra.puja.toLocaleString()}`;
    document.getElementById('nuevaPuja').value = obra.puja + 250; 
    document.getElementById('modalPuja').showModal();
}

function cerrarModalPuja() {
    document.getElementById('modalPuja').close();
    obraActualId = null;
}

const formPuja = document.getElementById('formPuja');
if (formPuja) {
    formPuja.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevaPuja = parseFloat(document.getElementById('nuevaPuja').value);
        const obra = obras.find(o => o.id === obraActualId);

        if (nuevaPuja > obra.puja) {
            obra.puja = nuevaPuja;
            guardarEnMemoria();
            renderizarGaleria();
            cerrarModalPuja();
            mostrarMensaje('¡Puja registrada con éxito!', 'success');
        } else {
            mostrarMensaje('Error: La oferta debe superar la puja actual', 'error');
        }
    });
}

// ==========================================
// 4. FUNCIONES AUXILIARES Y GESTIÓN DE EQUIPO
// ==========================================

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
    if (confirm('¿Desea eliminar este registro de la memoria local?')) {
        obras = obras.filter(o => o.id !== id);
        guardarEnMemoria();
        renderizarTablaCRUD();
        mostrarMensaje('Registro eliminado', 'success');
    }
}

/**
 * CRUD Dinámico del Equipo (integrantes.html) - Muestra Código y Expediente por separado
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
            <div class="card" style="display: flex; gap: 1rem; align-items: center; cursor: default; width: calc(50% - 0.75rem);">
                <div style="width: 80px; height: 80px; background: #1a1a1a; display: flex; justify-content: center; align-items: center; border-radius: 8px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--border-color);">
                    ${contenidoVisual}
                </div>
                <div style="flex: 1">
                    <h3 style="margin-bottom: 5px; font-size: 1rem; line-height: 1.2;">${int.nombre}</h3>
                    <p style="color: var(--primary); margin-bottom: 5px; font-size: 0.9rem;">${int.rol}</p>
                    <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 2px;">Cod: ${int.codigoEstudiante}</p>
                    <p style="color: var(--text-muted); font-size: 0.8rem;">Exp: ${int.expediente}</p>
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
    
    if (!entradaImagen.startsWith('img/') && !entradaImagen.startsWith('http') && entradaImagen !== "") {
        entradaImagen = `img/equipo/${entradaImagen}`;
    }

    // Almacena ambos campos por separado obtenidos del nuevo formulario HTML
    const nuevoInt = {
        id: Date.now(),
        nombre: document.getElementById('intNombre').value.trim().toUpperCase(),
        rol: document.getElementById('intRol').value.trim(),
        codigoEstudiante: document.getElementById('intCodigo').value.trim(),
        expediente: document.getElementById('intExpediente').value.trim(),
        imagen: entradaImagen || "👨‍🎓" 
    };
    
    integrantes.push(nuevoInt);
    guardarEnMemoria();
    renderizarEquipo();
    cerrarModalIntegrante();
    e.target.reset();
    mostrarMensaje('Integrante guardado en memoria', 'success');
}

function eliminarIntegrante(id) {
    if (confirm('¿Remover a este integrante del grupo?')) {
        integrantes = integrantes.filter(i => i.id !== id);
        guardarEnMemoria();
        renderizarEquipo();
        mostrarMensaje('Integrante removido', 'success');
    }
}


function guardarEnMemoria() {
    localStorage.setItem('galeria_obras_v3', JSON.stringify(obras));
    localStorage.setItem('galeria_equipo_v3', JSON.stringify(integrantes));
}

function mostrarMensaje(msg, tipo) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast ${tipo}`;
    setTimeout(() => toast.className = 'toast', 3000);
}