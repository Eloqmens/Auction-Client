import { Component, OnInit } from '@angular/core';
import { LotService } from '../../services/lot.service';
import { Lot } from '../../models/lot.model';

@Component({
  selector: 'app-lot-list',
  templateUrl: './lot-list.component.html',
  styleUrls: ['./lot-list.component.css']
})
export class LotListComponent implements OnInit {
  lots: Lot[] = [];

  constructor(private lotService: LotService) {}

  ngOnInit(): void {
    this.lotService.getLots().subscribe((data) => {
      this.lots = data;
    });
  }
}
