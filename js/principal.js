// ==========================================
// 1. INICIALIZACIÓN DE ARREGLOS EN MEMORIA
// ==========================================

// Pre-carga de 10 registros solicitados
const obrasPreCargadas = [
    { id: 1, titulo: "Noche Estrellada", artista: "Vincent Van Gogh", puja: 120000, icono: "🌌", estilo: "Postimpresionismo", vip: false },
    { id: 2, titulo: "La Persistencia de la Memoria", artista: "Salvador Dalí", puja: 95000, icono: "⏳", estilo: "Surrealismo", vip: false },
    { id: 3, titulo: "El Grito", artista: "Edvard Munch", puja: 110000, icono: "😱", estilo: "Expresionismo", vip: false },
    { id: 4, titulo: "Mona Lisa", artista: "Leonardo da Vinci", puja: 850000, icono: "👩", estilo: "Renacimiento", vip: false },
    { id: 5, titulo: "Guernica", artista: "Pablo Picasso", puja: 300000, icono: "🐂", estilo: "Cubismo", vip: false },
    { id: 6, titulo: "La Joven de la Perla", artista: "Johannes Vermeer", puja: 75000, icono: "✨", estilo: "Renacimiento", vip: false },
    { id: 7, titulo: "El Beso", artista: "Gustav Klimt", puja: 150000, icono: "💏", estilo: "Surrealismo", vip: false },
    { id: 8, titulo: "Las Meninas", artista: "Diego Velázquez", puja: 200000, icono: "👑", estilo: "Renacimiento", vip: false },
    { id: 9, titulo: "Nacimiento de Venus", artista: "Sandro Botticelli", puja: 180000, icono: "🐚", estilo: "Renacimiento", vip: false },
    { id: 10, titulo: "Creación de Adán", artista: "Miguel Ángel", puja: 400000, icono: "🤝", estilo: "Renacimiento", vip: false }
];

const equipoPreCargado = [
    { id: 1, nombre: "Jonathan Eli", rol: "Full-Stack Developer", carnet: "JE202601", icono: "👨‍💻" },
    { id: 2, nombre: "Brandon", rol: "Frontend Developer", carnet: "BR202602", icono: "👨‍💻" },
    { id: 3, nombre: "Katherine Peña", rol: "JS Developer", carnet: "KP202604", icono: "👩‍💻" }
];

// Carga desde localStorage o uso de valores por defecto
let obras = JSON.parse(localStorage.getItem('galeria_obras')) || obrasPreCargadas;
let integrantes = JSON.parse(localStorage.getItem('galeria_equipo')) || equipoPreCargado;

// Variables globales para lógica de UI
let obraActualId = null;
let ordenAscendente = true;

// ==========================================
// 2. FUNCIONES DE RENDERIZADO Y DOM
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Detectar en qué página estamos para inicializar los datos correspondientes
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

