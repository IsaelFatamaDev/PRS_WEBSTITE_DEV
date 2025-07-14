import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoxService } from '../../../../core/services/box.service';
import { WaterBoxAssignment, Status, WaterBox } from 'app/core/models/box.model';
@Component({
  selector: 'app-box-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './box-assignment.component.html',

})
export class BoxAssignmentComponent implements OnInit {
  assignments: WaterBoxAssignment[] = [];
  loading = false;
  showModal = false;
  isEdit = false;
  form: FormGroup;
  currentId: number | null = null;
  statusOptions = Object.values(Status);
  waterBoxIds: number[] = [];
  showDetailsModal = false;
  selectedAssignment: WaterBoxAssignment | null = null;
  selectedWaterBox: WaterBox | null = null;

  constructor(
    private boxService: BoxService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      waterBoxId: ['', Validators.required],
      userId: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      startDate: ['', Validators.required],
      endDate: [''],
      monthlyFee: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      status: [Status.ACTIVE, Validators.required]
    });
  }

  ngOnInit() {
    this.fetchAssignments();
    this.fetchWaterBoxIds();
  }

  fetchAssignments(activeOnly: boolean = true) {
    this.loading = true;
    const fetchObservable = activeOnly ? this.boxService.getAllActiveWaterBoxAssignments() : this.boxService.getAllInactiveWaterBoxAssignments();

    fetchObservable.subscribe({
      next: (assignments) => {
        this.assignments = assignments.sort((a, b) => a.id - b.id);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  fetchInactiveAssignments() {
    this.fetchAssignments(false);
  }

  openModal(edit: boolean = false, assignment?: WaterBoxAssignment) {
    this.showModal = true;
    this.isEdit = edit;
    if (edit && assignment) {
      this.currentId = assignment.id;
      this.form.patchValue({
        ...assignment,
        startDate: assignment.startDate ? new Date(assignment.startDate).toISOString().slice(0, 10) : '',
        endDate: assignment.endDate ? new Date(assignment.endDate).toISOString().slice(0, 10) : ''
      });
    } else {
      this.currentId = null;
      this.form.reset({ status: Status.ACTIVE });
    }
    this.fetchWaterBoxIds();
  }

  closeModal() {
    this.showModal = false;
    this.form.reset({ status: Status.ACTIVE });
    this.currentId = null;
  }

  viewDetails(assignment: WaterBoxAssignment) {
    this.selectedAssignment = assignment;
    this.showDetailsModal = true;

    // Fetch water box details only if selectedAssignment is not null
    if (this.selectedAssignment) {
      this.boxService.getWaterBoxById(this.selectedAssignment.waterBoxId).subscribe({
        next: (waterBox) => {
          this.selectedWaterBox = waterBox;
        },
        error: (err) => {
          console.error('Error fetching water box details:', err);
          this.selectedWaterBox = null; // Ensure it's null on error
        }
      });
    }
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedAssignment = null;
  }

  submit() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos y válidos.', 'error');
      return;
    }
    const value = { ...this.form.value };
    if (value.startDate) {
      value.startDate = new Date(value.startDate).toISOString();
    }
    if (value.endDate) {
      value.endDate = new Date(value.endDate).toISOString();
    }
    if (this.isEdit && this.currentId) {
      this.boxService.updateWaterBoxAssignment(this.currentId, value).subscribe(() => {
        this.fetchAssignments();
        this.closeModal();
        Swal.fire('¡Actualizado!', 'La asignación ha sido actualizada.', 'success');
      });
    } else {
      this.boxService.createWaterBoxAssignment(value).subscribe(() => {
        this.fetchAssignments();
        this.closeModal();
        Swal.fire('¡Creado!', 'La asignación ha sido creada.', 'success');
      });
    }
  }

  deleteAssignment(id: number) {
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
        this.boxService.deleteWaterBoxAssignment(id).subscribe({
          next: () => {
            this.fetchAssignments();
            Swal.fire('¡Eliminado!', 'La asignación ha sido eliminada.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error.message || 'No se pudo eliminar la asignación.', 'error');
          }
        });
      }
    });
  }

  restoreAssignment(id: number) {
    Swal.fire({
      title: '¿Estás seguro de restaurar?',
      text: 'Esta acción restaurará la asignación.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.boxService.restoreWaterBoxAssignment(id).subscribe(() => {
          this.fetchAssignments();
          Swal.fire('¡Restaurado!', 'La asignación ha sido restaurada.', 'success');
        });
      }
    });
  }

  fetchWaterBoxIds() {
    this.boxService.getAllWaterBoxes().subscribe({
      next: (boxes) => {
        this.waterBoxIds = boxes.map(box => box.id).sort((a, b) => a - b);
      },
      error: (err) => {
        console.error('Error fetching water box IDs', err);
      }
    });
  }
}
