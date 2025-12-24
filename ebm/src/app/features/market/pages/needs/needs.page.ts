import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-needs',
  templateUrl: './needs.page.html',
  styleUrls: ['./needs.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class NeedsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
