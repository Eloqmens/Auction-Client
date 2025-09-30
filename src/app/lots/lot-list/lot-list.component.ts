import { Component, OnInit, OnDestroy } from '@angular/core';
import { LotService } from '../../services/lot.service';
import { Lot, LotImage } from '../../models/lot.model';
import { Category } from '../../models/category.model';
import { PagedResult } from '../../models/paged-result.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-lot-list',
  templateUrl: './lot-list.component.html',
  styleUrls: ['./lot-list.component.css']
})
export class LotListComponent implements OnInit, OnDestroy {
  lots: Lot[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  searchTerm: string = '';
  
  // Pagination state
  currentPage: number = 1;
  pageSize: number = 9;
  totalPages: number = 0;
  totalCount: number = 0;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  
  // Debounce handle for search input
  private searchTimeout: any;
  
  // Loading state
  isLoading: boolean = false;

  // Category management state
  newCategoryName: string = '';
  isAddingCategory: boolean = false;
  isDeletingCategory: number | null = null;
  categoryError: string = '';
  categorySuccess: string = '';

  // Lot creation state
  newLot: Lot = this.getEmptyLot();
  lotEndTimeString: string = '';
  isCreatingLot: boolean = false;
  lotError: string = '';
  lotSuccess: string = '';

  constructor(private lotService: LotService,
    public authService: AuthService
  ) {
    // Initialize default end time
    this.lotEndTimeString = this.newLot.endTime.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.loadLots();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadLots(): void {
    this.isLoading = true;
    this.lotService.getLots(
      this.currentPage, 
      this.pageSize, 
      this.selectedCategoryId || undefined,
      this.searchTerm || undefined
    ).subscribe({
        next: (data: PagedResult<Lot>) => {
          this.lots = data.items;
          this.totalPages = data.totalPages;
          this.totalCount = data.totalCount;
          this.hasNextPage = data.hasNextPage;
          this.hasPreviousPage = data.hasPreviousPage;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Ошибка при загрузке лотов:', error);
          alert('Ошибка при загрузке лотов. Попробуйте перезагрузить страницу.');
          this.isLoading = false;
        }
      });
  }

  loadCategories(): void {
    this.lotService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Ошибка при загрузке категорий:', error);
      }
    });
  }

  filterByCategory(): void {
    this.currentPage = 1;
    this.loadLots();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadLots();
  }

  // Переход на страницу из ввода
  goToPageInput(input: string | number): void {
    const page = typeof input === 'string' ? parseInt(input, 10) : input;
    if (isNaN(page as number)) { return; }
    this.goToPage(page as number);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadLots();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Список номеров страниц для пагинации (показываем максимум 5)
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  }

  // Price progress percent within [0, 100]
  getPriceProgress(lot: Lot): number {
    if (lot.startingPrice === 0) return 0;
    
    // Assume 200% of starting price is full progress
    const maxPrice = lot.startingPrice * 2;
    const progress = ((lot.currentPrice - lot.startingPrice) / (maxPrice - lot.startingPrice)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  }

  // Returns true if less than 24h remain
  isEndingSoon(lot: Lot): boolean {
    const now = new Date();
    const endTime = new Date(lot.endTime);
    const timeDiff = endTime.getTime() - now.getTime();
    const hoursRemaining = timeDiff / (1000 * 60 * 60);
    
    return hoursRemaining <= 24 && hoursRemaining > 0;
  }

  // Human-readable remaining time
  getRemainingTime(lot: Lot): string {
    const now = new Date();
    const endTime = new Date(lot.endTime);
    const timeDiff = endTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Завершен';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}д ${hours}ч`;
    } else if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    } else {
      return `${minutes}м`;
    }
  }

  // Debounced search
  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    if (!this.searchTerm.trim()) {
      this.currentPage = 1;
      this.loadLots();
      return;
    }
    
    this.isLoading = true;
    
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadLots();
    }, 500);
  }

  // Reset filters to defaults
  clearFilters(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.currentPage = 1;
    this.loadLots();
  }

  // Whether filters are active
  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.selectedCategoryId !== null;
  }

  // Правильное склонение слова "лот"
  getTotalCountWord(): string {
    const count = this.totalCount;
    if (count % 10 === 1 && count % 100 !== 11) {
      return '';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'а';
    } else {
      return 'ов';
    }
  }



  // Category management
  addCategory(): void {
    if (!this.newCategoryName || this.newCategoryName.trim() === '') {
      this.categoryError = 'Введите название категории';
      return;
    }

    this.clearCategoryMessages();
    this.isAddingCategory = true;

    const category = { id: 0, name: this.newCategoryName.trim() };
    
    this.lotService.createCategory(category).subscribe({
      next: () => {
        this.categorySuccess = 'Категория успешно добавлена!';
        this.newCategoryName = '';
        this.loadCategories();
        this.isAddingCategory = false;
        
        // Auto-hide success message
        setTimeout(() => {
          this.categorySuccess = '';
        }, 3000);
      },
      error: (error) => {
        this.categoryError = this.getCategoryErrorMessage(error);
        this.isAddingCategory = false;
      }
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    this.clearCategoryMessages();
    this.isDeletingCategory = id;

    this.lotService.deleteCategory(id).subscribe({
      next: () => {
        this.categorySuccess = 'Категория успешно удалена!';
        this.loadCategories();
        this.isDeletingCategory = null;
        
        // If deleted category was selected, reset filter
        if (this.selectedCategoryId === id) {
          this.selectedCategoryId = null;
          this.loadLots();
        }
        
        // Auto-hide success message
        setTimeout(() => {
          this.categorySuccess = '';
        }, 3000);
      },
      error: (error) => {
        this.categoryError = this.getCategoryErrorMessage(error);
        this.isDeletingCategory = null;
      }
    });
  }

  private clearCategoryMessages(): void {
    this.categoryError = '';
    this.categorySuccess = '';
  }

  // Formats category API errors
  private getCategoryErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'string') {
      return error.error;
    } else if (error.error && error.error.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'Произошла ошибка при выполнении операции';
    }
  }

  // Lot creation
  private getEmptyLot(): Lot {
    const now = new Date();
    const defaultEndTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      id: 0,
      title: '',
      description: '',
      startingPrice: 0,
      currentPrice: 0,
      endTime: defaultEndTime,
      createdAt: now,
      updatedAt: now,
      categoryId: 0,
      userId: ''
    };
  }

  createLot(): void {
    if (!this.isLotFormValid()) {
      this.lotError = 'Заполните все обязательные поля';
      return;
    }

    this.clearLotMessages();
    this.isCreatingLot = true;

    if (this.lotEndTimeString) {
      this.newLot.endTime = new Date(this.lotEndTimeString);
    }

    this.lotService.createLot(this.newLot).subscribe({
      next: () => {
        this.lotSuccess = 'Лот успешно создан!';
        this.resetLotForm();
        this.loadLots();
        this.isCreatingLot = false;
        
        // Auto-hide success and close modal
        setTimeout(() => {
          this.lotSuccess = '';
          const modal = document.getElementById('createLotModal');
          if (modal) {
            const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
              bootstrapModal.hide();
            }
          }
        }, 2000);
      },
      error: (error) => {
        this.lotError = this.getLotErrorMessage(error);
        this.isCreatingLot = false;
      }
    });
  }

  // Form validation for lot creation
  isLotFormValid(): boolean {
    return !!(
      this.newLot.title?.trim() &&
      this.newLot.description?.trim() &&
      this.newLot.startingPrice > 0 &&
      this.newLot.categoryId > 0 &&
      this.lotEndTimeString &&
      new Date(this.lotEndTimeString) > new Date()
    );
  }

  // Minimal end time (now + 1h)
  getMinEndTime(): string {
    const minTime = new Date();
    minTime.setHours(minTime.getHours() + 1);
    return minTime.toISOString().slice(0, 16);
  }

  // Quick end time presets
  setQuickEndTime(days: number): void {
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + days);
    this.lotEndTimeString = endTime.toISOString().slice(0, 16);
  }

  // Reset lot form to defaults
  resetLotForm(): void {
    this.newLot = this.getEmptyLot();
    this.lotEndTimeString = this.newLot.endTime.toISOString().slice(0, 16);
    this.clearLotMessages();
  }

  // Clear lot messages
  private clearLotMessages(): void {
    this.lotError = '';
    this.lotSuccess = '';
  }

  // Formats lot creation API errors
  private getLotErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'string') {
      return error.error;
    } else if (error.error && error.error.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'Произошла ошибка при создании лота';
    }
  }

  // Delete lot
  deleteLot(id: number): void {
    if (!confirm('Вы уверены, что хотите удалить этот лот?')) {
      return;
    }

    this.lotService.deleteLot(id).subscribe({
      next: () => {
        alert('Лот успешно удален');
        this.loadLots();
      },
      error: (error) => {
        console.error('Ошибка при удалении лота:', error);
        
        let errorMessage = 'Ошибка при удалении лота';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      }
    });
  }

  // Image helpers
  getMainImage(lot: Lot): LotImage | null {
    if (!lot.images || lot.images.length === 0) {
      return null;
    }
    
    const mainImage = lot.images.find(img => img.isMain);
    if (mainImage) {
      return mainImage;
    }
    
    return lot.images[0];
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

    img.style.display = 'none';
    const placeholder = img.parentElement?.querySelector('.lot-image-placeholder');
    if (placeholder) {
      (placeholder as HTMLElement).style.display = 'flex';
    }
  }

  private extractFileNameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch {
      return null;
    }
  }

  getImageCount(lot: Lot): number {
    return lot.images ? lot.images.length : 0;
  }
}
