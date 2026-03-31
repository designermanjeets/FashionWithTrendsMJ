import { Injectable, NgZone, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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

  // Base URL for canonical tags
  private readonly BASE_URL = 'https://fashionwithtrends.com';

  // Default SEO values
  private readonly DEFAULT_TITLE = "Trendy Men's & Women's Clothing Online | Fashion With Trends";
  private readonly DEFAULT_DESCRIPTION = "Shop trendy men's and women's clothing online at Fashion With Trends. Discover stylish t-shirts, tops, kurtas, co-ord sets and everyday fashion at great prices.";

  constructor(private meta: Meta, private router: Router,
    private titleService: Title,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document) {
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.path = event.url;
      this.updateSeo(this.path);
      this.updateCanonical(this.path);
      this.updateRobotsNoIndex(this.path);
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

  updateSeo(path: string) {
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
    else if (path.includes('blog')) {
      if (this.blog) {
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
    else if (path.includes('page')) {
      if (this.page) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.page?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.page?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.page?.page_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
      }
      this.customSCO();
    } else if (path.includes('brand')) {
      if (this.brand) {
        this.scoContent = {
          ...this.scoContent,
          'url': window.location.href,
          'og_title': this.brand?.meta_title || this.themeOption?.seo?.meta_title || this.DEFAULT_TITLE,
          'og_description': this.brand?.meta_description || this.themeOption?.seo?.meta_description || this.DEFAULT_DESCRIPTION,
          'og_image': this.brand?.brand_meta_image?.original_url || this.themeOption?.seo?.og_image?.original_url,
        }
      }
      this.customSCO();
    } else if (path.includes('category') || path.includes('collections')) {
      if (this.category) {
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

  updateDefaultSeo() {
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

    if (this.themeOption?.general && this.themeOption?.general?.exit_tagline_enable) {
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
    } else {
      return this.titleService.setTitle(this.themeOption?.general?.site_title && this.themeOption?.general?.site_tagline
        ? `${this.themeOption?.general?.site_title} | ${this.themeOption?.general?.site_tagline}` : title)
    }
  }

  customSCO() {
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

  /**
   * Dynamically sets the <link rel="canonical"> tag in <head>.
   * - For collection pages: strips `sortBy` param, keeps `category`
   * - For product pages: uses the clean product URL
   * - For all other pages: uses the clean path without query params
   */
  private updateCanonical(path: string): void {
    let canonicalUrl: string;

    try {
      // Parse the path to separate route from query params
      const [routePath, queryString] = path.split('?');

      if (routePath.startsWith('/collections') && queryString) {
        // For collection pages: keep only 'category' param, strip 'sortBy' etc.
        const params = new URLSearchParams(queryString);
        const category = params.get('category');
        if (category) {
          canonicalUrl = `${this.BASE_URL}/collections?category=${category}`;
        } else {
          canonicalUrl = `${this.BASE_URL}/collections`;
        }
      } else {
        // For all other pages: use clean path without query params
        canonicalUrl = `${this.BASE_URL}${routePath}`;
      }
    } catch {
      canonicalUrl = `${this.BASE_URL}${path.split('?')[0]}`;
    }

    // Find or create the canonical link element
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  }

  /**
   * Adds `noindex, nofollow` meta for pages we don't want indexed.
   * Removes it on all other pages.
   */
  private updateRobotsNoIndex(path: string): void {
    const cleanedPath = (path || '').split('?')[0];

    // Auth pages (already present)
    const authNoIndexPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];

    // Account pages (user-specific / can redirect depending on auth state)
    const accountNoIndexPrefixes = ['/account'];

    // Specific product URLs flagged for noindex/nofollow (typically redirects / changed / deleted)
    const productNoIndexPaths = [
      '/product/rosepetal-girl-dress',
      '/product/orange-sports-sunglasses',
      '/product/classicsilk-men-s-tie',
      '/product/vegan-leather-watchbox',
      '/product/power-plump-lipstick',
      '/product/rugged-genuine-leather-wallet',
      '/product/lime-green-genuine-leather-bag',
    ];

    const errorNoIndexPaths = ['/404'];

    const shouldNoIndex =
      authNoIndexPaths.some(p => cleanedPath.startsWith(p)) ||
      accountNoIndexPrefixes.some(p => cleanedPath === p || cleanedPath.startsWith(`${p}/`)) ||
      productNoIndexPaths.includes(cleanedPath) ||
      errorNoIndexPaths.includes(cleanedPath);

    if (shouldNoIndex) {
      // Add or update noindex meta
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      // Remove noindex meta if it exists
      this.meta.removeTag('name="robots"');
    }
  }

}
