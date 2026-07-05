import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoError } from './pago-error';

describe('PagoError', () => {
  let component: PagoError;
  let fixture: ComponentFixture<PagoError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoError],
    }).compileComponents();

    fixture = TestBed.createComponent(PagoError);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
