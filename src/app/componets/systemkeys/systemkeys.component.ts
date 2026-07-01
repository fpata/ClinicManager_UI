import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemKeyService } from '../../services/systemkey.service';
import { SystemKey } from '../../models/systemkey.model';
import { MessageService } from '../../services/message.service';
import { AppDatePipe } from '../../common/app-date.pipe';

@Component({
  selector: 'app-systemkeys',
  standalone: true,
  imports: [CommonModule, FormsModule, AppDatePipe],
  templateUrl: './systemkeys.component.html',
  styleUrl: './systemkeys.component.css'
})
export class SystemkeysComponent implements OnInit {
  keys: SystemKey[] = [];
  selectedKey: SystemKey | null = null;
  mode: 'view' | 'edit' | 'create' = 'view';
  
  formKeyName = '';
  formKeyValue = '';
  isSaving = false;
  searchTerm = '';

  constructor(
    private systemKeyService: SystemKeyService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadKeys();
  }

  loadKeys(selectId?: number): void {
    this.systemKeyService.getKeys().subscribe({
      next: (data) => {
        this.keys = data;
        if (selectId) {
          const found = this.keys.find(k => k.ID === selectId);
          if (found) {
            this.selectKey(found);
          } else {
            this.autoSelect();
          }
        } else {
          this.autoSelect();
        }
      },
      error: (err) => {
        this.messageService.error('Failed to load system keys.');
      }
    });
  }

  autoSelect(): void {
    if (this.keys.length > 0) {
      // If we already have a selectedKey, keep it selected if it still exists
      const stillExists = this.selectedKey ? this.keys.find(k => k.ID === this.selectedKey?.ID) : null;
      if (stillExists) {
        this.selectKey(stillExists);
      } else {
        this.selectKey(this.keys[0]);
      }
    } else {
      this.selectedKey = null;
      this.mode = 'create';
      this.formKeyName = '';
      this.formKeyValue = '';
    }
  }

  get filteredKeys(): SystemKey[] {
    if (!this.searchTerm.trim()) {
      return this.keys;
    }
    const term = this.searchTerm.toLowerCase();
    return this.keys.filter(k => k.KeyName.toLowerCase().includes(term));
  }

  selectKey(key: SystemKey): void {
    this.selectedKey = key;
    this.mode = 'view';
    this.formKeyName = key.KeyName;
    this.formKeyValue = ''; // keep empty for security (masked on backend anyway)
  }

  addNewKey(): void {
    this.selectedKey = null;
    this.mode = 'create';
    this.formKeyName = '';
    this.formKeyValue = '';
  }

  editKey(): void {
    if (this.selectedKey) {
      this.mode = 'edit';
      this.formKeyName = this.selectedKey.KeyName;
      this.formKeyValue = ''; // Leave blank to keep existing
    }
  }

  cancel(): void {
    if (this.selectedKey) {
      this.selectKey(this.selectedKey);
    } else if (this.keys.length > 0) {
      this.selectKey(this.keys[0]);
    } else {
      this.mode = 'create';
      this.formKeyName = '';
      this.formKeyValue = '';
    }
  }

  saveKey(): void {
    if (!this.formKeyName.trim()) {
      this.messageService.error('Key Name is required.');
      return;
    }
    if (this.mode === 'create' && !this.formKeyValue.trim()) {
      this.messageService.error('Key Value is required.');
      return;
    }

    this.isSaving = true;
    if (this.mode === 'create') {
      this.systemKeyService.createKey({
        KeyName: this.formKeyName.trim(),
        KeyValue: this.formKeyValue.trim()
      }).subscribe({
        next: (newKey) => {
          this.messageService.success('System key created successfully.');
          this.isSaving = false;
          this.loadKeys(newKey.ID);
        },
        error: (err) => {
          this.messageService.error(err.error || 'Failed to create system key.');
          this.isSaving = false;
        }
      });
    } else if (this.mode === 'edit' && this.selectedKey) {
      this.systemKeyService.updateKey(this.selectedKey.ID, {
        KeyName: this.formKeyName.trim(),
        KeyValue: this.formKeyValue.trim() || undefined // Only send if not empty
      }).subscribe({
        next: () => {
          this.messageService.success('System key updated successfully.');
          this.isSaving = false;
          const currentId = this.selectedKey!.ID;
          this.loadKeys(currentId);
        },
        error: (err) => {
          this.messageService.error(err.error || 'Failed to update system key.');
          this.isSaving = false;
        }
      });
    }
  }

  deleteKey(): void {
    if (this.selectedKey && confirm(`Are you sure you want to delete the key "${this.selectedKey.KeyName}"?`)) {
      this.systemKeyService.deleteKey(this.selectedKey.ID).subscribe({
        next: () => {
          this.messageService.success('System key deleted successfully.');
          this.selectedKey = null;
          this.loadKeys();
        },
        error: (err) => {
          this.messageService.error('Failed to delete system key.');
        }
      });
    }
  }
}
