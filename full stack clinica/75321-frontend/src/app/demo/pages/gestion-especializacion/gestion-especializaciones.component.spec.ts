import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEspecializacionesComponent } from './gestion-especializaciones.component';

describe('GestionEspecializacionesComponent', () => {
  let component: GestionEspecializacionesComponent;
  let fixture: ComponentFixture<GestionEspecializacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEspecializacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEspecializacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
