/**
 * Módulo: Gestión de Notas
 * Gestor Académico – Fase 2
 */

'use strict';

/* ─── 1. DATOS EN MEMORIA ─────────────────────────────────────── */
let lista = [
  { id: 1, est: '1', asi: '1', nota: 4.5, fecha: '2026-01-15', obs: 'Excelente desempeño' },
  { id: 2, est: '2', asi: '2', nota: 3.8, fecha: '2026-01-18', obs: 'Buen rendimiento' },
  { id: 3, est: '1', asi: '3', nota: 5.0, fecha: '2026-01-20', obs: 'Destacado en todos los aspectos' },
  { id: 4, est: '4', asi: '6', nota: 4.2, fecha: '2026-01-22', obs: 'Muy buen trabajo' },
  { id: 5, est: '5', asi: '5', nota: 3.5, fecha: '2026-01-25', obs: 'Requiere más práctica oral' },
];

let siguienteId = 6;
let idEdit = null;

// Mapas para mostrar nombres en lugar de IDs en la tabla (simulación mínima)
const mapaEstudiantes = {
  '1': 'Juan Pérez García',
  '2': 'María López Rodríguez',
  '3': 'Carlos Martínez Silva',
  '4': 'Ana Gómez Herrera',
  '5': 'Luis Ramírez Torres'
};

const mapaAsignaturas = {
  '1': 'Cálculo Diferencial',
  '2': 'Física Mecánica',
  '3': 'Programación Orientada a Objetos',
  '4': 'Química General',
  '5': 'Inglés Avanzado',
  '6': 'Bases de Datos'
};

/* ─── 2. CAPTURA DE DOM ───────────────────────────────────────── */
function capDom() {
  const d = {};
  d.btnAdd     = document.getElementById('btn-add-nota');
  d.tbody      = document.getElementById('notasBody');
  d.modalEl    = document.getElementById('notaModal');
  d.modalLabel = document.getElementById('notaModalLabel');
  d.form       = document.getElementById('nota-form');
  d.estudiante = document.getElementById('not-estudiante');
  d.asignatura = document.getElementById('not-asignatura');
  d.nota       = document.getElementById('not-nota');
  d.fecha      = document.getElementById('not-fecha');
  d.obs        = document.getElementById('not-obs');
  d.overlay    = document.getElementById('loadingOverlay');
  d.overlayMsg = document.getElementById('loadingMessage');

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
  dom.tbody.innerHTML = lista.map(n => `
    <tr>
      <td>${n.id}</td>
      <td>${mapaEstudiantes[n.est] || 'Desconocido'}</td>
      <td>${mapaAsignaturas[n.asi] || 'Desconocida'}</td>
      <td>${n.nota}</td>
      <td>${n.fecha}</td>
      <td>${n.obs}</td>
      <td>
        <button class="btn-edit"   data-id="${n.id}" data-accion="editar">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-delete" data-id="${n.id}" data-accion="eliminar">
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
  const i = lista.findIndex(n => n.id === id);
  if (i !== -1) lista[i] = { id, ...d };
}

function quitar(id) {
  lista = lista.filter(n => n.id !== id);
}

/* ─── 6. FORMULARIO ───────────────────────────────────────────── */
function formLeer(dom) {
  return {
    est  : dom.estudiante.value,
    asi  : dom.asignatura.value,
    nota : parseFloat(dom.nota.value),
    fecha: dom.fecha.value,
    obs  : dom.obs.value.trim(),
  };
}

function formValidar(d) {
  if (!d.est)   { alert('Seleccione un estudiante.'); return false; }
  if (!d.asi)   { alert('Seleccione una asignatura.'); return false; }
  if (isNaN(d.nota) || d.nota < 0 || d.nota > 5) { alert('La nota debe estar entre 0 y 5.'); return false; }
  if (!d.fecha) { alert('La fecha es obligatoria.'); return false; }
  return true;
}

function formLimpiar(dom) {
  dom.form.reset();
}

function formCargar(dom, obj) {
  dom.estudiante.value = obj.est;
  dom.asignatura.value = obj.asi;
  dom.nota.value       = obj.nota;
  dom.fecha.value      = obj.fecha;
  dom.obs.value        = obj.obs;
}

/* ─── 7. ABRIR MODAL ──────────────────────────────────────────── */
async function abrirNuevo(dom) {
  cargaOn(dom, 'Cargando formulario...');
  await esperar(600);
  idEdit = null;
  formLimpiar(dom);
  dom.modalLabel.textContent = 'Registrar Nota';
  dom.modalEl.classList.add('show');
  cargaOff(dom);
}

async function abrirEditar(dom, id) {
  cargaOn(dom, 'Cargando registro...');
  await esperar(600);
  const obj = lista.find(n => n.id === id);
  if (!obj) { cargaOff(dom); return; }
  idEdit = id;
  formCargar(dom, obj);
  dom.modalLabel.textContent = 'Editar Nota';
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
  if (!confirm('¿Desea eliminar esta nota?')) return;
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

  cargaOn(dom, 'Cargando notas...');
  await esperar(800);
  pintar(dom);
  cargaOff(dom);

  enlazar(dom);
});
