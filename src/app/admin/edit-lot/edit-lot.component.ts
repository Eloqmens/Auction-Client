import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { Lot } from '../../models/lot.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-edit-lot',
  templateUrl: './edit-lot.component.html',
  styleUrls: ['./edit-lot.component.css']
})
export class EditLotComponent implements OnInit {
  lot: Lot | null = null;
  categories: Category[] = [];

  constructor(
    private route: ActivatedRoute,
    private lotService: LotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.lotService.getLotById(id).subscribe((lot) => {
      this.lot = lot;
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.lotService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  updateLot(): void {
    if (this.lot) {
      this.lotService.updateLot(this.lot).subscribe(() => {
        alert('Lot updated successfully!');
        this.router.navigate(['/admin']);
      });
    }
  }
}
