/* State & Global Database Simulation */
let currentUser = null;
let activeModule = 'dashboard';
let currentEditingIndex = null;
let activeDeleteHandler = null;

// Dynamic Database Store
const DB = {
    usuarios: [
        { id: 1, usuario: 'admin', nombre: 'Carlos Ruiz', rol: 'Administrador', estado: 'Activo' },
        { id: 2, usuario: 'mlopez', nombre: 'María López', rol: 'Operador', estado: 'Activo' },
        { id: 3, usuario: 'jgonzalez', nombre: 'Juan González', rol: 'Conductor', estado: 'Inactivo' }
    ],
    vehiculos: [
        { id: 1, placa: 'TSB-101', modelo: 'Mercedes-Benz Bus', capacidad: 16, estado: 'Disponible' },
        { id: 2, placa: 'TSB-102', modelo: 'Chevrolet NHR', capacidad: 16, estado: 'Mantenimiento' },
        { id: 3, placa: 'TSB-103', modelo: 'Scania K360', capacidad: 32, estado: 'Disponible' }
    ],
    rutas: [
        { id: 1, origen: 'Medellín', destino: 'Ciudad Bolívar', precio: 25000, duracion: '2.5 hrs' },
        { id: 2, origen: 'Medellín', destino: 'Alejandría', precio: 18000, duracion: '2.0 hrs' },
        { id: 3, origen: 'Caldas', destino: 'Apartadó', precio: 75000, duracion: '7.0 hrs' },
        { id: 4, origen: 'Medellín', destino: 'Guatapé', precio: 22000, duracion: '1.8 hrs' }
    ],
    'prog-rutas': [
        { id: 1, ruta: 'Medellín - Ciudad Bolívar', hora: '08:00 AM', vehiculo: 'TSB-101', fecha: '2026-11-01' },
        { id: 2, ruta: 'Medellín - Alejandría', hora: '09:30 AM', vehiculo: 'TSB-103', fecha: '2026-11-01' }
    ],
    conductores: [
        { id: 1, nombre: 'Pedro Ramírez', documento: '10203040', licencia: 'C2', telefono: '3001234567' },
        { id: 2, nombre: 'Andrés Castro', documento: '50607080', licencia: 'C2', telefono: '3119876543' }
    ],
    'prog-conductores': [
        { id: 1, conductor: 'Pedro Ramírez', ruta: 'Medellín - Ciudad Bolívar', turno: 'Mañana' },
        { id: 2, conductor: 'Andrés Castro', ruta: 'Medellín - Alejandría', turno: 'Tarde' }
    ],
    clientes: [
        { id: 1, nombre: 'Laura Gómez', doc: '98765432', email: 'laura@email.com', telefono: '3201112233' },
        { id: 2, nombre: 'Diego Morales', doc: '11223344', email: 'diego@email.com', telefono: '3159998877' }
    ],
    'reservas-admin': [
        { id: 1, cliente: 'Laura Gómez', ruta: 'Medellín - Ciudad Bolívar', asiento: 'A04', estado: 'Confirmado' },
        { id: 2, cliente: 'Diego Morales', ruta: 'Medellín - Guatapé', asiento: 'A07', estado: 'Pendiente' }
    ],
    ventas: [
        { id: 1, reservaId: '#RES-101', cliente: 'Laura Gómez', valor: 25000, fecha: '2026-10-28' },
        { id: 2, reservaId: '#RES-102', cliente: 'Diego Morales', valor: 22000, fecha: '2026-10-29' }
    ]
};

