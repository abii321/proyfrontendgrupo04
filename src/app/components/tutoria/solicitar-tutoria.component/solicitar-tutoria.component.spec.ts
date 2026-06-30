import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarTutoriaComponent } from './solicitar-tutoria.component';

describe('SolicitarTutoriaComponent', () => {
  let component: SolicitarTutoriaComponent;
  let fixture: ComponentFixture<SolicitarTutoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarTutoriaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitarTutoriaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
