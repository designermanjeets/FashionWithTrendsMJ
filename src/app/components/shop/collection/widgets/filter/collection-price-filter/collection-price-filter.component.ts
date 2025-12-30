import { Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Params } from '../../../../../../shared/interface/core.interface';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collection-price-filter',
  templateUrl: './collection-price-filter.component.html',
  styleUrls: ['./collection-price-filter.component.scss']
})
export class CollectionPriceFilterComponent implements OnInit, OnChanges, OnDestroy {

  @Input() filter: Params;
  @Input() maxPriceRange: number = 15000;
  @Input() isLoading: boolean = false;

  public minPrice: number = 0;
  public maxPrice: number = 15000;
  public minRange: number = 0;
  public maxRange: number = 15000;
  
  private scrollPosition: [number, number] = [0, 0];
  private shouldPreserveScroll: boolean = false;
  private navigationSubscription: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller) {
    
    // Subscribe to navigation events to restore scroll position only when price filter changes
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Restore scroll position only if it was a price filter update
        if (this.shouldPreserveScroll) {
          // Use a small delay to ensure it runs after Angular's default scroll behavior
          setTimeout(() => {
            this.viewportScroller.scrollToPosition(this.scrollPosition);
            this.shouldPreserveScroll = false; // Reset flag
          }, 10);
        }
      });
  }

  ngOnInit() {
    // Initialize with dynamic max range
    this.maxRange = this.maxPriceRange;
    this.minPrice = this.minRange;
    this.maxPrice = this.maxRange;

    // Parse filter if available
    if (this.filter) {
      this.parsePriceFromFilter();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['maxPriceRange']) {
      this.maxRange = this.maxPriceRange;
      this.maxPrice = this.maxRange;
    }

    if (changes['filter'] && this.filter) {
      this.parsePriceFromFilter();
    } else if (changes['filter'] && !this.filter) {
      // Reset to default range when filter is cleared
      this.minPrice = this.minRange;
      this.maxPrice = this.maxRange;
    }
  }

  parsePriceFromFilter() {
    if (this.filter && this.filter['price']) {
      const priceValue = this.filter['price'];
      // Handle multiple price ranges (comma-separated) - take the first one
      const priceRanges = priceValue.split(',');
      const firstRange = priceRanges[0];
      
      // Check if it's a range format (min-max) or single value
      if (firstRange.includes('-')) {
        const [min, max] = firstRange.split('-').map((val: string) => parseFloat(val));
        this.minPrice = !isNaN(min) ? min : this.minRange;
        this.maxPrice = !isNaN(max) ? max : this.maxRange;
      } else {
        // Single value - could be min or max
        const singleValue = parseFloat(firstRange);
        if (!isNaN(singleValue)) {
          // Assume it's a minimum price if it's a single value
          this.minPrice = singleValue;
          this.maxPrice = this.maxRange;
        }
      }
    } else {
      // No filter - use full range
      this.minPrice = this.minRange;
      this.maxPrice = this.maxRange;
    }
    
    // Ensure maxPrice doesn't exceed maxRange
    if (this.maxPrice > this.maxRange) {
      this.maxPrice = this.maxRange;
    }
  }

  applyFilter() {
    // Save current scroll position and set flag to preserve it
    this.scrollPosition = this.viewportScroller.getScrollPosition();
    this.shouldPreserveScroll = true;
    
    // Ensure min is not greater than max
    if (this.minPrice > this.maxPrice) {
      [this.minPrice, this.maxPrice] = [this.maxPrice, this.minPrice];
    }
    
    // Ensure values are within range
    this.minPrice = Math.max(this.minRange, Math.min(this.minPrice, this.maxRange));
    this.maxPrice = Math.max(this.minRange, Math.min(this.maxPrice, this.maxRange));

    const priceValue = `${this.minPrice}-${this.maxPrice}`;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        price: priceValue,
        page: 1
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

  clearFilter() {
    // Save current scroll position and set flag to preserve it
    this.scrollPosition = this.viewportScroller.getScrollPosition();
    this.shouldPreserveScroll = true;
    
    this.maxRange = this.maxPriceRange;
    this.minPrice = this.minRange;
    this.maxPrice = this.maxRange;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        price: null,
        page: 1
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

  onMinPriceChange(value: number) {
    this.minPrice = value;
    if (this.minPrice > this.maxPrice) {
      this.maxPrice = this.minPrice;
    }
  }

  onMaxPriceChange(value: number) {
    this.maxPrice = value;
    if (this.maxPrice < this.minPrice) {
      this.minPrice = this.maxPrice;
    }
  }

  onSliderChange() {
    // Auto-apply when slider changes
    this.applyFilter();
  }

  onKeyPress(event: KeyboardEvent) {
    // Allow numbers, backspace, delete, tab, escape, enter, and decimal point
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const isNumber = /[0-9]/.test(event.key);
    
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  getMinPercentage(): number {
    return ((this.minPrice - this.minRange) / (this.maxRange - this.minRange)) * 100;
  }

  getMaxPercentage(): number {
    return ((this.maxPrice - this.minRange) / (this.maxRange - this.minRange)) * 100;
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

}
