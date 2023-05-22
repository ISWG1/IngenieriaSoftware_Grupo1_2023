
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { environment } from 'src/enviroments/enviroment';
import { DireccionService } from 'src/app/shared/services/direccion.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-direccion',
  templateUrl: './direccion.component.html',
  styleUrls: ['./direccion.component.scss']
})
export class DireccionComponent implements OnInit {
  direccion!: string;
  mapa!: mapboxgl.Map;
  marker!: mapboxgl.Marker;
  ubicacionLat!: number;
  ubicacionLong!: number;
  googleMapsAccessToken: string = '';
  constructor(
    private http: HttpClient,
    private direccionService: DireccionService,
    @Inject(MAT_DIALOG_DATA) public data: UntypedFormGroup,
    private dialogRef: MatDialogRef<DireccionComponent>) {
    this.googleMapsAccessToken = environment.googleMaps.accesToken;
    this.formParent = data;
  }
  @ViewChild('map') mapElement!: ElementRef;
  @Input()
  formParent: any;


  ngOnInit() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
  }

  ngAfterViewInit() {

    const onUbicacionConcedida = (ubicacion: any) => {
      this.direccion = "https://www.google.com/maps/embed/v1/place?key=AIzaSyClGpLV-mUlxZ44TM9u9Y66ZGxYjxL7QXw&q=" + ubicacion.coords.latitude + "+" + ubicacion.coords.longitude + ",Cordoba";
      this.ubicacionLat = ubicacion.coords.latitude;
      this.ubicacionLong = ubicacion.coords.longitude;


      this.mapa = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.ubicacionLong, this.ubicacionLat],
        zoom: 12
      });
      this.mapa.on('click', (event) => {
        // Si ya hay un marcador, eliminarlo
        if (this.marker) {
          this.marker.remove();
        }
        // Crear un nuevo marcador en la ubicación del clic
        this.marker = new mapboxgl.Marker()
          .setLngLat(event.lngLat)
          .addTo(this.mapa);
        this.llenarDireccion(this.marker.getLngLat().lng, this.marker.getLngLat().lat);
      });
    }


    const onErrorDeUbicacion = (err: any) => {
      console.log("Error obteniendo ubicación: ", err);
    }

    const opcionesDeSolicitud = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    };
    navigator.geolocation.getCurrentPosition(onUbicacionConcedida, onErrorDeUbicacion, opcionesDeSolicitud);
  }


  llenarDireccion(lng: number, lat: number) {
    this.direccionService.getDireccionByCoords(lng, lat).subscribe(
      response => {

        response.results[0].address_components.forEach((element: { long_name: any, types: any; }) => {
          switch (element.types[0]) {
            case 'street_number': {
              this.formParent.patchValue({
                altura: element.long_name
              });
              break;
            }
            case 'route': {
              this.formParent.patchValue({
                calle: element.long_name
              });
              break;
            }
            case 'locality': {
              this.formParent.patchValue({
                ciudad: element.long_name
              });
              break;
            }
            case 'administrative_area_level_1': {
              this.formParent.patchValue({
                provincia: element.long_name
              });
              break;
            }
            default: {
              break;
            }
          }
        });

        this.formParent.patchValue({
          latitud: lat,
      
        });
       
        this.formParent.patchValue({
          longitud: lng
        })

        this.dialogRef.close();
      }
    );
  }


}