// Schema Configurations for Dynamic CRUD
const CRUD_CONFIG = {
    usuarios: {
        title: 'Gestión de Usuarios',
        subtitle: 'Control de accesos y roles de la intranet',
        columns: ['ID', 'Usuario', 'Nombre', 'Rol', 'Estado'],
        fields: [
            { name: 'usuario', label: 'Nombre de Usuario', type: 'text' },
            { name: 'nombre', label: 'Nombre Completo', type: 'text' },
            { name: 'rol', label: 'Rol', type: 'select', options: ['Administrador', 'Operador', 'Conductor'] },
            { name: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }
        ]
    },
    vehiculos: {
        title: 'Gestión de Vehículos',
        subtitle: 'Control de la flota de buses',
        columns: ['ID', 'Placa', 'Modelo', 'Capacidad', 'Estado'],
        fields: [
            { name: 'placa', label: 'Placa', type: 'text' },
            { name: 'modelo', label: 'Modelo del Bus', type: 'text' },
            { name: 'capacidad', label: 'Capacidad Pasajeros', type: 'number' },
            { name: 'estado', label: 'Estado', type: 'select', options: ['Disponible', 'En Ruta', 'Mantenimiento'] }
        ]
    },
    rutas: {
        title: 'Gestión de Rutas',
        subtitle: 'Administración de trayectos y tarifas',
        columns: ['ID', 'Origen', 'Destino', 'Precio ($)', 'Duración'],
        fields: [
            { name: 'origen', label: 'Origen', type: 'text' },
            { name: 'destino', label: 'Destino', type: 'text' },
            { name: 'precio', label: 'Precio Pasaje ($)', type: 'number' },
            { name: 'duracion', label: 'Duración Estimada', type: 'text' }
        ]
    },
    'prog-rutas': {
        title: 'Programación de Rutas',
        subtitle: 'Asignación de salidas y horarios',
        columns: ['ID', 'Ruta', 'Hora Salida', 'Vehículo Asignado', 'Fecha'],
        fields: [
            { name: 'ruta', label: 'Ruta', type: 'text' },
            { name: 'hora', label: 'Hora de Salida', type: 'text' },
            { name: 'vehiculo', label: 'Placa Vehículo', type: 'text' },
            { name: 'fecha', label: 'Fecha de Salida', type: 'date' }
        ]
    },
    conductores: {
        title: 'Gestión de Conductores',
        subtitle: 'Personal de conductores de la empresa',
        columns: ['ID', 'Nombre', 'Documento', 'Licencia', 'Teléfono'],
        fields: [
            { name: 'nombre', label: 'Nombre Completo', type: 'text' },
            { name: 'documento', label: 'Documento Cédula', type: 'text' },
            { name: 'licencia', label: 'Categoría Licencia', type: 'text' },
            { name: 'telefono', label: 'Teléfono Contacto', type: 'text' }
        ]
    },
    'prog-conductores': {
        title: 'Programación de Conductores',
        subtitle: 'Turnos y asignación a rutas',
        columns: ['ID', 'Conductor', 'Ruta Asignada', 'Turno'],
        fields: [
            { name: 'conductor', label: 'Conductor', type: 'text' },
            { name: 'ruta', label: 'Ruta Asignada', type: 'text' },
            { name: 'turno', label: 'Turno', type: 'select', options: ['Mañana', 'Tarde', 'Noche'] }
        ]
    },
    clientes: {
        title: 'Directorio de Clientes',
        subtitle: 'Información de pasajeros registrados',
        columns: ['ID', 'Nombre', 'Documento', 'Correo Electrónico', 'Teléfono'],
        fields: [
            { name: 'nombre', label: 'Nombre Completo', type: 'text' },
            { name: 'doc', label: 'Documento', type: 'text' },
            { name: 'email', label: 'Correo Electrónico', type: 'email' },
            { name: 'telefono', label: 'Teléfono', type: 'text' }
        ]
    },
    'reservas-admin': {
        title: 'Gestión de Reservas',
        subtitle: 'Control administrativo de boletos',
        columns: ['ID', 'Cliente', 'Ruta', 'Asiento', 'Estado'],
        fields: [
            { name: 'cliente', label: 'Cliente', type: 'text' },
            { name: 'ruta', label: 'Ruta', type: 'text' },
            { name: 'asiento', label: 'Asiento', type: 'text' },
            { name: 'estado', label: 'Estado Reserva', type: 'select', options: ['Confirmado', 'Pendiente', 'Cancelado'] }
        ]
    },
    ventas: {
        title: 'Historial de Ventas',
        subtitle: 'Registro contable de transacciones',
        columns: ['ID', 'Reserva', 'Cliente', 'Valor Total', 'Fecha'],
        fields: [
            { name: 'reservaId', label: 'Código Reserva', type: 'text' },
            { name: 'cliente', label: 'Cliente', type: 'text' },
            { name: 'valor', label: 'Valor ($)', type: 'number' },
            { name: 'fecha', label: 'Fecha Venta', type: 'date' }
        ]
    }
};

