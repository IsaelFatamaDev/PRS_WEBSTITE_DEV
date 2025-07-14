import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoxService } from '../../../../core/services/box.service';
import { WaterBoxTransfer, Status, WaterBox } from 'app/core/models/box.model';

enum DocumentType {
  PDF = 'pdf',
  JPG = 'jpg',
  PNG = 'png',
  DOCX = 'docx',
  XLSX = 'xlsx',
  OTHER = 'other'
}

@Component({
  selector: 'app-box-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './box-transfer.component.html',

})
export class BoxTransferComponent implements OnInit {
  transfers: WaterBoxTransfer[] = [];
  loading = false;
  showModal = false;
  isEdit = false;
  currentId: number | null = null;
  form: FormGroup;

  constructor(
    private boxService: BoxService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      waterBoxId: ['', Validators.required],
      oldAssignmentId: ['', Validators.required],
      newAssignmentId: ['', Validators.required],
      transferReason: [''],
      documents: this.fb.array([]),
      createdAt: ['']
    });
     this.addDocument(); // Add one document field by default
   }

   addDocument(): void {
     this.documents.push(this.newDocument());
   }

   get documents(): FormArray {
     return this.form.get('documents') as FormArray;
   }

   newDocument(url: string = '', type: DocumentType = DocumentType.OTHER): FormGroup {
     return this.fb.group({
       url: [url, Validators.required],
       type: [type, Validators.required]
     });
   }

   removeDocument(i: number): void {
     this.documents.removeAt(i);
   }

   setDocuments(documentUrls: string[]): void {
     this.documents.clear();
     documentUrls.forEach(docUrl => {
       const type = this.detectDocumentType(docUrl);
       this.documents.push(this.newDocument(docUrl, type));
     });
   }

   detectDocumentType(url: string): DocumentType {
     const extension = url.split('.').pop()?.toLowerCase();
     switch (extension) {
       case 'pdf': return DocumentType.PDF;
       case 'jpg':
       case 'jpeg': return DocumentType.JPG;
       case 'png': return DocumentType.PNG;
       case 'docx': return DocumentType.DOCX;
       case 'xlsx': return DocumentType.XLSX;
       default: return DocumentType.OTHER;
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

  ngOnInit() {
    this.fetchTransfers();
  }

  fetchTransfers() {
    this.loading = true;
    this.boxService.getAllWaterBoxTransfers().subscribe({
      next: (data) => { this.transfers = data.sort((a, b) => a.id - b.id); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openModal(edit: boolean = false, transfer?: WaterBoxTransfer) {
    this.showModal = true;
    this.isEdit = edit;
    if (this.isEdit && transfer) {
      this.currentId = transfer.id;
      this.form.patchValue({ ...transfer, documents: null }); // Patch other values first
      this.setDocuments(transfer.documents || []);
    } else {
      this.currentId = null;
      this.form.reset();
      this.documents.clear(); // Clear existing documents
      this.addDocument(); // Add one document field by default
    }
  }

  closeModal() {
    this.showModal = false;
    this.form.reset();
    this.currentId = null;
  }

  submit() {
    if (this.form.invalid) return;
    const value = { ...this.form.value };
    value.documents = this.documents.controls.map(control => control.value.url); // Extract only URLs

    if (this.isEdit && this.currentId !== null) {
      this.boxService.updateWaterBoxTransfer(this.currentId, value).subscribe({
        next: () => {
          this.fetchTransfers();
          this.closeModal();
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
        },
        error: (err: any) => {
          console.error('Error creating transfer:', err);
          Swal.fire('Error', 'Hubo un problema al crear la transferencia.', 'error');
        }
      });
    }
  }
}
