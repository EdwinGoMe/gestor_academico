/**
 * Módulo: Gestión de Estudiantes
 * Gestor Académico – Fase 2
 */

'use strict';

/* ─── 1. DATOS EN MEMORIA ─────────────────────────────────────── */
let lista = [
  { id: 1, nombre: 'Juan Pérez García',      doc: '1234567890', correo: 'juan.perez@email.com',    programa: 'Ingeniería de Sistemas',    estado: 'activo'   },
  { id: 2, nombre: 'María López Rodríguez',  doc: '9876543210', correo: 'maria.lopez@email.com',   programa: 'Administración de Empresas', estado: 'activo'   },
  { id: 3, nombre: 'Carlos Martínez Silva',  doc: '5551234567', correo: 'carlos.martinez@email.com',programa: 'Derecho',                   estado: 'inactivo' },
  { id: 4, nombre: 'Ana Gómez Herrera',      doc: '7778889990', correo: 'ana.gomez@email.com',     programa: 'Medicina',                  estado: 'activo'   },
  { id: 5, nombre: 'Luis Ramírez Torres',    doc: '4445556660', correo: 'luis.ramirez@email.com',  programa: 'Arquitectura',              estado: 'activo'   },
];

let siguienteId = 6;
let idEdit = null;

/* ─── 2. CAPTURA DE DOM ───────────────────────────────────────── */
function capDom() {
  const d = {};
  d.btnAdd         = document.getElementById('btn-add-estudiante');
  d.tbody          = document.getElementById('estudiantesBody');
  d.modalEl        = document.getElementById('estudianteModal');
  d.modalLabel     = document.getElementById('estudianteModalLabel');
  d.form           = document.getElementById('estudiante-form');
  d.nombre         = document.getElementById('est-nombre');
  d.doc            = document.getElementById('est-doc');
  d.correo         = document.getElementById('est-correo');
  d.programa       = document.getElementById('est-programa');
  d.estado         = document.getElementById('est-estado');
  d.overlay        = document.getElementById('loadingOverlay');
  d.overlayMsg     = document.getElementById('loadingMessage');

  const faltantes = Object.entries(d).filter(([,v]) => !v).map(([k]) => k);
  if (faltantes.length) {
    console.error('IDs faltantes en el DOM:', faltantes.join(', '));
  }
  return d;
}

/* ─── 3. OVERLAY ──────────────────────────────────────────────── */
function cargaOn(dom, msg) {
  dom.overlayMsg.textContent = msg;
  dom.overlay.classList.add('active');
}

function cargaOff(dom) {
  dom.overlay.classList.remove('active');
}

function esperar(msMax) {
  const ms = Math.floor(Math.random() * msMax) + 300;
  return new Promise(res => setTimeout(res, ms));
}

