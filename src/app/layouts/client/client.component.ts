import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/layout/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
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
