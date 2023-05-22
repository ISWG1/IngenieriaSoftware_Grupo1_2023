import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PedidoComponent } from './components/pedido/pedido.component';

const routes: Routes = [
  {path: '', component: PedidoComponent, children: /*Componente padre*/
        [
                    
        ]
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
