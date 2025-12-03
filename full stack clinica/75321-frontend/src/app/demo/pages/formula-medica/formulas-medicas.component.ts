import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RecetaService } from '../../../services/receta.service';
import { Receta } from '../../../models/receta';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulas-medicas',
  templateUrl: './formulas-medicas.component.html',
  styleUrls: ['./formulas-medicas.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class FormulasMedicasComponent implements OnInit {
  recetas: Receta[] = [];
  cargando: boolean = false;
  
  // Variables para el formulario reactivo
  mostrarFormulario: boolean = false;
  modoEdicion: boolean = false;
  formularioReceta: FormGroup;
  recetaEditandoId?: number;

  constructor(
    private recetaService: RecetaService,
    private fb: FormBuilder
  ) {
    this.formularioReceta = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarRecetas();
  }

  // Crea el formulario reactivo con validaciones
  crearFormulario(): FormGroup {
    return this.fb.group({
      citaId: ['', [Validators.required, Validators.min(1)]],
      medicamentoId: ['', [Validators.required, Validators.min(1)]],
      dosis: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      indicaciones: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  cargarRecetas(): void {
    this.cargando = true;
    
    this.recetaService.obtenerRecetas().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.recetas = data;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar recetas:', error);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar',
          text: 'No se pudieron cargar las fórmulas médicas. Por favor, intente nuevamente.',
          confirmButtonColor: '#4CAF50'
        });
      }
    });
  }

  // Abre el formulario para crear nueva receta
  abrirFormularioCrear(): void {
    this.modoEdicion = false;
    this.recetaEditandoId = undefined;
    this.formularioReceta.reset();
    this.mostrarFormulario = true;
  }

  // Abre el formulario para editar receta existente
  editarReceta(receta: Receta): void {
    this.modoEdicion = true;
    this.recetaEditandoId = receta.id;
    
    // Cargar datos en el formulario
    this.formularioReceta.patchValue({
      citaId: receta.cita.id,
      medicamentoId: receta.medicamentoId,
      dosis: receta.dosis,
      indicaciones: receta.indicaciones
    });
    
    // Deshabilitar el campo citaId en modo edición
    this.formularioReceta.get('citaId')?.disable();
    
    this.mostrarFormulario = true;
  }

  // Guarda (crea o actualiza) la receta
  guardarReceta(): void {
    // Validar formulario
    if (this.formularioReceta.invalid) {
      this.marcarCamposComoTocados();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, complete todos los campos requeridos correctamente.',
        confirmButtonColor: '#4CAF50'
      });
      return;
    }

    const formValues = this.formularioReceta.getRawValue(); // getRawValue incluye campos deshabilitados
    
    const recetaData: Receta = {
      medicamentoId: formValues.medicamentoId,
      dosis: formValues.dosis,
      indicaciones: formValues.indicaciones,
      cita: { id: formValues.citaId }
    };

    this.cargando = true;

    if (this.modoEdicion && this.recetaEditandoId) {
      // Actualizar receta existente
      this.recetaService.actualizarReceta(this.recetaEditandoId, recetaData).subscribe({
        next: () => {
          this.cargando = false;
          Swal.fire({
            icon: 'success',
            title: '¡Actualizada!',
            text: 'La fórmula médica ha sido actualizada correctamente.',
            confirmButtonColor: '#4CAF50',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarRecetas();
          this.cancelar();
        },
        error: (error) => {
          console.error('Error al actualizar receta:', error);
          this.cargando = false;
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: 'No se pudo actualizar la fórmula médica. Por favor, intente nuevamente.',
            confirmButtonColor: '#4CAF50'
          });
        }
      });
    } else {
      // Crear nueva receta
      this.recetaService.crearReceta(recetaData).subscribe({
        next: () => {
          this.cargando = false;
          Swal.fire({
            icon: 'success',
            title: '¡Creada!',
            text: 'La fórmula médica ha sido creada correctamente.',
            confirmButtonColor: '#4CAF50',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarRecetas();
          this.cancelar();
        },
        error: (error) => {
          console.error('Error al crear receta:', error);
          this.cargando = false;
          Swal.fire({
            icon: 'error',
            title: 'Error al crear',
            text: 'No se pudo crear la fórmula médica. Por favor, intente nuevamente.',
            confirmButtonColor: '#4CAF50'
          });
        }
      });
    }
  }

  // Cancela y cierra el formulario
  cancelar(): void {
    Swal.fire({
      title: '¿Cancelar operación?',
      text: 'Los datos ingresados se perderán.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarFormulario = false;
        this.modoEdicion = false;
        this.recetaEditandoId = undefined;
        this.formularioReceta.reset();
        this.formularioReceta.get('citaId')?.enable();
      }
    });
  }

  // Marca todos los campos como tocados para mostrar errores
  marcarCamposComoTocados(): void {
    Object.keys(this.formularioReceta.controls).forEach(key => {
      this.formularioReceta.get(key)?.markAsTouched();
    });
  }

  // Métodos auxiliares para validaciones en el template
  obtenerErrorCampo(campo: string): string {
    const control = this.formularioReceta.get(campo);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['min']) {
      return 'Debe ser mayor a 0';
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    
    return '';
  }

  campoEsInvalido(campo: string): boolean {
    const control = this.formularioReceta.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  trackByRecetaId(index: number, receta: Receta): number {
    return receta.id || index;
  }
}