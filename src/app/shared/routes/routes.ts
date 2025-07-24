import { Routes } from "@angular/router";
import { AuthGuard } from "./../../core/guard/auth.guard";
import { Error404Component } from './../../components/page/error404/error404.component';

export const content: Routes = [
  {
    path: "",
    loadChildren: () => import("../../components/themes/themes.module").then((m) => m.ThemesModule),
    title: 'Home | Fashion With Trends'
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('../../privacy-policy/privacy-policy.module').then((m) => m.PrivacyPolicyModule),
    title: 'Privacy Policy | Fashion With Trends'
  },
  {
    path: 'return-exchange',
    loadChildren: () =>
      import('../../return-exchange/return-exchange.module').then((m) => m.ReturnExchangeModule),
    title: 'Return & Exchange Policy | Fashion With Trends'
  },
  {
    path: 'term-condition',
    loadChildren: () =>
      import('../../term-condition/term-condition.module').then((m) => m.TermConditionModule),
    title: 'Terms & Conditions | Fashion With Trends'
  },
  {
    path: 'Refund-and-Cancellation-Policy',
    loadChildren: () =>
      import('../../refund-and-cancellation-policy/refund-and-cancellation-policy.module').then(
        (m) => m.RefundAndCancellationPolicyModule
      ),
    title: 'Refund & Cancellation Policy | Fashion With Trends'
  },
  {
    path: "shipping-delivery",
    loadChildren: () =>
      import("../../shipping-delevary/shipping-delevary.module").then((m) => m.ShippingDelevaryModule),
    title: 'Shipping & Delivery | Fashion With Trends'
  },
  {
    path: "Contact-Us",
    loadChildren: () =>
      import("../../contact-us/contact-us.module").then((m) => m.ContactUsModule),
    title: 'Contact Us | Fashion With Trends'
  },
  {
    path: "auth",
    loadChildren: () =>
      import("../../components/auth/auth.module").then((m) => m.AuthModule),
    canActivateChild: [AuthGuard],
    title: 'Login / Register | Fashion With Trends'
  },
  {
    path: "account",
    loadChildren: () =>
      import("../../components/account/account.module").then((m) => m.AccountModule),
    canActivate: [AuthGuard],
    title: 'My Account | Fashion With Trends'
  },
  {
    path: "",
    loadChildren: () =>
      import("../../components/shop/shop.module").then((m) => m.ShopModule),
    title: 'Shop | Fashion With Trends'
  },
  {
    path: "",
    loadChildren: () =>
      import("../../components/blog/blog.module").then((m) => m.BlogModule),
    title: 'Blog | Fashion With Trends'
  },
  {
    path: "",
    loadChildren: () =>
      import("../../components/page/page.module").then((m) => m.PagesModule),
    title: 'Pages | Fashion With Trends'
  },
  {
    path: '**',
    pathMatch: 'full',
    component: Error404Component,
    title: '404 - Page Not Found | Fashion With Trends'
  }
];
