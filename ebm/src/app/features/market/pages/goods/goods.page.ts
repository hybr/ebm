import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-goods',
  templateUrl: './goods.page.html',
  styleUrls: ['./goods.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class GoodsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
