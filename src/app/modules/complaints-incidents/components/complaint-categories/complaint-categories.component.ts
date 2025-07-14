import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ComplaintCategoriesService } from '../../services/complaint-categories.service';
import { ComplaintCategory } from '../../models/complaints-incidents.models';

@Component({
  selector: 'app-complaint-categories',
  templateUrl: './complaint-categories.component.html',
  styleUrls: ['./complaint-categories.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ComplaintCategoriesComponent implements OnInit {
  categories: ComplaintCategory[] = [];
  categoryForm: FormGroup;
  isEditing = false;
  selectedCategoryId: string | null = null;
  priorityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  statusOptions = ['ACTIVE', 'INACTIVE'];
  showFormModal = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: ComplaintCategoriesService
  ) {
    this.categoryForm = this.fb.group({
      categoryCode: ['', Validators.required],
      categoryName: ['', Validators.required],
      description: ['', Validators.required],
      priorityLevel: ['MEDIUM', Validators.required],
      maxResponseTime: [24, [Validators.required, Validators.min(1)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.showMessage('Error loading categories');
        console.error('Error loading categories:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;
      
      const operation = this.isEditing && this.selectedCategoryId
        ? this.categoryService.update(this.selectedCategoryId, categoryData)
        : this.categoryService.create(categoryData);
        
      const message = this.isEditing ? 'Category updated successfully' : 'Category created successfully';
      const errorMessage = this.isEditing ? 'Error updating category' : 'Error creating category';

      operation.subscribe({
        next: () => {
          this.showMessage(message);
          this.closeForm();
          this.loadCategories();
        },
        error: (error) => {
          this.showMessage(errorMessage);
          console.error(errorMessage, error);
        }
      });
    }
  }

  openForm(category?: ComplaintCategory): void {
    if (category) {
      this.isEditing = true;
      this.selectedCategoryId = category.id || null;
      this.categoryForm.patchValue(category);
    } else {
      this.isEditing = false;
      this.selectedCategoryId = null;
      this.categoryForm.reset({
        priorityLevel: 'MEDIUM',
        maxResponseTime: 24,
        status: 'ACTIVE'
      });
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.delete(id).subscribe({
        next: () => {
          this.showMessage('Category deleted successfully');
          this.loadCategories();
        },
        error: (error) => {
          this.showMessage('Error deleting category');
          console.error('Error deleting category:', error);
        }
      });
    }
  }

  private showMessage(message: string): void {
    // Simple alert for now - can be replaced with a custom toast notification
    alert(message);
  }
} 