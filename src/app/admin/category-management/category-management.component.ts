import { Component, OnInit } from '@angular/core';
import { LotService } from '../../services/lot.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  newCategoryName: string = '';

  constructor(private lotService: LotService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.lotService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  addCategory(): void {
    const category: Category = { id: 0, name: this.newCategoryName };
    this.lotService.createCategory(category).subscribe(() => {
      this.loadCategories();
      this.newCategoryName = '';
    });
  }

  deleteCategory(id: number): void {
    this.lotService.deleteCategory(id).subscribe(() => {
      this.loadCategories();
    });
  }
}
