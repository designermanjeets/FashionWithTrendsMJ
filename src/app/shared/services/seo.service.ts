import { Injectable, NgZone } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, filter } from 'rxjs';
import { ThemeOptionState } from '../state/theme-option.state';
import { Meta, Title } from '@angular/platform-browser';
import { ProductState } from '../state/product.state';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BlogState } from '../state/blog.state';
import { BrandState } from '../state/brand.state';
import { PageState } from '../state/page.state';
import { CategoryState } from '../state/category.state';
import { SettingState } from '../state/setting.state';
import { Blog } from '../interface/blog.interface';
import { Option } from '../interface/theme-option.interface';
import { Product } from '../interface/product.interface';
import { Brand } from '../interface/brand.interface';
import { Page } from '../interface/page.interface';
import { Category } from '../interface/category.interface';
import { Values } from '../interface/setting.interface';
 
@Injectable({
  providedIn: 'root'
})
export class SeoService {
 
  @Select(ThemeOptionState.themeOptions) themeOption$: Observable<Option>;
  @Select(SettingState.setting) setting$: Observable<Values>;
  @Select(ProductState.selectedProduct) product$: Observable<Product>;
  @Select(BlogState.selectedBlog) blog$: Observable<Blog>;
  @Select(BrandState.selectedBrand) brand$: Observable<Brand>;
  @Select(PageState.selectedPage) page$: Observable<Page>;
  @Select(CategoryState.selectedCategory) category$: Observable<Category>;
 
  public path: string;
  public timeoutId: any;
  private currentMessageIndex = 0;
  private messages: string[];
  private currentMessage: string;
  private delay = 1000; // Delay between messages in milliseconds
  public isTabInFocus = true;
  public product: Product;
  public blog: Blog;
  public page: Page;
  public brand: Brand;
  public category: Category;
  public themeOption: Option;
  public scoContent: any = {};
  public setting: Values;
 
  // Default SEO values
  private readonly DEFAULT_TITLE = "Ultimate Fashion Hub | Men's Fashion | Women's Fashion | Sports Fashion";
  private readonly DEFAULT_DESCRIPTION = "Fashion with Trends serves all your curated-fashion needs including men's fashion, women's fashion, and sportswear categories that match your personality and elevate your everyday look.";
 
  constructor(private meta: Meta, private router: Router,
    private titleService: Title,
    private ngZone: NgZone,) {
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.path = event.url
      this.updateSeo(this.path)
    });
   
    this.fetchData();
  }
 
  fetchData() {
    this.setting$.subscribe((val: Values) => this.setting = val);
    this.product$.subscribe((product: Product) => this.product = product);
    this.blog$.subscribe((blog: Blog) => this.blog = blog);
    this.page$.subscribe((page: Page) => this.page = page);
    this.brand$.subscribe((brand: Brand) => this.brand = brand);
    this.category$.subscribe((category: Category) => this.category = category);
    this.themeOption$.subscribe((option: Option) => {
      this.themeOption = option
    })
  }
 
  updateSeo(path:string){
    if (path.includes('product')) {
      if (this.product) {
        this.scoContent = {
          'url': window.location.href,
          'og_title': this.product.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.product.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.product.product_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        };
      }
      this.customSCO();
    }
    else if(path.includes('blog')) {
      if(this.blog){
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.blog?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.blog?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.blog?.blog_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
        this.customSCO();
      }
    }
    else if(path.includes('page')) {
      if(this.page) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.page?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.page?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.page?.page_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
      }
      this.customSCO();
    } else if(path.includes('brand')) {
      if(this.brand) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.brand?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.brand?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.brand?.brand_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
      }
      this.customSCO();
    } else if(path.includes('category') || path.includes('collections')) {
      if(this.category) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.category?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.category?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.category?.category_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
      }
      this.customSCO();
    }
    else {
      this.updateDefaultSeo();
    }
  }
 
  updateDefaultSeo(){
    const title = this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE;
    const description = this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION;
    const image = this.themeOption?.seo?.og_image?.original_url || '';
    const url = window.location.href;
 
    this.meta.updateTag({ name: 'title', content: title });
    this.meta.updateTag({ name: 'description', content: description });
 
    // Update Facebook Meta Tags
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
 
    // Update Twitter Meta Tags
    this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ property: 'twitter:url', content: url });
    this.meta.updateTag({ property: 'twitter:title', content: title });
    this.meta.updateTag({ property: 'twitter:description', content: description });
    this.meta.updateTag({ property: 'twitter:image', content: image });
 
    if(this.themeOption?.general && this.themeOption?.general?.exit_tagline_enable){
      document.addEventListener('visibilitychange', () => {
        this.messages = this.themeOption.general.taglines;
        this.ngZone.run(() => {
          this.isTabInFocus = !document.hidden;
          if (this.isTabInFocus) {
            clearTimeout(this.timeoutId);
            return this.titleService.setTitle(this.themeOption?.general?.site_title && this.themeOption?.general?.site_tagline
              ? `${this.themeOption?.general?.site_title} | ${this.themeOption?.general?.site_tagline}` : title)
          } else {
            this.updateMessage();
          }
        });
      });
      this.scoContent = {
        ...this.scoContent,
        'url': url,
        'og_title': title,
        'og_description': description,
        'og_image': image,
      }
     
      this.customSCO()
    }else {
      return this.titleService.setTitle(this.themeOption?.general?.site_title && this.themeOption?.general?.site_tagline
        ? `${this.themeOption?.general?.site_title} | ${this.themeOption?.general?.site_tagline}` : title)
    }
  }
 
  customSCO(){
    const title = this.scoContent['og_title'] || this.DEFAULT_TITLE;
    const description = this.scoContent['og_description'] || this.DEFAULT_DESCRIPTION;
    const url = this.scoContent['url'] || window.location.href;
    const image = this.scoContent['og_image'] || '';
 
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'title', content: title });
    this.meta.updateTag({ name: 'description', content: description });
 
    // Update Facebook Meta Tags
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
 
    // Update Twitter Meta Tags
    this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ property: 'twitter:url', content: url });
    this.meta.updateTag({ property: 'twitter:title', content: title });
    this.meta.updateTag({ property: 'twitter:description', content: description });
    this.meta.updateTag({ property: 'twitter:image', content: image });
  }
 
  updateMessage() {
    // Clear the previous timeout
    clearTimeout(this.timeoutId);
 
    // Update the current message
    this.currentMessage = this.messages[this.currentMessageIndex];
    this.titleService.setTitle(this.currentMessage);
    // Increment the message index or reset it to 0 if it reaches the end
    this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
 
    // Set a new timeout to call the function again after the specified delay
    this.timeoutId = setTimeout(() => {
      this.updateMessage();
    }, this.delay);
  }
 
  ngOnDestroy() {
    // Clear the timeout when the component is destroyed
    clearTimeout(this.timeoutId);
  }
 
}
 