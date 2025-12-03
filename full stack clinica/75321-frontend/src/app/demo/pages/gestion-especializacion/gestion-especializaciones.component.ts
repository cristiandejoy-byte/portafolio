import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { EspecializacionesService } from '../../../services/especializaciones.service';
import { Especializacion } from '../../../models/especilizacion';

@Component({
  selector: 'app-gestion-especializaciones',
  templateUrl: './gestion-especializaciones.component.html',
  styleUrls: ['./gestion-especializaciones.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class GestionEspecializacionesComponent implements OnInit {

  especializaciones: Especializacion[] = [];
  form: FormGroup;
  modalOpen = false;
  editMode = false;
  editingId?: number;

  constructor(
    private servicio: EspecializacionesService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      codigoEspecializacion: ['', [Validators.required, Validators.maxLength(10)]],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarListado();
  }

  cargarListado() {
    this.servicio.listar().subscribe({
      next: data => this.especializaciones = data,
      error: err => Swal.fire('Error', err.message || 'No se pudo cargar', 'error')
    });
  }

  abrirCrear() {
    this.editMode = false;
    this.editingId = undefined;
    this.form.reset();
    this.modalOpen = true;
  }

  abrirEditar(item: Especializacion) {
    this.editMode = true;
    this.editingId = item.id;
    this.form.patchValue(item);
    this.modalOpen = true;
  }

  cerrarModal() {
    this.modalOpen = false;
    setTimeout(() => this.form.reset(), 100);
  }

  guardar() {
    if (this.form.invalid) {
      Swal.fire('Atención', 'Completa el formulario correctamente', 'warning');
      return;
    }

    const payload: Especializacion = this.form.value;
    let request$;

    if (this.editMode && this.editingId != null) {
      request$ = this.servicio.actualizar(this.editingId, payload);
    } else {
      request$ = this.servicio.crear(payload);
    }

    request$.subscribe({
      next: () => {
        Swal.fire(
          this.editMode ? 'Actualizado' : 'Creado',
          this.editMode ? 'Especialización actualizada' : 'Especialización creada',
          'success'
        );
        this.cargarListado();
        this.cerrarModal();
      },
      error: err => Swal.fire('Error', err.message || 'Ocurrió un error', 'error')
    });
  }

  buscarPorCodigo(input: HTMLInputElement) {
    const codigo = input.value?.trim();
    if (!codigo) { this.cargarListado(); return; }

    this.servicio.buscarPorCodigo(codigo).subscribe({
      next: data => this.especializaciones = data ? [data] : [],
      error: err => Swal.fire('Error', err.message || 'No se encontró', 'error')
    });
  }
}
