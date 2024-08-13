import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { Lot } from '../../models/lot.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-create-lot',
  templateUrl: './create-lot.component.html',
  styleUrls: ['./create-lot.component.css']
})
export class CreateLotComponent implements OnInit {
  lot: Lot = {
    id: 0,
    title: '',
    description: '',
    startingPrice: 0,
    currentPrice: 0,
    endTime: new Date(),
    categoryId: 0,
    userId: ''
  };

  categories: Category[] = [];

  constructor(private lotService: LotService, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.lotService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  createLot(): void {
    this.lotService.createLot(this.lot).subscribe(() => {
      alert('Lot created successfully!');
      this.router.navigate(['/admin']);
    });
  }
}
