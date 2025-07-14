import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ModalConfig {
     id: string;
     type: 'confirm' | 'alert' | 'custom';
     title: string;
     message: string;
     confirmText?: string;
     cancelText?: string;
     confirmButtonClass?: string;
     cancelButtonClass?: string;
     showCancel?: boolean;
     icon?: string;
     iconClass?: string;
}

export interface ModalResult {
     id: string;
     confirmed: boolean;
     cancelled: boolean;
}

@Injectable({
     providedIn: 'root'
})
export class ModalService {
     private modalSubject = new Subject<ModalConfig>();
     private resultSubject = new Subject<ModalResult>();

     public modals$ = this.modalSubject.asObservable();
     public results$ = this.resultSubject.asObservable();

     /**
      * Mostrar modal de confirmación
      */
     confirm(
          title: string,
          message: string,
          confirmText: string = 'Confirmar',
          cancelText: string = 'Cancelar'
     ): Observable<boolean> {
          const id = this.generateId();

          const config: ModalConfig = {
               id,
               type: 'confirm',
               title,
               message,
               confirmText,
               cancelText,
               showCancel: true,
               confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
               cancelButtonClass: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
               icon: 'fas fa-exclamation-triangle',
               iconClass: 'text-red-500'
          };

          this.modalSubject.next(config);

          return new Observable<boolean>(observer => {
               const subscription = this.results$.subscribe(result => {
                    if (result.id === id) {
                         observer.next(result.confirmed);
                         observer.complete();
                         subscription.unsubscribe();
                    }
               });
          });
     }

     /**
      * Mostrar modal de alerta
      */
     alert(
          title: string,
          message: string,
          buttonText: string = 'Entendido'
     ): Observable<boolean> {
          const id = this.generateId();

          const config: ModalConfig = {
               id,
               type: 'alert',
               title,
               message,
               confirmText: buttonText,
               showCancel: false,
               confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
               icon: 'fas fa-info-circle',
               iconClass: 'text-blue-500'
          };

          this.modalSubject.next(config);

          return new Observable<boolean>(observer => {
               const subscription = this.results$.subscribe(result => {
                    if (result.id === id) {
                         observer.next(true);
                         observer.complete();
                         subscription.unsubscribe();
                    }
               });
          });
     }

     /**
      * Responder a modal
      */
     respond(id: string, confirmed: boolean): void {
          this.resultSubject.next({
               id,
               confirmed,
               cancelled: !confirmed
          });
     }

     private generateId(): string {
          return Math.random().toString(36).substr(2, 9);
     }
}
