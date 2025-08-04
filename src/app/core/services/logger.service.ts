import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
     providedIn: 'root'
})
export class LoggerService {

     log(message: any, ...optionalParams: any[]): void {
          if (environment.enableConsoleLog) {
               console.log(message, ...optionalParams);
          }
     }

     warn(message: any, ...optionalParams: any[]): void {
          if (environment.enableConsoleLog) {
               console.warn(message, ...optionalParams);
          }
     }

     error(message: any, ...optionalParams: any[]): void {
          if (environment.enableConsoleLog) {
               console.error(message, ...optionalParams);
          }
     }

     info(message: any, ...optionalParams: any[]): void {
          if (environment.enableConsoleLog) {
               console.info(message, ...optionalParams);
          }
     }

     debug(message: any, ...optionalParams: any[]): void {
          if (environment.enableConsoleLog) {
               console.debug(message, ...optionalParams);
          }
     }

     table(tabularData?: any, properties?: string[]): void {
          if (environment.enableConsoleLog) {
               console.table(tabularData, properties);
          }
     }

     group(label?: string): void {
          if (environment.enableConsoleLog) {
               console.group(label);
          }
     }

     groupEnd(): void {
          if (environment.enableConsoleLog) {
               console.groupEnd();
          }
     }
}