// Page Navigation Control
function navigateTo(viewId) {
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');

    // Toggle active styling on navigation items
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('text-brand-600', 'font-bold'));

    if (viewId === 'view-admin-panel' && currentUser) {
        document.getElementById('sidebar').classList.remove('collapsed');
        document.getElementById('main-content').classList.remove('expanded');
    } else {
        document.getElementById('sidebar').classList.add('collapsed');
        document.getElementById('main-content').classList.add('expanded');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toggle Sidebar Navigation
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (window.innerWidth <= 1024) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

// Authentication Handlers
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-password').value;

    if (user.toLowerCase() === 'admin' && pass === '1234') {
        currentUser = { username: 'Admin', role: 'Administrador' };
        document.getElementById('current-username').textContent = currentUser.username;
        document.getElementById('sidebar-user-name').textContent = currentUser.username;
        document.getElementById('user-profile-badge').classList.remove('hidden');
        document.getElementById('user-profile-badge').classList.add('flex');
        document.getElementById('nav-login-btn').classList.add('hidden');
        
        showSystemAlert('¡Inicio de sesión exitoso! Bienvenido al panel.');
        navigateTo('view-admin-panel');
        switchSection('dashboard');
        initCharts();
    } else {
        showSystemAlert('Credenciales inválidas. Intente usando usuario: admin y clave: 1234');
    }
}

function logout() {
    currentUser = null;
    document.getElementById('user-profile-badge').classList.add('hidden');
    document.getElementById('user-profile-badge').classList.remove('flex');
    document.getElementById('nav-login-btn').classList.remove('hidden');
    showSystemAlert('Ha cerrado la sesión.');
    navigateTo('view-home');
}

// Switch Admin Sub-sections
function switchSection(sectionKey) {
    activeModule = sectionKey;
    
    // Highlight current sidebar menu item
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    const menuEl = document.getElementById(`menu-${sectionKey}`);
    if (menuEl) menuEl.classList.add('active');

    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));

    if (sectionKey === 'dashboard') {
        document.getElementById('section-dashboard').classList.add('active');
        initCharts();
    } else if (sectionKey === 'configuracion') {
        document.getElementById('section-configuracion').classList.add('active');
    } else if (CRUD_CONFIG[sectionKey]) {
        document.getElementById('section-crud-template').classList.add('active');
        renderCrudEngine(sectionKey);
    }
}

