import { Component, OnInit } from '@angular/core';
import { LotService } from '../../services/lot.service';
import { Lot } from '../../models/lot.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-lot-list',
  templateUrl: './lot-list.component.html',
  styleUrls: ['./lot-list.component.css']
})
export class LotListComponent implements OnInit {
  lots: Lot[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;

  constructor(private lotService: LotService) {}

  ngOnInit(): void {
    this.lotService.getLots().subscribe((data) => {
      this.lots = data;
    });
    
    this.lotService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  filterByCategory(): void {
    this.lotService.getLots().subscribe((data) => {
      if (this.selectedCategoryId) {
        this.lots = data.filter(lot => lot.categoryId === this.selectedCategoryId);
      } else {
        this.lots = data;
      }
    });
  }
}
