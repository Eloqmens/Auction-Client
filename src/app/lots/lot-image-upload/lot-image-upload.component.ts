import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { LotService } from '../../services/lot.service';
import { LotImage } from '../../models/lot.model';

@Component({
  selector: 'app-lot-image-upload',
  templateUrl: './lot-image-upload.component.html',
  styleUrls: ['./lot-image-upload.component.css']
})
export class LotImageUploadComponent implements OnInit {
  @Input() lotId!: number;
  @Input() existingImages: LotImage[] = [];
  @Output() imageUploaded = new EventEmitter<LotImage>();
  @Output() imagesUploaded = new EventEmitter<LotImage[]>();
  @Output() imageDeleted = new EventEmitter<number>();

  selectedFiles: File[] = [];
  isMain: boolean = false;
  isUploading: boolean = false;
  uploadError: string = '';
  uploadSuccess: string = '';

  constructor(private lotService: LotService) {}

  ngOnInit(): void {}

  // Paste-to-upload support
  @HostListener('document:paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (!event.clipboardData) { return; }
    const items = event.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) { files.push(file); }
      }
    }
    if (files.length) {
      this.handleSelectedFiles(files);
    }
  }

  onFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.handleSelectedFiles(files);
  }

  private handleSelectedFiles(files: File[]): void {
    if (files.length === 0) { return; }
    this.selectedFiles = [];
    this.uploadError = '';

    for (const file of files) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = `Неподдерживаемый тип файла: ${file.name}. Разрешены: JPEG, PNG, GIF, WebP`;
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.uploadError = `Размер файла ${file.name} превышает 10MB`;
        return;
      }

      this.selectedFiles.push(file);
    }
  }

  uploadImages(): void {
    if (this.selectedFiles.length === 0 || !this.lotId) {
      this.uploadError = 'Выберите файлы для загрузки';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';

    this.lotService.uploadLotImages(this.lotId, this.selectedFiles, this.isMain).subscribe({
      next: (response) => {
        this.uploadSuccess = `Успешно загружено ${response.imageUrls.length} изображений!`;
        
        // Emit created image metadata to parent
        const newImages: LotImage[] = response.imageUrls.map((url, index) => ({
          id: 0,
          lotId: this.lotId,
          fileName: this.selectedFiles[index].name,
          fileUrl: url,
          contentType: this.selectedFiles[index].type,
          fileSize: this.selectedFiles[index].size,
          isMain: this.isMain && index === 0,
          createdAt: new Date()
        }));
        
        this.imagesUploaded.emit(newImages);
        
        // Reset form
        this.selectedFiles = [];
        this.isMain = false;
        this.isUploading = false;
        
        // Clear input element value
        const fileInput = document.getElementById('imageFiles') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (error) => {
        this.isUploading = false;
        if (error.error && error.error.message) {
          this.uploadError = error.error.message;
        } else {
          this.uploadError = 'Ошибка при загрузке изображений';
        }
      }
    });
  }

  deleteImage(imageId: number): void {
    if (confirm('Вы уверены, что хотите удалить это изображение?')) {
      this.lotService.deleteLotImage(imageId).subscribe({
        next: () => {
          this.imageDeleted.emit(imageId);
          this.uploadSuccess = 'Изображение удалено';
        },
        error: (error) => {
          if (error.error && error.error.message) {
            this.uploadError = error.error.message;
          } else {
            this.uploadError = 'Ошибка при удалении изображения';
          }
        }
      });
    }
  }

  getMainImage(): LotImage | null {
    return this.existingImages.find(img => img.isMain) || null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
