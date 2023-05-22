import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControlOptions, FormControl, FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DireccionComponent } from '../direccion/direccion.component';
import { MatDialog } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class PedidoComponent implements OnInit {

  formasPago: string[] = ['Efectivo', 'Tarjeta'];
  ciudades: string[] = ['Córdoba', 'Alta Gracia', 'Rio Cuarto']
  efectivo: boolean = false;
  fileName = '';
  row: string = '130px';
  columnas: number = 2;
  selectedOptionDate: boolean = false;
  @ViewChild(DireccionComponent) public direccionFormBusqueda!: DireccionComponent;
  @ViewChild("direccionEntrega") public direccionFormEntrega!: DireccionComponent;
  constructor(private snackBar: MatSnackBar, private dialog: MatDialog, private fb: UntypedFormBuilder) {
  }

  formToSearch = new UntypedFormGroup({
    imagen: new UntypedFormControl(''),
    title: new UntypedFormControl('', [Validators.required, Validators.pattern(/[A-z]\w/g)]),
    precio: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[1-9]\d{0,100}$/)])
  });

  formUbicationToSearch = new UntypedFormGroup({
    calle: new UntypedFormControl('', [Validators.required]),
    altura: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[1-9]\d{0,4}$/)]),
    ciudad: new UntypedFormControl('', [Validators.required]),
    referencia: new UntypedFormControl(''),
    latitud: new UntypedFormControl(''),
    longitud: new UntypedFormControl('')
  });

  formUbicationToDeliver = new UntypedFormGroup({
    calle: new UntypedFormControl('', [Validators.required, Validators.pattern(/[A-z]\w/g)]),
    altura: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[1-9]\d{0,4}$/)]),
    ciudad: new UntypedFormControl([Validators.required]),
    referencia: new UntypedFormControl(''),
    latitud: new UntypedFormControl(''),
    longitud: new UntypedFormControl('')
  });

  formPayment = this.fb.group({
    formaPago: ['', [Validators.required]],
    montoPagar: ['', [Validators.required]],
    numeroTarjeta: ['', [Validators.required, Validators.pattern(/^4[0-9]{12}(?:[0-9{3}])?$/)]],
    codigoTarjeta: ['', [Validators.required, Validators.pattern(/^[1-9]\d{2}$/)]],
    fechaVencimiento: [''],
    nombreTitular: ['', [Validators.required]],
    total: ['', [Validators.required, Validators.pattern(/^[1-9]\d{0,100}$/)]]
  },
    { validator: this.checkMontoPagar('montoPagar', 'total') as AbstractControlOptions }
  );

  formDateTimeToDeliver = this.fb.group({
    selectedOptionDate: [],
    horaFecha: ['', [Validators.required]]
  },
    { validator: this.checkFechaEntrega('horaFecha') as AbstractControlOptions }
  );


  form = new UntypedFormGroup({
    formToSearch: this.formToSearch,
    formUbicationToSearch: this.formUbicationToSearch,
    formUbicationToDeliver: this.formUbicationToDeliver,
    formPayment: this.formPayment,
    formDateTimeToDeliver: this.formDateTimeToDeliver
  })

  ngOnInit() {
    this.onResize();
  }

  check() {
    console.log(this.formPayment)
  }

  checkFechaEntrega(fechaEntrega: string) {
    return (formGroup: UntypedFormGroup) => {
      const control = formGroup.controls[fechaEntrega];

      if (new Date(control.value) < new Date()) {
        control.setErrors({ less: true });
      } else {
       
          control.setErrors(null);
          control.updateValueAndValidity({ onlySelf: true })
        
      }
    }
  }

  checkMontoPagar(montoPagar: string, total: string) {
    return (formGroup: UntypedFormGroup) => {
      const control = formGroup.controls[montoPagar];
      const matchingControl = formGroup.controls[total];
      if (parseInt(control.value) < parseInt(matchingControl.value) && this.formPayment.controls['formaPago'].value === 'Efectivo') {
        control.setErrors({ less: true });
      } else {
        control.setErrors(null);
        control.updateValueAndValidity({ onlySelf: true })
      }
    }

  }

  selectionChange() {
    if (this.formPayment.controls['formaPago'].value === 'Efectivo') {
      this.formPayment.controls['numeroTarjeta'].clearValidators();
      this.formPayment.controls['codigoTarjeta'].clearValidators();
      this.formPayment.controls['nombreTitular'].clearValidators();
      this.formPayment.controls['montoPagar'].setValidators([Validators.required]);
      this.efectivo = true;
    } else {
      this.formPayment.controls['numeroTarjeta'].setValidators([Validators.required, Validators.pattern(/^4[0-9]{15}?$/)]);
      this.formPayment.controls['codigoTarjeta'].setValidators([Validators.required, Validators.pattern(/^[1-9]\d{2}$/)]);
      this.formPayment.controls['nombreTitular'].setValidators([Validators.required]);
      this.formPayment.controls['montoPagar'].clearValidators();
      this.efectivo = false;
    }
    this.formPayment.controls['numeroTarjeta'].updateValueAndValidity();
    this.formPayment.controls['codigoTarjeta'].updateValueAndValidity();

    this.formPayment.controls['nombreTitular'].updateValueAndValidity();
    this.formPayment.controls['montoPagar'].updateValueAndValidity();

  }

  selectionDateChange() {
    if (this.formDateTimeToDeliver.controls['selectedOptionDate'].value === 'SeleccionarFecha') {
      this.selectedOptionDate = true;
      this.formDateTimeToDeliver.controls['horaFecha'].setValidators([Validators.required]);
    } else {
      this.selectedOptionDate = false;
      this.formDateTimeToDeliver.controls['horaFecha'].clearValidators();
    }
    this.formDateTimeToDeliver.controls['horaFecha'].updateValueAndValidity();
  }

  realizarPedido() {
    this.snackBar.open("Pedido realizado con exito!", 'cerrar', {
      duration: 3000
    })
  }

  onFileSelected(e: any) {
    const file: File = e.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.formToSearch.controls['imagen'].setValue(file.name);
      const formData = new FormData();
    }
  }

  onStepChange(event: StepperSelectionEvent){
    if(event.selectedIndex){
      this.calcularDistancia();
    }
    
  }

  patchWithDateNow() {
    this.formDateTimeToDeliver.controls['horaFecha'].patchValue(this.getFormattedDatetime((new Date).toString()));
  }

  getFormattedDatetime(dateString: string) {
    const d = new Date(dateString);

    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    let hour = '' + d.getHours();
    let min = '' + d.getMinutes();
    let sec = '' + d.getSeconds();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (min.length < 2) min = '0' + min;
    if (sec.length < 2) sec = '0' + sec;
    return [year, month, day].join('-') + 'T' + [hour, min, sec].join(':');
  }

  openDialogMapSearch() {
    this.dialog.open(DireccionComponent, {
      data: this.formUbicationToSearch
    })
  }

  openDialogMapDeliver() {
    this.dialog.open(DireccionComponent, {
      data: this.formUbicationToDeliver
    })
  }

  calcularDistancia() {

    if (this.formUbicationToDeliver?.errors == null) {
      const radioTierra = 6371; // Radio de la tierra en kilómetros
      const dLat = this.degreesToRadians(this.formUbicationToDeliver.controls['latitud'].value - this.formUbicationToSearch.controls['latitud'].value);
      const dLon = this.degreesToRadians(this.formUbicationToDeliver.controls['longitud'].value - this.formUbicationToSearch.controls['longitud'].value);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.degreesToRadians(this.formUbicationToSearch.controls['latitud'].value)) * Math.cos(this.degreesToRadians(this.formUbicationToDeliver.controls['latitud'].value)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distancia = radioTierra * c; // Distancia en kilómetros
      console.log(distancia);

      this.formPayment.patchValue(
        {
          total: (Math.ceil(distancia) * 50) + parseInt(this.formToSearch.controls['precio'].value)
        }
      )
    }

  }

  degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.row = (window.innerWidth <= 1100) ? '19vh' : '16vh';
    this.columnas = (window.innerWidth <= 1100) ? 1 : 2;
  }

  date = new FormControl(moment());

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

}
