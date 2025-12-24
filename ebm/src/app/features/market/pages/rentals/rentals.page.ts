import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-rentals',
  templateUrl: './rentals.page.html',
  styleUrls: ['./rentals.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RentalsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
