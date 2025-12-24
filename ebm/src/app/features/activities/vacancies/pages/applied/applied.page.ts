import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-applied',
  templateUrl: './applied.page.html',
  styleUrls: ['./applied.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AppliedPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
