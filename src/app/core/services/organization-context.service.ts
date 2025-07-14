import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface OrganizationContext {
     organizationId: string;
     userRole: string[];
     userName: string;
     userCode: string;
}

@Injectable({
     providedIn: 'root'
})
export class OrganizationContextService {
     private organizationContextSubject = new BehaviorSubject<OrganizationContext | null>(null);
     public organizationContext$ = this.organizationContextSubject.asObservable();

     constructor(private authService: AuthService) {
          this.authService.currentUser$.subscribe(user => {
               if (user && user.organizationId) {
                    this.setOrganizationContext({
                         organizationId: user.organizationId,
                         userRole: user.roles,
                         userName: user.fullName,
                         userCode: user.userCode
                    });
               } else {
                    this.clearOrganizationContext();
               }
          });
     }

     /**
      * Establecer el contexto de la organización
      */
     setOrganizationContext(context: OrganizationContext): void {
          this.organizationContextSubject.next(context);
     }

     /**
      * Obtener el contexto actual de la organización
      */
     getCurrentContext(): OrganizationContext | null {
          return this.organizationContextSubject.value;
     }

     /**
      * Obtener el ID de la organización actual
      */
     getCurrentOrganizationId(): string | null {
          const context = this.getCurrentContext();
          return context?.organizationId || null;
     }

     /**
      * Obtener los roles del usuario actual
      */
     getCurrentUserRoles(): string[] {
          const context = this.getCurrentContext();
          return context?.userRole || [];
     }

     /**
      * Obtener el nombre del usuario actual
      */
     getCurrentUserName(): string | null {
          const context = this.getCurrentContext();
          return context?.userName || null;
     }

     /**
      * Obtener el código del usuario actual
      */
     getCurrentUserCode(): string | null {
          const context = this.getCurrentContext();
          return context?.userCode || null;
     }

     /**
      * Verificar si hay un contexto de organización activo
      */
     hasOrganizationContext(): boolean {
          const context = this.getCurrentContext();
          return !!(context?.organizationId);
     }

     /**
      * Limpiar el contexto de la organización
      */
     clearOrganizationContext(): void {
          this.organizationContextSubject.next(null);
     }

     /**
      * Crear parámetros de consulta con organizationId
      */
     createOrganizationParams(): { organizationId: string } | {} {
          const organizationId = this.getCurrentOrganizationId();
          return organizationId ? { organizationId } : {};
     }

     /**
      * Obtener información para mostrar en la UI
      */
     getContextInfo(): {
          organizationId: string | null;
          userName: string | null;
          userCode: string | null;
          roles: string[];
     } {
          const context = this.getCurrentContext();
          return {
               organizationId: context?.organizationId || null,
               userName: context?.userName || null,
               userCode: context?.userCode || null,
               roles: context?.userRole || []
          };
     }
}
