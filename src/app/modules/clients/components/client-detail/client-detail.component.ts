import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModalService } from '../../../../core/services/modal.service';
import { UserResponseDTO, DocumentType, StatusUsers } from '../../../../core/models/user.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.css'
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  client: UserResponseDTO | null = null;
  isLoading = false;
  clientId: string | null = null;

  StatusUsers = StatusUsers;
  DocumentType = DocumentType;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id'); if (this.clientId) {
      this.loadClient(this.clientId);
    } else {
      this.router.navigate(['/admin/users']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar datos del cliente
   */
  private loadClient(clientId: string): void {
    this.isLoading = true;

    this.userService.getUserById(clientId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (client) => {
        this.client = client;
        this.isLoading = false;
      }, error: (error) => {
        console.error('Error loading client:', error);
        this.isLoading = false;
        this.router.navigate(['/admin/users']);
      }
    });
  }  /**
   * Volver a la lista
   */
  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  /**
   * Ir a editar
   */
  editClient(): void {
    if (this.client) {
      this.router.navigate(['/admin/users/edit', this.client.id]);
    }
  }

  /**
   * Eliminar cliente
   */
  deleteClient(): void {
    if (!this.client) return;

    this.modalService.confirm(
      'Confirmar Eliminación',
      `¿Está seguro de que desea eliminar al cliente "${this.client.fullName}"? Esta acción no se puede deshacer.`,
      'Eliminar',
      'Cancelar'
    ).pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed && this.client) {
        this.userService.deleteUser(this.client.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.notificationService.success(
              'Cliente eliminado',
              `El cliente ${this.client!.fullName} ha sido eliminado exitosamente`
            );
            this.router.navigate(['/admin/users']);
          },
          error: (error) => {
            console.error('Error deleting client:', error);
            this.notificationService.error(
              'Error al eliminar',
              'No se pudo eliminar el cliente. Inténtelo nuevamente.'
            );
          }
        });
      }
    });
  }
  /**
   * Restaurar cliente
   */
  restoreClient(): void {
    if (!this.client) return;

    this.userService.restoreUser(this.client.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedClient) => {
        this.client = updatedClient;
        this.notificationService.success(
          'Cliente restaurado',
          `El cliente ${this.client.fullName} ha sido restaurado exitosamente`
        );
      },
      error: (error) => {
        console.error('Error restoring client:', error);
        this.notificationService.error(
          'Error al restaurar',
          'No se pudo restaurar el cliente. Inténtelo nuevamente.'
        );
      }
    });
  }

  /**
   * Obtener clase CSS para estado
   */
  getStatusClass(status: StatusUsers): string {
    const statusClasses = {
      [StatusUsers.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      [StatusUsers.INACTIVE]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      [StatusUsers.SUSPENDED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      [StatusUsers.PENDING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return statusClasses[status] || '';
  }

  /**
   * Obtener texto para estado
   */
  getStatusText(status: StatusUsers): string {
    const statusTexts = {
      [StatusUsers.ACTIVE]: 'Activo',
      [StatusUsers.INACTIVE]: 'Inactivo',
      [StatusUsers.SUSPENDED]: 'Suspendido',
      [StatusUsers.PENDING]: 'Pendiente'
    };
    return statusTexts[status] || status;
  }

  /**
   * Obtener texto para tipo de documento
   */
  getDocumentTypeText(documentType: DocumentType): string {
    const documentTypeTexts = {
      [DocumentType.DNI]: 'DNI',
      [DocumentType.CARNET_EXTRANJERIA]: 'Carnet de Extranjería'
    };
    return documentTypeTexts[documentType] || documentType;
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatear fecha simple
   */
  formatSimpleDate(dateString: string): string {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-PE');
  }
}
