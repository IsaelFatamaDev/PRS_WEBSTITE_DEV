import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoxService } from '../../../../core/services/box.service';
import { WaterBox, BoxType, Status } from 'app/core/models/box.model';




@Component({
  selector: 'app-water-box',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './water-box.component.html',

})
export class WaterBoxComponent implements OnInit {
  boxes: WaterBox[] = [];
  allBoxes: WaterBox[] = [];

  loading = false;
  showModal = false;
  isEdit = false;
  form: FormGroup;
  currentId: number | null = null;

  statusOptions = [Status.ACTIVE, Status.INACTIVE];
  boxTypes = Object.values(BoxType);
  showDetailsModal = false;
  selectedBox: WaterBox | null = null;

  constructor(
    private boxService: BoxService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      organizationId: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      boxCode: ['', [Validators.pattern('^[a-zA-Z0-9]*$')]],
      boxType: ['', Validators.required],
      installationDate: ['', Validators.required],
      status: [Status.ACTIVE, Validators.required]
    });
  }

  ngOnInit() {
    this.fetchBoxes();
  }

  fetchBoxes(activeOnly: boolean = true) {
    this.loading = true;
    const fetchObservable = activeOnly ? this.boxService.getAllActiveWaterBoxes() : this.boxService.getAllInactiveWaterBoxes();

    fetchObservable.subscribe({
      next: (boxes) => {
        this.allBoxes = boxes.sort((a, b) => a.id - b.id);
        this.boxes = [...this.allBoxes];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  fetchInactiveBoxes() {
    this.fetchBoxes(false);
  }

  filterBoxesByType(event: Event) {
    const selectedType = (event.target as HTMLSelectElement).value;
    if (selectedType) {
      this.boxes = this.allBoxes.filter(box => box.boxType === selectedType);
    } else {
      this.boxes = [...this.allBoxes];
    }
  }



  openModal(edit: boolean = false, box?: WaterBox) {
    this.showModal = true;
    this.isEdit = edit;
    if (edit && box) {
      this.currentId = box.id;
      this.form.patchValue({ ...box, boxCode: box.boxCode.replace('WB-', '') });
    } else {
      this.currentId = null;
      this.form.reset({ status: Status.ACTIVE });
    }
  }

  closeModal() {
    this.showModal = false;
    this.form.reset({ status: Status.ACTIVE });
    this.currentId = null;
  }

  viewDetails(box: WaterBox) {
    this.selectedBox = box;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedBox = null;
  }

  submit() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos y válidos.', 'error');
      return;
    }
    const value = { ...this.form.value, boxCode: `WB-${this.form.value.boxCode}` };
    if (this.isEdit && this.currentId) {
      this.boxService.updateWaterBox(this.currentId, value).subscribe(() => {
        this.fetchBoxes();
        this.closeModal();
        Swal.fire('¡Actualizado!', 'La caja de agua ha sido actualizada.', 'success');
      });
    } else {
      this.boxService.createWaterBox(value).subscribe(() => {
        this.fetchBoxes();
        this.closeModal();
        Swal.fire('¡Creado!', 'La caja de agua ha sido creada.', 'success');
      });
    }
  }

  deleteBox(id: number) {
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
        this.boxService.deleteWaterBox(id).subscribe({
          next: () => {
            this.fetchBoxes();
            Swal.fire('¡Eliminado!', 'La caja de agua ha sido eliminada.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error.message || 'No se pudo eliminar la caja de agua.', 'error');
          }
        });
      }
    });
  }

  restoreBox(id: number) {
    Swal.fire({
      title: '¿Estás seguro de restaurar?',
      text: 'Esta acción restaurará la caja de agua.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.boxService.restoreWaterBox(id).subscribe(() => {
          this.fetchBoxes();
          Swal.fire('¡Restaurado!', 'La caja de agua ha sido restaurada.', 'success');
        });
      }
    });
  }
}
