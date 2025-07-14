import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModalService } from '../../../../core/services/modal.service';
import { UserResponseDTO, UserFilterDTO, DocumentType, StatusUsers, RolesUsers } from '../../../../core/models/user.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  clients: UserResponseDTO[] = [];
  filteredClients: UserResponseDTO[] = [];
  isLoading = false;
  error: string | null = null;
  searchTerm = '';
  filterStatus: StatusUsers | 'ALL' = 'ALL';
  filterDocumentType: DocumentType | 'ALL' = 'ALL';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  sortBy: string = 'userCode';
  sortOrder: 'asc' | 'desc' = 'asc';

  selectedClients: Set<string> = new Set();
  showFilters = false;

  StatusUsers = StatusUsers;
  DocumentType = DocumentType;

  Math = Math;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar lista de clientes
   */
  loadClients(): void {
    this.isLoading = true;
    const filters: UserFilterDTO = {
      role: RolesUsers.CLIENT,
      search: this.searchTerm || undefined,
      status: this.filterStatus !== 'ALL' ? this.filterStatus as StatusUsers : undefined,
      documentType: this.filterDocumentType !== 'ALL' ? this.filterDocumentType as DocumentType : undefined,
      page: this.currentPage,
      limit: this.itemsPerPage,
      sortBy: this.sortBy || 'userCode',
      sortOrder: this.sortOrder || 'asc'
    };

    this.userService.getClientUsersWithFilters(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.clients = response.users;
          this.filteredClients = [...this.clients];
          this.totalItems = response.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          this.isLoading = false;

          this.userService.getClientUsers()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (clients) => {
                this.clients = clients;
                this.applyFilters();
                this.isLoading = false;
                this.error = null;
              },
              error: (fallbackError) => {
                console.error('Fallback error:', fallbackError);
                this.error = 'Error al cargar los clientes';
                this.isLoading = false;
              }
            });
        }
      });
  }

  /**
   * Buscar clientes
   */
  onSearch(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  /**
   * Realizar búsqueda
   */
  private performSearch(searchTerm: string): void {
    this.currentPage = 1;
    this.loadClients();
  }
  /**
   * Aplicar filtros y ordenamiento local
   */
  applyFilters(): void {
    this.filteredClients = [...this.clients];
    this.applySorting();
    this.totalItems = this.filteredClients.length;
    this.updatePagination();
  }
  /**
   * Aplicar ordenamiento local
   */
  private applySorting(): void {
    if (this.sortBy === 'userCode') {
      this.filteredClients.sort((a, b) => {
        const getNumFromUserCode = (userCode: string): number => {
          const match = userCode.match(/USR-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };

        const numA = getNumFromUserCode(a.userCode);
        const numB = getNumFromUserCode(b.userCode);

        if (this.sortOrder === 'asc') {
          return numA - numB;
        } else {
          return numB - numA;
        }
      });
    } else if (this.sortBy === 'registrationDate') {
      this.filteredClients.sort((a, b) => {
        const dateA = new Date(a.registrationDate).getTime();
        const dateB = new Date(b.registrationDate).getTime();

        if (this.sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    } else {
      this.filteredClients.sort((a, b) => {
        let valueA: any = a[this.sortBy as keyof UserResponseDTO];
        let valueB: any = b[this.sortBy as keyof UserResponseDTO];

        if (this.sortBy === 'fullName') {
          valueA = `${a.firstName} ${a.lastName}`;
          valueB = `${b.firstName} ${b.lastName}`;
        }

        valueA = valueA?.toString().toLowerCase() || '';
        valueB = valueB?.toString().toLowerCase() || '';

        if (this.sortOrder === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });
    }
  }

  /**
   * Cambiar filtro de estado
   */
  onStatusFilterChange(status: StatusUsers | 'ALL'): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.loadClients();
  }

  /**
   * Cambiar filtro de tipo de documento
   */
  onDocumentTypeFilterChange(documentType: DocumentType | 'ALL'): void {
    this.filterDocumentType = documentType;
    this.currentPage = 1;
    this.loadClients();
  }

  /**
   * Actualizar paginación
   */
  private updatePagination(): void {
  }

  /**
   * Obtener clientes paginados
   */
  get paginatedClients(): UserResponseDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredClients.slice(startIndex, endIndex);
  }

  /**
   * Obtener número total de páginas
   */
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Cambiar página
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Ir a la página anterior
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadClients();
    }
  }

  /**
   * Ir a la página siguiente
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadClients();
    }
  }

  /**
   * Alternar selección de cliente
   */
  toggleClientSelection(clientId: string): void {
    if (this.selectedClients.has(clientId)) {
      this.selectedClients.delete(clientId);
    } else {
      this.selectedClients.add(clientId);
    }
  }

  /**
   * Seleccionar todos los clientes
   */
  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.selectedClients.clear();
    } else {
      this.paginatedClients.forEach(client => {
        this.selectedClients.add(client.id);
      });
    }
  }

  /**
   * Verificar si todos están seleccionados
   */
  get isAllSelected(): boolean {
    return this.paginatedClients.length > 0 &&
      this.paginatedClients.every(client => this.selectedClients.has(client.id));
  }

  /**
   * Verificar si hay selección parcial
   */
  get isPartiallySelected(): boolean {
    const selectedInPage = this.paginatedClients.filter(client => this.selectedClients.has(client.id)).length;
    return selectedInPage > 0 && selectedInPage < this.paginatedClients.length;
  }

  /**
   * Eliminar cliente
   */
  deleteClient(client: UserResponseDTO): void {
    this.modalService.confirm(
      'Confirmar Eliminación',
      `¿Está seguro de que desea eliminar al cliente "${client.fullName}"? Esta acción no se puede deshacer.`,
      'Eliminar',
      'Cancelar'
    ).pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed) {
        this.userService.deleteUser(client.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.notificationService.success(
              'Cliente eliminado',
              `El cliente ${client.fullName} ha sido eliminado exitosamente`
            );
            this.filterStatus = StatusUsers.INACTIVE;
            this.loadClients();
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
   * Eliminar clientes seleccionados
   */
  deleteSelectedClients(): void {
    if (this.selectedClients.size === 0) return;

    const selectedCount = this.selectedClients.size;
    this.modalService.confirm(
      'Confirmar Eliminación Múltiple',
      `¿Está seguro de que desea eliminar ${selectedCount} cliente${selectedCount > 1 ? 's' : ''}? Esta acción no se puede deshacer.`,
      'Eliminar Todos',
      'Cancelar'
    ).pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed) {
        const clientIds = Array.from(this.selectedClients);
        let completedRequests = 0;
        let errors = 0;

        clientIds.forEach(clientId => {
          this.userService.deleteUser(clientId).pipe(
            takeUntil(this.destroy$)
          ).subscribe({
            next: () => {
              completedRequests++;
              if (completedRequests === clientIds.length) {
                this.selectedClients.clear();
                if (errors === 0) {
                  this.notificationService.success(
                    'Clientes eliminados',
                    `Se eliminaron ${selectedCount} cliente${selectedCount > 1 ? 's' : ''} exitosamente`
                  );
                } else {
                  this.notificationService.warning(
                    'Eliminación parcial',
                    `Se eliminaron ${completedRequests - errors} de ${selectedCount} clientes. ${errors} fallaron.`
                  );
                }
                this.filterStatus = StatusUsers.INACTIVE;
                this.loadClients();
              }
            },
            error: (error) => {
              console.error('Error deleting client:', error);
              errors++;
              completedRequests++;
              if (completedRequests === clientIds.length) {
                this.selectedClients.clear();
                this.notificationService.error(
                  'Error en eliminación',
                  `No se pudieron eliminar ${errors} de ${selectedCount} clientes.`
                );
                this.loadClients();
              }
            }
          });
        });
      }
    });
  }

  /**
   * Restaurar cliente
   */
  restoreClient(client: UserResponseDTO): void {
    this.userService.restoreUser(client.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.notificationService.success(
          'Cliente restaurado',
          `El cliente ${client.fullName} ha sido restaurado exitosamente`
        );
        this.loadClients();
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
   * Refrescar lista
   */
  refreshList(): void {
    this.selectedClients.clear();
    this.loadClients();
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
      [DocumentType.CARNET_EXTRANJERIA]: 'C.E.'
    };
    return documentTypeTexts[documentType] || documentType;
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE');
  }

  /**
   * Track by function para ngFor
   */
  trackByClientId(index: number, client: UserResponseDTO): string {
    return client.id;
  }

  /**
   * Navegación - Crear cliente
   */
  createClient(): void {
    this.router.navigate(['/admin/users/create']);
  }

  /**
   * Navegación - Ver detalles del cliente
   */
  viewClient(client: UserResponseDTO): void {
    this.router.navigate(['/admin/users', client.id]);
  }

  /**
   * Navegación - Editar cliente
   */
  editClient(client: UserResponseDTO): void {
    this.router.navigate(['/admin/users/edit', client.id]);
  }

  /**
   * Obtener números de página para paginación
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
  /**
   * Cambiar ordenamiento
   */
  sort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1;

    if (this.clients.length > 0) {
      this.applyFilters();
    } else {
      this.loadClients();
    }
  }

  /**
   * Obtener icono de sorting
   */
  getSortIcon(field: string): string {
    if (this.sortBy !== field) {
      return 'sort';
    }
    return this.sortOrder === 'asc' ? 'sort-up' : 'sort-down';
  }

  /**
   * Limpiar selección
   */
  clearSelection(): void {
    this.selectedClients.clear();
  }

  /**
   * Eliminar clientes seleccionados en lote
   */
  bulkDelete(): void {
    this.deleteSelectedClients();
  }
}
