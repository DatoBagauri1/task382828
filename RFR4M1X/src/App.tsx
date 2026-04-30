import { Route, Routes } from 'react-router-dom';

import { AdminCategoriesPage } from '@/admin/admin-categories-page';
import { AdminDashboardPage } from '@/admin/admin-dashboard-page';
import { AdminOrdersPage } from '@/admin/admin-orders-page';
import { AdminProductsPage } from '@/admin/admin-products-page';
import { AdminRoute, ProtectedRoute } from '@/components/common/protected-route';
import { AdminLayout } from '@/layouts/admin-layout';
import { RootLayout } from '@/layouts/root-layout';
import { AuthPage } from '@/pages/auth-page';
import { CartPage } from '@/pages/cart-page';
import { CheckoutPage } from '@/pages/checkout-page';
import { HomePage } from '@/pages/home-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { OrderConfirmationPage } from '@/pages/order-confirmation-page';
import { ProductPage } from '@/pages/product-page';
import { ProfilePage } from '@/pages/profile-page';
import { ShopPage } from '@/pages/shop-page';
import { WishlistPage } from '@/pages/wishlist-page';

const App = () => (
  <Routes>
    <Route element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="shop" element={<ShopPage />} />
      <Route path="product/:slug" element={<ProductPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="auth" element={<AuthPage />} />
      <Route path="wishlist" element={<WishlistPage />} />
      <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
