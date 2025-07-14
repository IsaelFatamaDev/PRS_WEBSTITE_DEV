import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { Payment, PaymentCreate, DetailPayments, PaymentUpdate } from '../../../../core/models/payment.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.css'
})
export class PaymentFormComponent implements OnInit {
  paymentForm!: FormGroup;
  isEditMode = false;
  paymentId: string | null = null;
  loading = false;
  submitting = false;
  showSuccessAlert = false;
  showErrorAlert = false;

  organizationName: string = '';
  users: any[] = [];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.paymentForm = this.createForm();
    this.loadAllUsers();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.paymentId = params['id'];
        this.loadPayment();
      } else {
        this.generatePaymentCode();
      }
    });

    this.paymentForm.get('userId')!.valueChanges.subscribe(userId => {
      if (userId) {
        const selectedUser = this.users.find(u => u.id === userId);
        if (selectedUser) {
          const orgId = selectedUser.organizationId || '';
          this.paymentForm.get('organizationId')?.setValue(orgId);

          if (orgId) {
            this.paymentService.getOrganizationById(orgId).subscribe({
              next: organization => {
                this.organizationName =
                  organization.name ||
                  organization.organizationName ||
                  'Organización desconocida';
              },
              error: () => {
                this.organizationName = '';
                Swal.fire('Error', 'No se pudo cargar la organización.', 'error');
              }
            });
          } else {
            this.organizationName = '';
          }

          this.paymentForm.get('clientInfo')?.patchValue({
            documentType: selectedUser.documentType,
            documentNumber: selectedUser.documentNumber,
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            phone: selectedUser.phone,
            email: selectedUser.email,
            address: {
              localityName: selectedUser.zoneId || '',
              streetName: selectedUser.streetAddress || '',
              detail: ''
            }
          });
        }
      } else {
        this.paymentForm.get('organizationId')?.reset();
        this.organizationName = '';
        this.paymentForm.get('clientInfo')?.reset();
      }
    });
  }

  private loadAllUsers(): void {
    this.paymentService.getAllUsers().subscribe({
      next: users => {
        this.users = users;
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la lista de usuarios.', 'error');
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private createForm(): FormGroup {
    return this.fb.group({
      organizationId: ['', Validators.required],
      paymentCode: ['', Validators.required],
      userId: ['', Validators.required],
      waterBoxId: [''],
      paymentType: ['AGUA', Validators.required],
      paymentMethod: ['', Validators.required],
      totalAmount: ['', Validators.required],
      paymentDate: [this.formatDate(new Date()), Validators.required],
      paymentStatus: ['', Validators.required],
      externalReference: [''],
      clientInfo: this.fb.group({
        documentType: [''],
        documentNumber: [''],
        firstName: [''],
        lastName: [''],
        phone: [''],
        email: [''],
        address: this.fb.group({
          localityName: [''],
          streetName: [''],
          detail: ['']
        })
      }),
      details: this.fb.array([])
    });
  }

  get details(): FormArray {
    return this.paymentForm.get('details') as FormArray;
  }

  addDetail(): void {
    this.details.push(
      this.fb.group({
        concept: ['', Validators.required],
        year: ['', Validators.required],
        month: ['', Validators.required],
        amount: ['', Validators.required],
        description: [''],
        periodStart: ['', Validators.required],
        periodEnd: ['', Validators.required]
      })
    );
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  private loadPayment(): void {
    this.loading = true;
    this.paymentService.getById(this.paymentId!).subscribe({
      next: (payment: Payment & { details?: DetailPayments[] }) => {
        this.paymentForm.patchValue({
          organizationId: payment.organizationId,
          paymentCode: payment.paymentCode,
          userId: payment.userId,
          waterBoxId: payment.waterBoxId,
          paymentType: payment.paymentType,
          paymentMethod: payment.paymentMethod,
          totalAmount: payment.totalAmount,
          paymentDate: this.formatDate(new Date(payment.paymentDate)),
          paymentStatus: payment.paymentStatus,
          externalReference: payment.externalReference
        });

        if (payment.details && Array.isArray(payment.details)) {
          payment.details.forEach((detail: DetailPayments) => {
            this.details.push(
              this.fb.group({
                concept: [detail.concept, Validators.required],
                year: [detail.year, Validators.required],
                month: [detail.month, Validators.required],
                amount: [detail.amount, Validators.required],
                description: [detail.description],
                periodStart: [detail.periodStart, Validators.required],
                periodEnd: [detail.periodEnd, Validators.required]
              })
            );
          });
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar el pago.', 'error');
      }
    });
  }

  submit(): void {
    if (this.paymentForm.invalid) {
      this.showErrorAlert = true;
      return;
    }

    this.submitting = true;

    // Prepara el payload
    const formValue = this.paymentForm.value;

    // Convierte fechas de los detalles correctamente
    const formattedDetails = (formValue.details || []).map((detail: any) => ({
      concept: detail.concept,
      year: detail.year,
      month: detail.month,
      amount: detail.amount,
      description: detail.description,
      periodStart: detail.periodStart,
      periodEnd: detail.periodEnd
    }));

    if (this.isEditMode) {
      const updatePayload: PaymentUpdate = {
        organizationId: formValue.organizationId,
        paymentCode: formValue.paymentCode,
        userId: formValue.userId,
        waterBoxId: formValue.waterBoxId,
        paymentType: formValue.paymentType,
        paymentMethod: formValue.paymentMethod,
        totalAmount: formValue.totalAmount,
        paymentDate: formValue.paymentDate,
        paymentStatus: formValue.paymentStatus,
        externalReference: formValue.externalReference
      };

      this.paymentService.update(this.paymentId!, updatePayload).subscribe({
        next: () => this.handleSuccess(),
        error: () => this.handleError()
      });
    } else {
      const createPayload: PaymentCreate = {
        organizationId: formValue.organizationId,
        paymentCode: formValue.paymentCode,
        userId: formValue.userId,
        waterBoxId: formValue.waterBoxId,
        paymentType: formValue.paymentType,
        paymentMethod: formValue.paymentMethod,
        totalAmount: formValue.totalAmount,
        paymentDate: formValue.paymentDate,
        paymentStatus: formValue.paymentStatus,
        externalReference: formValue.externalReference,
        details: formattedDetails
      };

      this.paymentService.create(createPayload).subscribe({
        next: () => this.handleSuccess(),
        error: () => this.handleError()
      });
    }
  }


  private handleSuccess(): void {
    this.submitting = false;
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.router.navigate(['/admin/payments']);
    }, 2000);
  }

  private handleError(): void {
    this.submitting = false;
    Swal.fire('Error', 'Ocurrió un error al guardar el pago.', 'error');
  }

  cancel(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se cancelará el registro del pago.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['/admin/payments']);
      }
    });
  }

  private generatePaymentCode(): void {
    this.paymentService.getAllPayments().subscribe({
      next: (payments) => {
        const codes = payments
          .map(p => p.paymentCode)
          .filter(code => code && code.startsWith('JASS-01-'));

        let maxNumber = 0;
        codes.forEach(code => {
          const parts = code.split('-');
          const numberPart = parts[2];
          const number = parseInt(numberPart, 10);
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        });

        const nextNumber = maxNumber + 1;
        const formattedNumber = String(nextNumber).padStart(4, '0');
        const newCode = `JASS-01-${formattedNumber}`;

        this.paymentForm.get('paymentCode')?.setValue(newCode);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo generar el código de pago.', 'error');
      }
    });
  }
}
