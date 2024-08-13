import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { Lot } from '../../models/lot.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-lot-details',
  templateUrl: './lot-details.component.html',
  styleUrls: ['./lot-details.component.css']
})
export class LotDetailsComponent implements OnInit {
  lot: Lot | null = null;
  bidAmount: number = 0;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private lotService: LotService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.lotService.getLotById(id).subscribe((lot) => {
      this.lot = lot;
    });
  }

  placeBid(): void {
    if (!this.lot) return;

    if (this.bidAmount <= this.lot.currentPrice) {
      this.errorMessage = 'Bid amount must be higher than the current price.';
      return;
    }

    // TODO: Implement bid placing logic here using a service
    this.errorMessage = '';
    // Temporary mock logic:
    this.lot.currentPrice = this.bidAmount;
    alert('Bid placed successfully!');
  }
}