// Dynamic CRUD Renderer
function renderCrudEngine(moduleKey) {
    const config = CRUD_CONFIG[moduleKey];
    const data = DB[moduleKey] || [];

    document.getElementById('crud-title').textContent = config.title;
    document.getElementById('crud-subtitle').textContent = config.subtitle;

    // Render Head
    const thead = document.getElementById('dynamic-table-head');
    let headHTML = '<tr>';
    config.columns.forEach(col => { headHTML += `<th class="p-3">${col}</th>`; });
    headHTML += '<th class="p-3 text-right">Acciones</th></tr>';
    thead.innerHTML = headHTML;

    // Render Body
    const tbody = document.getElementById('dynamic-table-body');
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${config.columns.length + 1}" class="p-4 text-center text-slate-400">No hay registros disponibles.</td></tr>`;
        return;
    }

    let bodyHTML = '';
    data.forEach((item, index) => {
        bodyHTML += `<tr class="hover:bg-slate-50 border-b border-slate-100">`;
        const keys = Object.keys(item);
        keys.forEach(k => {
            let val = item[k];
            if (k === 'estado') {
                let color = val === 'Activo' || val === 'Disponible' || val === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';
                val = `<span class="${color} px-2 py-0.5 rounded text-xs font-semibold">${val}</span>`;
            }
            if (k === 'precio' || k === 'valor') {
                val = `$${Number(val).toLocaleString()}`;
            }
            bodyHTML += `<td class="p-3">${val}</td>`;
        });
        bodyHTML += `
            <td class="p-3 text-right space-x-2">
                <button class="text-blue-600 hover:text-blue-800 p-1" onclick="openEditCrudModal(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="text-rose-600 hover:text-rose-800 p-1" onclick="promptDeleteCrudItem(${index})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = bodyHTML;
}

// Modal Helpers
function openModal(id) {
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openResetPasswordModal() { openModal('modal-reset-password'); }
function sendResetCode() {
    closeModal('modal-reset-password');
    showSystemAlert('Se ha enviado un código de restablecimiento a su información de contacto.');
}

function openRegisterModal() { openModal('modal-registro'); }
function confirmRegister() {
    closeModal('modal-registro');
    showSystemAlert('Registro completado con éxito. Ya puede ingresar con sus datos.');
}

// CRUD Modal Dynamic Form Builder
function triggerCreateModal() {
    currentEditingIndex = null;
    document.getElementById('crud-modal-title').textContent = `Nuevo Registro - ${CRUD_CONFIG[activeModule].title}`;
    buildCrudFields({});
    openModal('modal-crud-editor');
}

function openEditCrudModal(index) {
    currentEditingIndex = index;
    const item = DB[activeModule][index];
    document.getElementById('crud-modal-title').textContent = `Editar Registro #${item.id}`;
    buildCrudFields(item);
    openModal('modal-crud-editor');
}

function buildCrudFields(data) {
    const config = CRUD_CONFIG[activeModule];
    const container = document.getElementById('crud-modal-body-fields');
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';

    config.fields.forEach(f => {
        const val = data[f.name] !== undefined ? data[f.name] : '';
        html += `<div><label class="block text-xs font-semibold text-slate-600 uppercase mb-1">${f.label}</label>`;
        if (f.type === 'select') {
            html += `<select id="field-${f.name}" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none">`;
            f.options.forEach(opt => {
                let sel = opt === val ? 'selected' : '';
                html += `<option value="${opt}" ${sel}>${opt}</option>`;
            });
            html += `</select>`;
        } else {
            html += `<input type="${f.type}" id="field-${f.name}" value="${val}" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" required>`;
        }
        html += `</div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function saveCrudForm() {
    const config = CRUD_CONFIG[activeModule];
    const newItem = {};

    if (currentEditingIndex !== null) {
        newItem.id = DB[activeModule][currentEditingIndex].id;
    } else {
        newItem.id = DB[activeModule].length ? DB[activeModule][DB[activeModule].length - 1].id + 1 : 1;
    }

    for (let f of config.fields) {
        const el = document.getElementById(`field-${f.name}`);
        if (!el.value) {
            showSystemAlert(`Por favor complete el campo ${f.label}`);
            return;
        }
        newItem[f.name] = f.type === 'number' ? Number(el.value) : el.value;
    }

    if (currentEditingIndex !== null) {
        DB[activeModule][currentEditingIndex] = newItem;
    } else {
        DB[activeModule].push(newItem);
    }

    closeModal('modal-crud-editor');
    renderCrudEngine(activeModule);
    showSystemAlert('Registro guardado correctamente.');
}

function promptDeleteCrudItem(index) {
    activeDeleteHandler = () => {
        DB[activeModule].splice(index, 1);
        closeModal('modal-confirm-delete');
        renderCrudEngine(activeModule);
        showSystemAlert('Registro eliminado con éxito.');
    };
    document.getElementById('btn-execute-delete').onclick = activeDeleteHandler;
    openModal('modal-confirm-delete');
}

// Trip Search Logic & Booking Flow
function toggleReturnDate(enable) {
    const input = document.getElementById('search-fecha-regreso');
    input.disabled = !enable;
    if (enable) input.classList.remove('bg-slate-100');
    else input.classList.add('bg-slate-100');
}

function handleSearchTrips(e) {
    e.preventDefault();
    const origen = document.getElementById('search-origen').value;
    const destino = document.getElementById('search-destino').value;

    document.getElementById('search-results-title').textContent = `Rutas de ${origen} a ${destino}`;
    
    const resultsContainer = document.getElementById('trip-results-container');
    resultsContainer.innerHTML = '';

    // Generate Mock Trips based on search
    const mockTrips = [
        { id: 101, hora: '07:00 AM', servicio: 'Servicio Básico', bus: 'TSB-101', precio: 22000, disponibles: 8 },
        { id: 102, hora: '10:30 AM', servicio: 'Servicio Prémium Express', bus: 'TSB-103', precio: 28000, disponibles: 14 },
        { id: 103, hora: '02:15 PM', servicio: 'Servicio Confort Plus', bus: 'TSB-105', precio: 25000, disponibles: 5 }
    ];

    mockTrips.forEach(trip => {
        resultsContainer.innerHTML += `
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-brand-500 transition">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-brand-50 text-brand-600 rounded-lg text-2xl font-bold">
                        <i class="fa-solid fa-bus"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-lg font-bold text-slate-800">${trip.hora}</span>
                            <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">${trip.servicio}</span>
                        </div>
                        <p class="text-xs text-slate-500">Vehículo: ${trip.bus} • Duración aprox: 2h 30m</p>
                        <p class="text-xs text-emerald-600 font-semibold mt-1"><i class="fa-solid fa-chair mr-1"></i>${trip.disponibles} asientos disponibles</p>
                    </div>
                </div>
                <div class="text-right w-full md:w-auto flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 pt-3 md:pt-0">
                    <p class="text-xl font-extrabold text-brand-600">$${trip.precio.toLocaleString()} COP</p>
                    <button class="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition" onclick="openSeatSelection('${origen} - ${destino}', ${trip.precio})">
                        Seleccionar Asiento
                    </button>
                </div>
            </div>
        `;
    });

    navigateTo('view-resultados');
}

let currentSelectedSeat = null;
let currentTripPrice = 0;

function openSeatSelection(tripTitle, price) {
    currentTripPrice = price;
    document.getElementById('booking-modal-title').textContent = tripTitle;
    document.getElementById('book-seat-price').textContent = `$${price.toLocaleString()} COP`;
    document.getElementById('book-total-price').textContent = `$0 COP`;
    document.getElementById('book-selected-seats-text').textContent = 'Ninguno';
    currentSelectedSeat = null;

    // Generate Seat Layout Grid
    const seatGrid = document.getElementById('bus-seat-grid');
    seatGrid.innerHTML = '';
    
    for (let i = 1; i <= 16; i++) {
        const seatNum = `A${i < 10 ? '0' + i : i}`;
        const isOccupied = i === 3 || i === 7 || i === 12; // Mock occupied
        
        const seatBtn = document.createElement('div');
        seatBtn.className = `bus-seat ${isOccupied ? 'occupied' : 'available'}`;
        seatBtn.textContent = seatNum;
        
        if (!isOccupied) {
            seatBtn.onclick = () => selectSeat(seatBtn, seatNum);
        }
        seatGrid.appendChild(seatBtn);
    }

    openModal('modal-booking-seats');
}

function selectSeat(element, seatNum) {
    document.querySelectorAll('.bus-seat.selected').forEach(s => s.classList.replace('selected', 'available'));
    element.classList.replace('available', 'selected');
    currentSelectedSeat = seatNum;
    document.getElementById('book-selected-seats-text').textContent = seatNum;
    document.getElementById('book-total-price').textContent = `$${currentTripPrice.toLocaleString()} COP`;
}

function confirmTripBooking() {
    if (!currentSelectedSeat) {
        showSystemAlert('Por favor seleccione un asiento disponible antes de continuar.');
        return;
    }
    closeModal('modal-booking-seats');
    showSystemAlert(`¡Reserva confirmada con éxito! Asiento: ${currentSelectedSeat}. Su boleto ha sido enviado al correo.`);
}

function showSystemAlert(msg) {
    document.getElementById('alert-message-text').textContent = msg;
    openModal('modal-alert-message');
}

// Chart.js Visual Analytics Engine Initialization
let chartMayorInstance = null;
let chartMenorInstance = null;

function initCharts() {
    // Chart 1: Mayor Demanda
    const ctxMayor = document.getElementById('chartMayorDemanda')?.getContext('2d');
    if (ctxMayor) {
        if (chartMayorInstance) chartMayorInstance.destroy();
        chartMayorInstance = new Chart(ctxMayor, {
            type: 'bar',
            data: {
                labels: ['Medellín - Guatapé', 'Medellín - Jardín', 'Caldas - Apartadó', 'Medellín - Sta Fe', 'Medellín - Alejandría'],
                datasets: [{
                    label: 'Pasajeros Mes',
                    data: [1420, 1180, 950, 820, 640],
                    backgroundColor: '#2563eb',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } }
            }
        });
    }

    // Chart 2: Menor Demanda
    const ctxMenor = document.getElementById('chartMenorDemanda')?.getContext('2d');
    if (ctxMenor) {
        if (chartMenorInstance) chartMenorInstance.destroy();
        chartMenorInstance = new Chart(ctxMenor, {
            type: 'bar',
            data: {
                labels: ['Ruta Caucasia', 'Ruta Amalfi', 'Ruta Anorí', 'Ruta Yarumal', 'Ruta Tarazá'],
                datasets: [{
                    label: 'Pasajeros Mes',
                    data: [120, 150, 190, 210, 280],
                    backgroundColor: '#f43f5e',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

// Initialize App on DOM Load
window.onload = function () {
    // Default view home
    navigateTo('view-home');
};