/* ─── 4. RENDER ───────────────────────────────────────────────── */
function pintar(dom) {
  dom.tbody.innerHTML = lista.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.nombre}</td>
      <td>${e.doc}</td>
      <td>${e.correo}</td>
      <td>${e.programa}</td>
      <td><span class="badge ${e.estado === 'activo' ? 'badge-active' : 'badge-inactive'}">
        ${e.estado === 'activo' ? 'Activo' : 'Inactivo'}
      </span></td>
      <td>
        <button class="btn-edit"   data-id="${e.id}" data-accion="editar">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-delete" data-id="${e.id}" data-accion="eliminar">
          <i class="fas fa-trash"></i> Eliminar
        </button>
      </td>
    </tr>`).join('');
}

/* ─── 5. CRUD EN MEMORIA ──────────────────────────────────────── */
function agregar(d) {
  lista.push({ id: siguienteId++, ...d });
}

function actualizar(id, d) {
  const i = lista.findIndex(e => e.id === id);
  if (i !== -1) lista[i] = { id, ...d };
}

function quitar(id) {
  lista = lista.filter(e => e.id !== id);
}

/* ─── 6. FORMULARIO ───────────────────────────────────────────── */
function formLeer(dom) {
  return {
    nombre  : dom.nombre.value.trim(),
    doc     : dom.doc.value.trim(),
    correo  : dom.correo.value.trim(),
    programa: dom.programa.value.trim(),
    estado  : dom.estado.value,
  };
}

function formValidar(d) {
  if (!d.nombre)   { alert('El nombre es obligatorio.');           return false; }
  if (!d.doc)      { alert('El documento es obligatorio.');        return false; }
  if (!d.correo)   { alert('El correo es obligatorio.');           return false; }
  if (!d.programa) { alert('El programa es obligatorio.');         return false; }
  if (!d.estado)   { alert('Seleccione un estado.');               return false; }
  return true;
}

function formLimpiar(dom) {
  dom.form.reset();
}

function formCargar(dom, obj) {
  dom.nombre.value  = obj.nombre;
  dom.doc.value     = obj.doc;
  dom.correo.value  = obj.correo;
  dom.programa.value= obj.programa;
  dom.estado.value  = obj.estado;
}

/* ─── 7. ABRIR MODAL ──────────────────────────────────────────── */
async function abrirNuevo(dom) {
  cargaOn(dom, 'Cargando formulario...');
  await esperar(600);
  idEdit = null;
  formLimpiar(dom);
  dom.modalLabel.textContent = 'Agregar Estudiante';
  dom.modalEl.classList.add('show');
  cargaOff(dom);
}

async function abrirEditar(dom, id) {
  cargaOn(dom, 'Cargando registro...');
  await esperar(600);
  const obj = lista.find(e => e.id === id);
  if (!obj) { cargaOff(dom); return; }
  idEdit = id;
  formCargar(dom, obj);
  dom.modalLabel.textContent = 'Editar Estudiante';
  dom.modalEl.classList.add('show');
  cargaOff(dom);
}

function cerrarModal(dom) {
  dom.modalEl.classList.remove('show');
  formLimpiar(dom);
  idEdit = null;
}

/* ─── 8. GUARDAR (submit único) ───────────────────────────────── */
async function guardar(dom, e) {
  e.preventDefault();
  const d = formLeer(dom);
  if (!formValidar(d)) return;

  cerrarModal(dom);
  cargaOn(dom, 'Guardando...');
  await esperar(700);

  if (idEdit === null) {
    agregar(d);
  } else {
    actualizar(idEdit, d);
    idEdit = null;
  }

  pintar(dom);
  cargaOff(dom);
}

/* ─── 9. ELIMINAR ─────────────────────────────────────────────── */
async function eliminarConCarga(dom, id) {
  if (!confirm('¿Desea eliminar este estudiante?')) return;
  cargaOn(dom, 'Eliminando...');
  await esperar(600);
  quitar(id);
  pintar(dom);
  cargaOff(dom);
}

/* ─── 10. DELEGACIÓN DE EVENTOS ───────────────────────────────── */
function enlazar(dom) {
  // Botón agregar
  dom.btnAdd.addEventListener('click', () => abrirNuevo(dom));

  // Delegación en tbody
  dom.tbody.addEventListener('click', e => {
    const btn = e.target.closest('button[data-accion]');
    if (!btn) return;
    const id     = parseInt(btn.dataset.id, 10);
    const accion = btn.dataset.accion;
    if (accion === 'editar')   abrirEditar(dom, id);
    if (accion === 'eliminar') eliminarConCarga(dom, id);
  });

  // Botones cerrar modal
  dom.modalEl.querySelector('.close').addEventListener('click', () => cerrarModal(dom));
  dom.modalEl.querySelector('.btn-cancel').addEventListener('click', () => cerrarModal(dom));

  // Submit único
  dom.form.addEventListener('submit', e => guardar(dom, e));
}

/* ─── 11. INICIALIZACIÓN ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const dom = capDom();

  // Carga inicial
  cargaOn(dom, 'Cargando estudiantes...');
  await esperar(800);
  pintar(dom);
  cargaOff(dom);

  // Enlazar eventos
  enlazar(dom);
});
