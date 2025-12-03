import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioMedicamentosComponent } from './InventarioMedicamentosComponent';

describe('MedicamentosComponent', () => {
  let component: InventarioMedicamentosComponent;
  let fixture: ComponentFixture<InventarioMedicamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioMedicamentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioMedicamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
