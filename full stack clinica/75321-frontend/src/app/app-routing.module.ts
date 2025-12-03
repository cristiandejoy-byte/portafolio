import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { InventarioMedicamentosComponent } from './demo/pages/medicamentos/InventarioMedicamentosComponent'; // ← CORREGIDO
import { CitasComponent } from './demo/pages/citas/citas.component';
import { FormulasMedicasComponent } from './demo/pages/formula-medica/formulas-medicas.component';
import { HistoriasMedicasComponent } from './demo/pages/historia-medica/historias-medicas.component';
import { GestionEspecializacionesComponent } from './demo/pages/gestion-especializacion/gestion-especializaciones.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    component: AdminComponent,
    children: [
      { 
        path: '', 
        redirectTo: 'usuario', 
        pathMatch: 'full' 
      },
      { 
        path: 'usuario', 
        component: UsuarioComponent, 
        data: { title: 'Gestión de Usuarios' } 
      },
      { 
        path: 'medicamentos', 
        component: InventarioMedicamentosComponent, 
        data: { title: 'Medicamentos' } 
      },
      { 
        path: 'citas', 
        component: CitasComponent, 
        data: { title: 'Citas' } 
      },
      { 
        path: 'formulas', 
        component: FormulasMedicasComponent, 
        data: { title: 'Fórmulas Médicas' } 
      },
      { 
        path: 'historias', 
        component: HistoriasMedicasComponent, 
        data: { title: 'Historias Médicas' } 
      },
      { 
        path: 'especializaciones', 
        component: GestionEspecializacionesComponent, 
        data: { title: 'Especializaciones' } 
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: 'inicio' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}