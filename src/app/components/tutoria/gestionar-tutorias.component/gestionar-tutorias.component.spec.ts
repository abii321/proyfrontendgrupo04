import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarTutoriasComponent } from './gestionar-tutorias.component';

describe('GestionarTutoriasComponent', () => {
  let component: GestionarTutoriasComponent;
  let fixture: ComponentFixture<GestionarTutoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarTutoriasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarTutoriasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
