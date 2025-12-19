import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '../../../../../../shared/interface/core.interface';

@Component({
  selector: 'app-collection-price-filter',
  templateUrl: './collection-price-filter.component.html',
  styleUrls: ['./collection-price-filter.component.scss']
})
export class CollectionPriceFilterComponent implements OnChanges {

  @Input() filter: Params;

  public minPrice: number = 0;
  public maxPrice: number = 1000;
  public minRange: number = 0;
  public maxRange: number = 1000;

  constructor(private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filter'] && this.filter) {
      this.parsePriceFromFilter();
    }
  }

  parsePriceFromFilter() {
    if (this.filter['price']) {
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
      this.minPrice = this.minRange;
      this.maxPrice = this.maxRange;
    }
  }

  applyFilter() {
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

}
