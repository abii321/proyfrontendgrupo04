import { RespuestaAyudaComponent } from './respuesta-ayuda.component';
import { Solicitud } from '../../../models/solicitud.class';

describe('RespuestaAyudaComponent', () => {
  it('debe mostrar un mensaje inline cuando falta la respuesta o el precio es inválido', () => {
    const component = new RespuestaAyudaComponent(
      { createRespuesta: () => ({ subscribe: () => {} }) } as any,
      { crearPreferencia: () => ({ subscribe: () => {} }) } as any
    );

    component.solicitud = { id: 1 } as Solicitud;
    component.respuesta.respuesta = '';
    component.respuesta.precio = -5;

    component.guardar();

    expect(component.mensajeFormulario?.tipo).toBe('error');
    expect(component.mensajeFormulario?.texto).toContain('precio válido');
  });
});
