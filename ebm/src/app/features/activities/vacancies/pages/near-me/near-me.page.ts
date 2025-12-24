import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-near-me',
  templateUrl: './near-me.page.html',
  styleUrls: ['./near-me.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class NearMePage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
