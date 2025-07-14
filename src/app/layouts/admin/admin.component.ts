import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { SidebarComponent } from '../../shared/components/layout/sidebar/sidebar.component';
import { NotificationComponent } from '../../shared/components/notification/notification.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-admin',
  standalone: true, imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    NotificationComponent,
    ModalComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css', '../shared/layout.css']
})
export class AdminComponent implements OnInit {
  isSidebarOpen: boolean = true;
  showMobileMenuButton: boolean = false;
  windowWidth: number = window.innerWidth;

  constructor() { }

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.checkScreenSize();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.windowWidth = window.innerWidth;
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (this.windowWidth < 1280) {
      this.showMobileMenuButton = true;
      this.isSidebarOpen = false;
    } else {
      this.showMobileMenuButton = false;
      this.isSidebarOpen = true;
    }
  }
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onSidebarOptionSelected(): void {
    if (this.windowWidth < 1280) {
      this.isSidebarOpen = false;
    }
  }
}
