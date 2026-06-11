import { Component, EventEmitter, Input, Output, signal, computed, effect, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Subject, Subscription, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-typeahead',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './typeahead.html',
  styleUrls: ['./typeahead.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeaheadComponent),
      multi: true
    }
  ]
})
export class TypeaheadComponent<T = any> implements OnDestroy, ControlValueAccessor {

  // UI config
  @Input() placeholder = 'Search...';
  @Input() minLength = 1;
  @Input() limit = 8;
  @Input() debounce = 300;
  @Input() disabled = false;
  @Input() displayWith: (item: T) => string = (i: any) => String(i ?? '');
  // Show dropdown even if there are zero matches (so "No results" / Loading appears)
  @Input() showOnEmpty = true;

  // Local static list mode (optional)
  @Input() items: T[] = [];

  // Remote mode A: simple GET api (e.g. /api/users?query=abc)
  @Input() apiUrl?: string;
  @Input() queryParam = 'q';

  // Remote mode B: custom search function returning Observable<T[]>
  @Input() searchFn?: (term: string) => Observable<T[]>;

  // Emitters
  @Output() selectItem = new EventEmitter<T>();
  @Output() queryChange = new EventEmitter<string>();
  @Output() resultsLoaded = new EventEmitter<T[]>();
  @Output() loadError = new EventEmitter<any>();

  // State
  query = signal('');
  focusedIndex = signal(-1);
  loading = signal(false);
  serverError = signal<string | null>(null);
  private remoteResults = signal<T[]>([]);
  private query$ = new Subject<string>();
  private sub?: Subscription;
  private manualClosed = signal(false);

  // ControlValueAccessor callbacks (initialized as no-ops)
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  //isOpen = computed(() => !this.manualClosed() && this.filtered().length > 0);

  // Decide active result source
  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (q.length < this.minLength) return [];
    const base = this.isRemoteMode() ? this.remoteResults() : this.items;
    const filtered = this.isRemoteMode()
      ? base // server already filtered
      : base.filter(i => this.displayWith(i).toLowerCase().includes(q));
    return filtered.slice(0, this.limit);
  });

  constructor(private http: HttpClient) {
    this.sub = this.query$
      .pipe(
        debounceTime(this.debounce),
        distinctUntilChanged(),
        tap(term => this.queryChange.emit(term)),
        filter(term => term.length >= this.minLength),
        switchMap(term => this.isRemoteMode()
          ? this.invokeRemote(term)
          : of(null))
      )
      .subscribe();
  }

  private isRemoteMode() {
    return !!(this.apiUrl || this.searchFn);
  }

  private invokeRemote(term: string) {
    this.loading.set(true);
    this.serverError.set(null);
    const obs = this.searchFn
      ? this.searchFn(term)
      : this.http.get<T[]>(this.apiUrl!, {
          params: new HttpParams().set(this.queryParam, term)
        });

    return obs.pipe(
      tap(results => {
        this.remoteResults.set(results || []);
        this.resultsLoaded.emit(results || []);
        this.focusedIndex.set(-1);
      }),
      catchError(err => {
        this.remoteResults.set([]);
        this.serverError.set('Load failed');
        this.loadError.emit(err);
        return of([]);
      }),
      tap(() => this.loading.set(false))
    );
  }

  close() { this.manualClosed.set(true); }
  open() { this.manualClosed.set(false); }

  onInput(event$: Event) {
    const value = (event$.target as HTMLInputElement).value;
    this.query.set(value);
    this.focusedIndex.set(-1);
    this.query$.next(value);
    if (!this.isRemoteMode()) {
      // Local mode still emits immediately
      this.queryChange.emit(value);
    }
    this.open();
  }

  onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') this.close();
    if (e.key === 'Enter' && this.focusedIndex() > -1) {
      this.choose(this.filtered()[this.focusedIndex()]);
      this.close();
      e.preventDefault();
    }
  }

  choose(item: T) {
    this.selectItem.emit(item);
    this.query.set(this.displayWith(item));
    this.focusedIndex.set(-1);
    this.onChange(item); // propagate to form
    this.onTouched();    // mark touched
  }

  isOpen() {
    if (this.manualClosed()) return false;
    const hasQuery = this.query().length >= this.minLength;
    if (!hasQuery) return false;
    // Open if we either have results, are loading, have an error, or are allowed to show empty state
    return this.loading() || this.serverError() || this.filtered().length > 0 || this.showOnEmpty;
  }

  trackByIndex(i: number) { return i; }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onItemMouseDown(evt: MouseEvent, item: T) {
    evt.preventDefault();         // avoid losing focus before we process
    this.choose(item);
    this.close();                 // make sure to explicitly close
  }

  // ControlValueAccessor implementation
  writeValue(value: T | null): void {
    if (value == null) {
      this.query.set('');
    } else {
      this.query.set(this.displayWith(value));
    }
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}