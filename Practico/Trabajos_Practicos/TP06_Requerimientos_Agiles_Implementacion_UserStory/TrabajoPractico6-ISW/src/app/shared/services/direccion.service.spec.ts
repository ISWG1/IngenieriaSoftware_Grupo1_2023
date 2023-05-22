/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DireccionService } from './direccion.service';

describe('Service: Direccion', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DireccionService]
    });
  });

  it('should ...', inject([DireccionService], (service: DireccionService) => {
    expect(service).toBeTruthy();
  }));
});
