/**
 * Módulo: Gestión de Asignaturas
 * Gestor Académico – Fase 2
 */

'use strict';

/* ─── 1. DATOS EN MEMORIA ─────────────────────────────────────── */
let lista = [
  { id: 1, codigo: 'MAT-101', nombre: 'Cálculo Diferencial',             creditos: 4, docente: 'Dr. Roberto Sánchez',    estado: 'activo'   },
  { id: 2, codigo: 'FIS-201', nombre: 'Física Mecánica',                 creditos: 3, docente: 'Dra. Patricia Mendoza',  estado: 'activo'   },
  { id: 3, codigo: 'PRG-301', nombre: 'Programación Orientada a Objetos',creditos: 4, docente: 'Ing. Carlos Vargas',     estado: 'activo'   },
  { id: 4, codigo: 'QUI-102', nombre: 'Química General',                 creditos: 3, docente: 'Dra. Ana Torres',        estado: 'inactivo' },
  { id: 5, codigo: 'ING-401', nombre: 'Inglés Avanzado',                 creditos: 2, docente: 'Prof. Michael Johnson',  estado: 'activo'   },
  { id: 6, codigo: 'BDD-501', nombre: 'Bases de Datos',                  creditos: 4, docente: 'Ing. Laura Fernández',   estado: 'activo'   },
];

let siguienteId = 7;
let idEdit = null;

/* ─── 2. CAPTURA DE DOM ───────────────────────────────────────── */
function capDom() {
  const d = {};
  d.btnAdd     = document.getElementById('btn-add-asignatura');
  d.tbody      = document.getElementById('asignaturasBody');
  d.modalEl    = document.getElementById('asignaturaModal');
  d.modalLabel = document.getElementById('asignaturaModalLabel');
  d.form       = document.getElementById('asignatura-form');
  d.codigo     = document.getElementById('asi-codigo');
  d.nombre     = document.getElementById('asi-nombre');
  d.creditos   = document.getElementById('asi-creditos');
  d.docente    = document.getElementById('asi-docente');
  d.estado     = document.getElementById('asi-estado');
  d.overlay    = document.getElementById('loadingOverlay');
  d.overlayMsg = document.getElementById('loadingMessage');

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
  dom.tbody.innerHTML = lista.map(a => `
    <tr>
      <td>${a.id}</td>
      <td>${a.codigo}</td>
      <td>${a.nombre}</td>
      <td>${a.creditos}</td>
      <td>${a.docente}</td>
      <td><span class="badge ${a.estado === 'activo' ? 'badge-active' : 'badge-inactive'}">
        ${a.estado === 'activo' ? 'Activo' : 'Inactivo'}
      </span></td>
      <td>
        <button class="btn-edit"   data-id="${a.id}" data-accion="editar">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-delete" data-id="${a.id}" data-accion="eliminar">
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
  const i = lista.findIndex(a => a.id === id);
  if (i !== -1) lista[i] = { id, ...d };
}

function quitar(id) {
  lista = lista.filter(a => a.id !== id);
}

/* ─── 6. FORMULARIO ───────────────────────────────────────────── */
function formLeer(dom) {
  return {
    codigo  : dom.codigo.value.trim(),
    nombre  : dom.nombre.value.trim(),
    creditos: parseInt(dom.creditos.value, 10),
    docente : dom.docente.value.trim(),
    estado  : dom.estado.value,
  };
}

function formValidar(d) {
  if (!d.codigo)            { alert('El código es obligatorio.');             return false; }
  if (!d.nombre)            { alert('El nombre es obligatorio.');             return false; }
  if (!d.creditos || d.creditos < 1) { alert('Los créditos deben ser >= 1.'); return false; }
  if (!d.docente)           { alert('El docente es obligatorio.');            return false; }
  if (!d.estado)            { alert('Seleccione un estado.');                 return false; }
  return true;
}

function formLimpiar(dom) {
  dom.form.reset();
}

function formCargar(dom, obj) {
  dom.codigo.value   = obj.codigo;
  dom.nombre.value   = obj.nombre;
  dom.creditos.value = obj.creditos;
  dom.docente.value  = obj.docente;
  dom.estado.value   = obj.estado;
}

/* ─── 7. ABRIR MODAL ──────────────────────────────────────────── */
async function abrirNuevo(dom) {
  cargaOn(dom, 'Cargando formulario...');
  await esperar(600);
  idEdit = null;
  formLimpiar(dom);
  dom.modalLabel.textContent = 'Agregar Asignatura';
  dom.modalEl.classList.add('show');
  cargaOff(dom);
}

async function abrirEditar(dom, id) {
  cargaOn(dom, 'Cargando registro...');
  await esperar(600);
  const obj = lista.find(a => a.id === id);
  if (!obj) { cargaOff(dom); return; }
  idEdit = id;
  formCargar(dom, obj);
  dom.modalLabel.textContent = 'Editar Asignatura';
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
  if (!confirm('¿Desea eliminar esta asignatura?')) return;
  cargaOn(dom, 'Eliminando...');
  await esperar(600);
  quitar(id);
  pintar(dom);
  cargaOff(dom);
}

/* ─── 10. DELEGACIÓN DE EVENTOS ───────────────────────────────── */
function enlazar(dom) {
  dom.btnAdd.addEventListener('click', () => abrirNuevo(dom));

  dom.tbody.addEventListener('click', e => {
    const btn = e.target.closest('button[data-accion]');
    if (!btn) return;
    const id     = parseInt(btn.dataset.id, 10);
    const accion = btn.dataset.accion;
    if (accion === 'editar')   abrirEditar(dom, id);
    if (accion === 'eliminar') eliminarConCarga(dom, id);
  });

  dom.modalEl.querySelector('.close').addEventListener('click', () => cerrarModal(dom));
  dom.modalEl.querySelector('.btn-cancel').addEventListener('click', () => cerrarModal(dom));

  dom.form.addEventListener('submit', e => guardar(dom, e));
}

/* ─── 11. INICIALIZACIÓN ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const dom = capDom();

  cargaOn(dom, 'Cargando asignaturas...');
  await esperar(800);
  pintar(dom);
  cargaOff(dom);

  enlazar(dom);
});
