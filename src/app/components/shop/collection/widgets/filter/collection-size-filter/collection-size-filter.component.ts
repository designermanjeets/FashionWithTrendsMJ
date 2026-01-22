import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '../../../../../../shared/interface/core.interface';

@Component({
  selector: 'app-collection-size-filter',
  templateUrl: './collection-size-filter.component.html',
  styleUrls: ['./collection-size-filter.component.scss']
})
export class CollectionSizeFilterComponent implements OnChanges {

  @Input() filter: Params;

  public sizes: string[] = ['S', 'M', 'L', 'XL', 'XXL'];
  public selectedSizes: string[] = [];

  constructor(private route: ActivatedRoute,
    private router: Router) {}

  ngOnChanges() {
    this.selectedSizes = this.filter['size'] ? this.filter['size'].split(',') : [];
  }

  applyFilter(event: Event) {
    const index = this.selectedSizes.indexOf((<HTMLInputElement>event?.target)?.value);

    if ((<HTMLInputElement>event?.target)?.checked)
      this.selectedSizes.push((<HTMLInputElement>event?.target)?.value);
    else
      this.selectedSizes.splice(index, 1);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        size: this.selectedSizes.length ? this.selectedSizes?.join(",") : null,
        page: 1
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

  checked(size: string) {
    return this.selectedSizes?.includes(size);
  }

}