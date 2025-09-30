import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { BidService } from '../../services/bid.service';
import { Lot, LotImage } from '../../models/lot.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-lot-details',
  templateUrl: './lot-details.component.html',
  styleUrls: ['./lot-details.component.css']
})
export class LotDetailsComponent implements OnInit, OnDestroy {
  lot: Lot | null = null;
  bidAmount: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isPlacingBid: boolean = false;
  selectedImage: LotImage | null = null;
  
  // Periodic timer to refresh time-dependent UI
  private timeUpdateInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lotService: LotService,
    public authService: AuthService,
    public bidService: BidService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.lotService.getLotById(id).subscribe({
      next: (lot) => {
        this.lot = lot;
        this.bidAmount = this.getMinimumBid();
        this.startTimeUpdates();
      },
      error: (error) => {
        console.error('Ошибка при загрузке лота:', error);
        this.router.navigate(['/lots']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  startTimeUpdates(): void {
    // Refresh remaining time every minute
    this.timeUpdateInterval = setInterval(() => {
      // Intentionally empty; Angular change detection will pick up calculated getters
    }, 60000);
  }

  placeBid(): void {
    if (!this.lot || this.isPlacingBid) return;

    this.clearMessages();

    if (this.bidAmount < this.getMinimumBid()) {
      this.errorMessage = `Ставка должна быть не менее ${this.getMinimumBid()} ₽`;
      return;
    }

    if (this.isAuctionEnded()) {
      this.errorMessage = 'Аукцион уже завершен';
      return;
    }

    this.isPlacingBid = true;

    this.bidService.placeBid(this.lot.id, this.bidAmount).subscribe({
      next: () => {
        this.successMessage = 'Ставка успешно размещена!';
        this.lot!.currentPrice = this.bidAmount;
        this.bidAmount = this.getMinimumBid();
        this.isPlacingBid = false;
        
        // Auto-hide success message
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err);
        this.isPlacingBid = false;
      }
    });
  }

  deleteLot(): void {
    if (!this.lot) return;
    
    if (confirm('Вы уверены, что хотите удалить этот лот?')) {
      this.lotService.deleteLot(this.lot.id).subscribe({
        next: () => {
          alert('Лот успешно удален');
          this.router.navigate(['/lots']);
        },
        error: (err) => {
          console.error('Ошибка при удалении лота:', err);
          alert('Ошибка при удалении лота');
        }
      });
    }
  }

  // Business rule: minimal bid step is max(1000, 5% of current price)
  getMinimumBid(): number {
    if (!this.lot) return 0;
    const increment = Math.max(1000, this.lot.currentPrice * 0.05);
    return Math.ceil((this.lot.currentPrice + increment) / 100) * 100; // round to hundreds
  }

  // Quick bid presets based on the computed increment
  getQuickBidAmounts(): number[] {
    if (!this.lot) return [];
    const baseIncrement = Math.max(1000, this.lot.currentPrice * 0.05);
    return [
      Math.ceil(baseIncrement / 100) * 100,
      Math.ceil(baseIncrement * 2 / 100) * 100,
      Math.ceil(baseIncrement * 5 / 100) * 100
    ];
  }

  // Ensures bidAmount respects the minimal bid step
  setBidAmount(increment: number): void {
    const minBid = this.getMinimumBid();
    this.bidAmount = Math.max(minBid, Number((this.lot?.currentPrice || 0) + increment));
  }

  // Auction state helpers
  isAuctionEnded(): boolean {
    if (!this.lot) return true;
    return new Date() > new Date(this.lot.endTime);
  }

  isEndingSoon(): boolean {
    if (!this.lot) return false;
    const now = new Date();
    const endTime = new Date(this.lot.endTime);
    const timeDiff = endTime.getTime() - now.getTime();
    const hoursRemaining = timeDiff / (1000 * 60 * 60);
    
    return hoursRemaining <= 24 && hoursRemaining > 0;
  }

  // Human-readable remaining time
  getRemainingTime(): string {
    if (!this.lot) return '';
    
    const now = new Date();
    const endTime = new Date(this.lot.endTime);
    const timeDiff = endTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Завершен';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} дн. ${hours} ч.`;
    } else if (hours > 0) {
      return `${hours} ч. ${minutes} мин.`;
    } else {
      return `${minutes} мин.`;
    }
  }

  // CSS class for remaining time state
  getTimeRemainingClass(): string {
    if (!this.lot) return '';
    
    if (this.isAuctionEnded()) {
      return 'text-danger fw-bold';
    } else if (this.isEndingSoon()) {
      return 'text-warning fw-bold';
    } else {
      return 'text-success';
    }
  }

  // Localized auction status
  getAuctionStatus(): string {
    if (!this.lot) return '';
    
    if (this.isAuctionEnded()) {
      return 'Завершен';
    } else if (this.isEndingSoon()) {
      return 'Скоро завершится';
    } else {
      return 'Активный';
    }
  }

  // CSS class for status badge
  getStatusBadgeClass(): string {
    if (!this.lot) return 'bg-secondary';
    
    if (this.isAuctionEnded()) {
      return 'bg-danger';
    } else if (this.isEndingSoon()) {
      return 'bg-warning';
    } else {
      return 'bg-success';
    }
  }

  // Icon class for status badge
  getStatusIcon(): string {
    if (!this.lot) return 'fa-clock';
    
    if (this.isAuctionEnded()) {
      return 'fa-flag-checkered me-1';
    } else if (this.isEndingSoon()) {
      return 'fa-exclamation-triangle me-1';
    } else {
      return 'fa-play me-1';
    }
  }

  // Price growth in percent vs. startingPrice
  getPriceGrowth(): number {
    if (!this.lot || this.lot.startingPrice === 0) return 0;
    return Math.round(((this.lot.currentPrice - this.lot.startingPrice) / this.lot.startingPrice) * 100);
  }

  // Progress bar value where 3x startingPrice ~ 100%
  getPriceProgress(): number {
    if (!this.lot || this.lot.startingPrice === 0) return 0;
    
    const maxPrice = this.lot.startingPrice * 3;
    const progress = ((this.lot.currentPrice - this.lot.startingPrice) / (maxPrice - this.lot.startingPrice)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  }

  // UI message helpers
  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Maps backend/HTTP error to user-friendly text
  private getErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'string') {
      return error.error;
    } else if (error.error && error.error.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'Произошла ошибка при размещении ставки';
    }
  }

  // Image helpers
  openImageModal(image: LotImage): void {
    this.selectedImage = image;
    const modalElement = document.getElementById('imageModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onImageError(event: any): void {
    const img: HTMLImageElement = event.target;
    const retryCount = Number(img.getAttribute('data-retry') || '0');

    if (retryCount < 2) {
      img.setAttribute('data-retry', String(retryCount + 1));
      const url = new URL(img.src);
      url.searchParams.set('cb', Date.now().toString());
      img.src = url.toString();
      return;
    }

    this.showImagePlaceholder(img);
  }

  // Mark selected image as main for the lot
  setMainImage(imageId: number): void {
    if (!this.lot) { return; }
    this.lotService.setMainImage(this.lot.id, imageId).subscribe({
      next: () => {
        if (!this.lot) { return; }
        const images = Array.isArray(this.lot.images) ? this.lot.images : [];
        this.lot.images = images.map(img => ({ ...img, isMain: img.id === imageId }));
        this.selectedImage = this.lot.images.find(img => img.id === imageId) || this.selectedImage;
      },
      error: () => {
        this.errorMessage = 'Не удалось установить главное изображение';
        setTimeout(() => { this.errorMessage = ''; }, 3000);
      }
    });
  }

  private showImagePlaceholder(img: HTMLImageElement): void {
    img.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder d-flex align-items-center justify-content-center bg-light rounded';
    placeholder.style.minHeight = '200px';
    placeholder.innerHTML = '<i class="fas fa-image text-muted" style="font-size: 3rem;"></i>';
    
    img.parentNode?.insertBefore(placeholder, img);
  }

  private extractFileNameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch {
      return null;
    }
  }
}
