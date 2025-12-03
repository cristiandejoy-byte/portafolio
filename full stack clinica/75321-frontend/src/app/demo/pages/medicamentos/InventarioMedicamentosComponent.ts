import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MedicamentoService } from '../../../services/medicammento.service';
import { Medicamento } from '../../../models/Medicamento';

@Component({
  selector: 'app-inventario-medicamentos',
  templateUrl: './inventario-medicamentos.component.html',
  styleUrls: ['./medicamentos.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InventarioMedicamentosComponent implements OnInit {

  // Variables para la lista
  medicamentos: Medicamento[] = [];
  cargando: boolean = false;
  error: string = '';

  // Variables para el formulario
  mostrarFormulario: boolean = false;
  modoEdicion: boolean = false;
  medicamentoForm: FormGroup;
  medicamentoId?: number;
  guardando: boolean = false;

  constructor(
    private medicamentoService: MedicamentoService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.medicamentoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      presentacion: [''],
      fechaCompra: ['', Validators.required],
      fechaVence: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarMedicamentos();
  }

  // ============= FUNCIONES DE LISTADO =============
  cargarMedicamentos(): void {
    this.cargando = true;
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => {
        console.log('Medicamentos recibidos:', data);
        this.medicamentos = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar medicamentos:', error);
        this.error = 'Error al cargar los medicamentos';
        this.cargando = false;
      }
    });
  }

  estaVencido(fechaVence: string | Date): boolean {
    const fechaVencimiento = new Date(fechaVence);
    const hoy = new Date();
    return fechaVencimiento < hoy;
  }

  // ============= FUNCIONES DE CREAR =============
  abrirFormularioCrear(): void {
    this.mostrarFormulario = true;
    this.modoEdicion = false;
    this.medicamentoForm.reset();
  }

  crearMedicamento(): void {
    if (this.medicamentoForm.valid) {
      this.guardando = true;
      this.error = '';

      const medicamento: Medicamento = this.medicamentoForm.value;

      this.medicamentoService.crearMedicamento(medicamento).subscribe({
        next: () => {
          alert('Medicamento creado exitosamente');
          this.cerrarFormulario();
          this.cargarMedicamentos();
        },
        error: (error) => {
          console.error('Error al crear medicamento:', error);
          this.error = 'Error al crear el medicamento';
          this.guardando = false;
        }
      });
    }
  }

  // ============= FUNCIONES DE EDITAR =============
  abrirFormularioEditar(medicamento: Medicamento): void {
    this.mostrarFormulario = true;
    this.modoEdicion = true;
    this.medicamentoId = medicamento.id;

    this.medicamentoForm.patchValue({
      nombre: medicamento.nombre,
      descripcion: medicamento.descripcion,
      presentacion: medicamento.presentacion,
      fechaCompra: this.formatearFecha(medicamento.fechaCompra),
      fechaVence: this.formatearFecha(medicamento.fechaVence)
    });
  }

  actualizarMedicamento(): void {
    if (this.medicamentoForm.valid && this.medicamentoId) {
      this.guardando = true;
      this.error = '';

      const medicamento: Medicamento = this.medicamentoForm.value;

      this.medicamentoService.actualizarMedicamento(this.medicamentoId, medicamento).subscribe({
        next: () => {
          alert('Medicamento actualizado exitosamente');
          this.cerrarFormulario();
          this.cargarMedicamentos();
        },
        error: (error) => {
          console.error('Error al actualizar medicamento:', error);
          this.error = 'Error al actualizar el medicamento';
          this.guardando = false;
        }
      });
    }
  }

  // ============= FUNCIONES DE ELIMINAR =============
  eliminarMedicamento(id: number): void {
    if (confirm('¿Está seguro de eliminar este medicamento?')) {
      this.medicamentoService.eliminarMedicamento(id).subscribe({
        next: () => {
          console.log('Medicamento eliminado');
          this.cargarMedicamentos();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el medicamento');
        }
      });
    }
  }

  // ============= FUNCIONES AUXILIARES =============
  formatearFecha(fecha: string | Date): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.medicamentoForm.reset();
    this.medicamentoId = undefined;
    this.guardando = false;
  }

  guardar(): void {
    if (this.modoEdicion) {
      this.actualizarMedicamento();
    } else {
      this.crearMedicamento();
    }
  }
}