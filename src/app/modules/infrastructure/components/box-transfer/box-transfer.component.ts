import { CommonModule } from '@angular/common';
  import Swal from 'sweetalert2';
  import { Component, OnInit } from '@angular/core';
  import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
  import { BoxService } from '../../../../core/services/box.service';
  import { UserService } from 'app/core/services/user.service';
  import { WaterBoxTransfer } from 'app/core/models/box.model';

  type DocumentKind = 'pdf' | 'jpg' | 'png' | 'docx' | 'xlsx' | 'other';

  @Component({
    selector: 'app-box-transfer',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './box-transfer.component.html'
  })
  export class BoxTransferComponent implements OnInit {
    waterBoxes: { id: number; boxCode: string }[] = [];
    assignmentUsers: { id: number; userId: string, username: string }[] = [];
    transfers: WaterBoxTransfer[] = [];
    loading = false;
    showModal = false;
    isEdit = false;
    currentId: number | null = null;
    form: FormGroup;
    availableAssignments: { id: number; label: string; tooltip?: string }[] = [];

    constructor(
      private boxService: BoxService,
      private userService: UserService,
      private fb: FormBuilder
    ) {
      this.form = this.fb.group({
        waterBoxId: ['', Validators.required],
        oldAssignmentId: ['', Validators.required],
        newAssignmentId: ['', Validators.required],
        transferReason: ['', Validators.required],
        documents: this.fb.array([]),
        createdAt: ['']
      });
      this.form.addValidators(() => {
        const oldId = this.form.get('oldAssignmentId')?.value;
        const newId = this.form.get('newAssignmentId')?.value;
        return oldId && newId && Number(oldId) === Number(newId) ? { sameAssignment: true } : null;
      });
      this.addDocument();
    }

    ngOnInit() {
      this.fetchTransfers();
      this.fetchWaterBoxes();
      this.form.get('waterBoxId')?.valueChanges.subscribe((val) => {
        const id = Number(val);
        if (!isNaN(id) && id > 0) {
          this.onWaterBoxIdChange(id);
        } else {
          this.availableAssignments = [];
          this.form.patchValue({ oldAssignmentId: '', newAssignmentId: '' });
        }
      });
    }

    fetchWaterBoxes() {
      this.boxService.getAllWaterBoxes().subscribe({
        next: (boxes) => {
          this.waterBoxes = boxes.map(box => ({ id: box.id, boxCode: box.boxCode }));
        }
      });
    }

    private onWaterBoxIdChange(waterBoxId: number) {
      this.boxService.getWaterBoxAssignmentsByBoxId(waterBoxId).subscribe({
        next: (list) => {
          const userIds = list.map(a => a.userId);
          this.boxService.getClients().subscribe({
            next: (users) => {
              const userMap = new Map(users.map(user => [user.id, user.username]));
              this.assignmentUsers = list.map(a => ({
                id: a.id,
                userId: a.userId,
                username: userMap.get(a.userId) || 'Usuario desconocido'
              }));
              this.availableAssignments = list
                .sort((a, b) => a.id - b.id)
                .map(a => {
                  const start = a.startDate ? new Date(a.startDate).toLocaleDateString() : '';
                  const end = a.endDate ? new Date(a.endDate).toLocaleDateString() : '';
                  const tooltip = `${start}${end ? ' - ' + end : ''}`;
                  return {
                    id: a.id,
                    label: userMap.get(a.userId) || 'Usuario desconocido',
                    tooltip
                  };
                });
            },
            error: (err) => {
              console.error('Error loading clients', err);
            }
          });
        },
        error: (err) => {
          console.error('Error loading assignments by waterBoxId', err);
          this.availableAssignments = [];
        }
      });
    }

    getBoxCodeById(id: number): string {
      const box = this.waterBoxes.find(b => b.id === id);
      return box ? box.boxCode : id.toString();
    }

    getUsernameByAssignmentId(id: number): string {
      const assign = this.assignmentUsers.find(a => a.id === id);
      return assign && assign.username ? assign.username : 'Usuario desconocido';
    }

    addDocument(): void {
      this.documents.push(this.newDocument());
    }

    get documents(): FormArray {
      return this.form.get('documents') as FormArray;
    }

    newDocument(url: string = ''): FormGroup {
      return this.fb.group({ url: [url] });
    }

    removeDocument(i: number): void {
      this.documents.removeAt(i);
    }

    setDocuments(documents: string[] | { url: string }[]): void {
      this.documents.clear();
      documents.forEach((doc) => {
        const url = typeof doc === 'string' ? doc : doc.url;
        this.documents.push(this.newDocument(url));
      });
    }

    detectDocumentType(fileNameOrUrl: string): DocumentKind {
      const extension = fileNameOrUrl.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf': return 'pdf';
        case 'jpg':
        case 'jpeg': return 'jpg';
        case 'png': return 'png';
        case 'docx': return 'docx';
        case 'xlsx': return 'xlsx';
        default: return 'other';
      }
    }

    deleteTransfer(id: number) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esto.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.boxService.deleteWaterBoxTransfer(id).subscribe(() => {
            this.fetchTransfers();
            Swal.fire('¡Eliminado!', 'La transferencia ha sido eliminada.', 'success');
          });
        }
      });
    }

    restoreTransfer(id: number) {
      Swal.fire({
        title: '¿Estás seguro de restaurar?',
        text: 'Esta acción restaurará la transferencia.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.boxService.restoreWaterBoxTransfer(id).subscribe(() => {
            this.fetchTransfers();
            Swal.fire('¡Restaurado!', 'La transferencia ha sido restaurada.', 'success');
          });
        }
      });
    }

    private statusToLabel(status?: string): string {
      switch ((status || '').toUpperCase()) {
        case 'ACTIVE': return 'Activo';
        case 'INACTIVE': return 'Inactivo';
        case 'COMPLETED': return 'Completado';
        case 'CANCELLED': return 'Cancelado';
        default: return (status || '').toString();
      }
    }

    fetchTransfers() {
      this.loading = true;
      this.boxService.getAllWaterBoxTransfers().subscribe({
        next: (data) => {
          // 1) Tomamos todos los IDs de asignación de las transferencias
          const assignIds = data.flatMap(t => [t.oldAssignmentId, t.newAssignmentId]).filter(id => id != null) as number[];
          // 2) Obtenemos las asignaciones por esos IDs -> Map id -> asignación
          this.boxService.getAssignmentsByIds(assignIds).subscribe({
            next: (assignMap) => {
              // 3) Con las asignaciones, recogemos sus userIds únicos
              const userIds = Array.from(assignMap.values()).map(a => a.userId);
              // 4) Obtenemos usuarios por IDs -> Map userId -> username
              this.boxService.getUsersByIds(userIds).subscribe({
                next: (userMap) => {
                  this.transfers = data.map(t => {
                    const oldAssign = assignMap.get(t.oldAssignmentId);
                    const newAssign = assignMap.get(t.newAssignmentId);
                    return {
                      ...t,
                      oldAssignmentUsername: oldAssign ? (userMap.get(oldAssign.userId) || 'Usuario desconocido') : 'Usuario desconocido',
                      newAssignmentUsername: newAssign ? (userMap.get(newAssign.userId) || 'Usuario desconocido') : 'Usuario desconocido'
                    };
                  }).sort((a, b) => a.id - b.id);
                  this.loading = false;
                },
                error: () => { this.loading = false; }
              });
            },
            error: () => { this.loading = false; }
          });
        },
        error: () => { this.loading = false; }
      });
    }

    openModal(edit: boolean = false, transfer?: WaterBoxTransfer) {
      this.showModal = true;
      this.isEdit = edit;
      if (this.isEdit && transfer) {
        this.currentId = transfer.id;
        this.form.patchValue({ ...transfer, documents: null });
        this.setDocuments(transfer.documents || []);
        if (transfer.waterBoxId) {
          this.onWaterBoxIdChange(transfer.waterBoxId);
        }
      } else {
        this.currentId = null;
        this.form.reset();
        this.documents.clear();
        this.addDocument();
      }
    }

    closeModal() {
      this.showModal = false;
      this.form.reset();
      this.currentId = null;
    }

    submit() {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
      const documentUrls: string[] = this.documents.controls
        .map(control => (control.value?.url || '').trim())
        .filter(url => url.length > 0);
      this.proceedSave(documentUrls);
    }

    private proceedSave(documentUrls: string[]) {
      const raw = this.form.value as any;
      const value = {
        ...raw,
        waterBoxId: Number(raw.waterBoxId),
        oldAssignmentId: Number(raw.oldAssignmentId),
        newAssignmentId: Number(raw.newAssignmentId),
        documents: documentUrls
      };
      if (this.isEdit && this.currentId !== null) {
        this.boxService.updateWaterBoxTransfer(this.currentId, value).subscribe({
          next: () => {
            this.fetchTransfers();
            this.closeModal();
            Swal.fire('Actualizada', 'La transferencia se actualizó correctamente.', 'success');
          },
          error: (err: any) => {
            console.error('Error updating transfer:', err);
            Swal.fire('Error', 'Hubo un problema al actualizar la transferencia.', 'error');
          }
        });
      } else {
        this.boxService.createWaterBoxTransfer(value).subscribe({
          next: () => {
            this.fetchTransfers();
            this.closeModal();
            Swal.fire('Creada', 'La transferencia se creó correctamente.', 'success');
          },
          error: (err: any) => {
            console.error('Error creating transfer:', err);
            Swal.fire('Error', 'Hubo un problema al crear la transferencia.', 'error');
          }
        });
      }
    }
  }
