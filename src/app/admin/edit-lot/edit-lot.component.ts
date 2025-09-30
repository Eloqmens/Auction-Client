import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { Lot, LotImage } from '../../models/lot.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-edit-lot',
  templateUrl: './edit-lot.component.html',
  styleUrls: ['./edit-lot.component.css']
})
export class EditLotComponent implements OnInit {
  lot: Lot | null = null;
  categories: Category[] = [];
  endTimeString: string = '';
  isLoading: boolean = true;
  isUpdating: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private lotService: LotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadLot(id);
    this.loadCategories();
  }

  loadLot(id: number): void {
    this.lotService.getLotById(id).subscribe({
      next: (lot) => {
        this.lot = lot;
        // Конвертируем время для input datetime-local
        this.endTimeString = new Date(lot.endTime).toISOString().slice(0, 16);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка при загрузке лота:', error);
        this.errorMessage = 'Не удалось загрузить информацию о лоте';
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

  updateLot(): void {
    if (!this.lot) return;

    this.clearMessages();
    this.isUpdating = true;

    // Обновляем время окончания из строки
    if (this.endTimeString) {
      this.lot.endTime = new Date(this.endTimeString);
    }

    this.lotService.updateLot(this.lot).subscribe({
      next: () => {
        this.successMessage = 'Лот успешно обновлен!';
        this.isUpdating = false;
        
        // Показать сообщение об успехе и перенаправить
        setTimeout(() => {
          this.router.navigate(['/lots', this.lot!.id]);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isUpdating = false;
      }
    });
  }

  // Получить минимальное время окончания (через час)
  getMinEndTime(): string {
    const minTime = new Date();
    minTime.setHours(minTime.getHours() + 1);
    return minTime.toISOString().slice(0, 16);
  }

  // Продлить время окончания
  extendEndTime(days: number): void {
    if (!this.lot) return;
    
    const currentEndTime = new Date(this.endTimeString);
    currentEndTime.setDate(currentEndTime.getDate() + days);
    this.endTimeString = currentEndTime.toISOString().slice(0, 16);
  }

  // Очистить сообщения
  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Получить текст ошибки
  private getErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'string') {
      return error.error;
    } else if (error.error && error.error.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else {
      return 'Произошла ошибка при обновлении лота';
    }
  }

  // === МЕТОДЫ ДЛЯ РАБОТЫ С ИЗОБРАЖЕНИЯМИ ===

  onImageUploaded(newImage: LotImage): void {
    if (this.lot) {
      if (!this.lot.images) {
        this.lot.images = [];
      }
      this.lot.images.push(newImage);
      this.successMessage = 'Изображение успешно загружено!';
      this.errorMessage = '';
    }
  }

  onImageDeleted(imageId: number): void {
    if (this.lot && this.lot.images) {
      this.lot.images = this.lot.images.filter(img => img.id !== imageId);
      this.successMessage = 'Изображение удалено!';
      this.errorMessage = '';
    }
  }
}
