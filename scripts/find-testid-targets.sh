#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

print_matches() {
  local label="$1"
  local pattern="$2"

  printf '\n  %s\n' "$label"
  if ! rg -n --no-heading -S "$pattern" src; then
    printf '  (no matches)\n'
  fi
}

printf 'smoke.spec.ts\n'
print_matches 'product card' 'ProductCard|product-card'
print_matches 'category link' 'category-link|categories\.map|categorySlug'
print_matches 'product price' 'product-price|formatPrice\(product\.price\)'
print_matches 'add to cart' 'add-to-cart|addToCart|handleAdd'
print_matches 'package card' 'PackageCard|package-card'
print_matches 'package price' 'package-price|formatPrice\(pkg\.basePrice\)'
print_matches 'package item' 'package-item|pkg\.items|defaultQty'

printf '\ncart-checkout.spec.ts\n'
print_matches 'cart count' 'cart-count|totalItemCount'
print_matches 'cart total' 'cart-total|totalAmount'
print_matches 'quantity increase' 'qty-increase|updateQuantity\(item\.cartItemId, item\.quantity \+ 1\)'
print_matches 'checkout fields' 'customer-name|customer-phone|customer-address|customerName|customerPhone|customerAddress'
print_matches 'place order' 'place-order|handleSubmit'
print_matches 'checkout error' 'checkout-error|errorMsg'
print_matches 'order confirmation' 'order-confirmation|OrderConfirmation'
print_matches 'public order id' 'public-order-id|displayOrderId|publicOrderId'

printf '\nadmin.spec.ts\n'
print_matches 'admin login fields' 'admin-phone|admin-password|identifier|password'
print_matches 'admin login submit' 'admin-login-submit|handleLogin'
print_matches 'order row' 'order-row|orders\.map'
print_matches 'order status select' 'order-status-select|newStatus|<select'
print_matches 'order status badge' 'order-status-badge|STATUS_COLORS|o\.status'