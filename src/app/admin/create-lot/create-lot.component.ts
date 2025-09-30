import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { Lot, LotImage } from '../../models/lot.model';
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
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: 0,
    userId: ''
  };

  categories: Category[] = [];
  createdLot: Lot | null = null;

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
    this.lotService.createLot(this.lot).subscribe((createdLot) => {
      this.createdLot = createdLot;
      alert('Lot created successfully! You can now add images.');
    });
  }

  // === МЕТОДЫ ДЛЯ РАБОТЫ С ИЗОБРАЖЕНИЯМИ ===

  onImageUploaded(newImage: LotImage): void {
    if (this.createdLot) {
      if (!this.createdLot.images) {
        this.createdLot.images = [];
      }
      this.createdLot.images.push(newImage);
    }
  }

  onImageDeleted(imageId: number): void {
    if (this.createdLot && this.createdLot.images) {
      this.createdLot.images = this.createdLot.images.filter(img => img.id !== imageId);
    }
  }
}