// Función 1: Renderizar Galería Principal y VIP
function renderizarGaleria(obrasFiltradas = obras) {
    const contenedor = document.getElementById('galeriaContenedor');
    const zonaVIP = document.getElementById('zonaVIP');
    
    if(!contenedor) return;

    contenedor.innerHTML = '';
    
    // Limpiar zona VIP manteniendo el texto guía
    const elementosVIP = zonaVIP.querySelectorAll('.card');
    elementosVIP.forEach(el => el.remove());

    obrasFiltradas.forEach(obra => {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.dataset.id = obra.id;
        
        card.innerHTML = `
            <div class="card-img-placeholder">${obra.icono}</div>
            <h3 class="card-title">${obra.titulo}</h3>
            <p class="card-subtitle">${obra.artista} - ${obra.estilo}</p>
            <p class="card-price">Puja: $${obra.puja.toLocaleString()}</p>
            <button class="btn-secondary w-100" style="margin-top: 10px" onclick="abrirModalPuja(${obra.id})">Pujar</button>
        `;

        // Evento nativo DragStart
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

// ==========================================
// 3. FUNCIONES DE DRAG & DROP (Nativo)
// ==========================================

// Función 2: Implementación Drag & Drop
function inicializarDragAndDrop() {
    const zonaVIP = document.getElementById('zonaVIP');
    const contenedorGeneral = document.getElementById('galeriaContenedor');

    [zonaVIP, contenedorGeneral].forEach(zona => {
        if(!zona) return;
        
        zona.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necesario para permitir el drop
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
            
            // Actualizar arreglo global y guardar
            const indice = obras.findIndex(o => o.id === idObra);
            if(indice !== -1) {
                obras[indice].vip = esVIP;
                guardarEnMemoria();
                renderizarGaleria();
                mostrarMensaje('Obra movida exitosamente', 'success');
            }
        });
    });
}

// ==========================================
// 4. FUNCIONES DE CRUD Y MODALES
// ==========================================

// Función 3: Agregar/Validar Registro (Inventario)
function agregarObra(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const artista = document.getElementById('artista').value;
    const puja = parseFloat(document.getElementById('puja').value);
    const icono = document.getElementById('icono').value;
    const estilo = document.getElementById('estilo').value;

    if (puja <= 0) {
        mostrarMensaje('La puja debe ser mayor a 0', 'error');
        return;
    }

    const nuevaObra = {
        id: Date.now(), // ID único simulado
        titulo,
        artista,
        puja,
        icono,
        estilo,
        vip: false
    };

    obras.push(nuevaObra);
    guardarEnMemoria();
    renderizarTablaCRUD();
    e.target.reset();
    mostrarMensaje('Obra registrada correctamente', 'success');
}

function eliminarObra(id) {
    if(confirm('¿Desea eliminar esta obra del inventario?')) {
        obras = obras.filter(o => o.id !== id);
        guardarEnMemoria();
        renderizarTablaCRUD();
        mostrarMensaje('Obra eliminada', 'success');
    }
}

function renderizarTablaCRUD() {
    const tbody = document.getElementById('tablaObras');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    obras.forEach(obra => {
        tbody.innerHTML += `
            <tr>
                <td style="font-size: 1.5rem;">${obra.icono}</td>
                <td><strong>${obra.titulo}</strong></td>
                <td>${obra.artista}</td>
                <td style="color: var(--accent-orange)">$${obra.puja.toLocaleString()}</td>
                <td>${obra.estilo}</td>
                <td>
                    <button class="btn-danger" onclick="eliminarObra(${obra.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// ==========================================
// 5. LÓGICA DE NEGOCIO (Pujas, Filtros, Orden)
// ==========================================

// Función 4: Validar y Procesar Oferta Económica
function abrirModalPuja(id) {
    obraActualId = id;
    const obra = obras.find(o => o.id === id);
    document.getElementById('obraTituloPuja').textContent = obra.titulo;
    document.getElementById('pujaActualTexto').textContent = `$${obra.puja.toLocaleString()}`;
    document.getElementById('nuevaPuja').value = obra.puja + 100;
    document.getElementById('modalPuja').showModal();
}

function cerrarModalPuja() {
    document.getElementById('modalPuja').close();
    obraActualId = null;
}

// Listener para el form del Modal de Pujas
const formPuja = document.getElementById('formPuja');
if(formPuja) {
    formPuja.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevaPuja = parseFloat(document.getElementById('nuevaPuja').value);
        const obra = obras.find(o => o.id === obraActualId);

        if (nuevaPuja > obra.puja) {
            obra.puja = nuevaPuja;
            guardarEnMemoria();
            renderizarGaleria();
            cerrarModalPuja();
            mostrarMensaje('Puja registrada con éxito', 'success');
        } else {
            mostrarMensaje('Error: La oferta debe ser mayor a la puja actual', 'error');
        }
    });
}

// Función 5: Algoritmo de Ordenación y Filtrado
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
    mostrarMensaje(`Ordenado ${ordenAscendente ? 'menor a mayor' : 'mayor a menor'}`, 'success');
}

// ==========================================
// 6. UTILIDADES Y CRUD DE EQUIPO
// ==========================================

function guardarEnMemoria() {
    localStorage.setItem('galeria_obras', JSON.stringify(obras));
    localStorage.setItem('galeria_equipo', JSON.stringify(integrantes));
}

function mostrarMensaje(msg, tipo) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast ${tipo}`;
    setTimeout(() => toast.className = 'toast', 3000);
}

// Lógica de Integrantes (Equipo)
function renderizarEquipo() {
    const grid = document.getElementById('gridIntegrantes');
    if(!grid) return;
    
    grid.innerHTML = '';
    integrantes.forEach(int => {
        grid.innerHTML += `
            <div class="card" style="display: flex; gap: 1rem; align-items: center; cursor: default;">
                <div style="font-size: 3rem; background: #000; padding: 10px; border-radius: 8px;">${int.icono}</div>
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
    const nuevoInt = {
        id: Date.now(),
        nombre: document.getElementById('intNombre').value,
        rol: document.getElementById('intRol').value,
        carnet: document.getElementById('intCarnet').value,
        icono: "👨‍🎓"
    };
    integrantes.push(nuevoInt);
    guardarEnMemoria();
    renderizarEquipo();
    cerrarModalIntegrante();
    e.target.reset();
    mostrarMensaje('Integrante agregado', 'success');
}

function eliminarIntegrante(id) {
    if(confirm('¿Eliminar integrante?')) {
        integrantes = integrantes.filter(i => i.id !== id);
        guardarEnMemoria();
        renderizarEquipo();
        mostrarMensaje('Integrante eliminado', 'success');
    }
}