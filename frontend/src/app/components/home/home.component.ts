import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Mock Data for "The Pulse"
  activeBots = 3;
  totalVolume = '2.4M';
  arbitrageOpps = 12;
  networkLatency = 45;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // In a real app, we would fetch this data from a service here
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}