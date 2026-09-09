# Mobile Readiness — Design & Architecture

## Overview

The platform provides two Expo (React Native) mobile applications:

| App | Package | Scheme | Audience |
|-----|---------|--------|----------|
| Customer App | `@restaurant/rider-app` | `restaurant://` | End customers |
| Rider App | `@restaurant/rider-app` | `restaurant-rider://` | Delivery riders |

Both apps authenticate against the **same NestJS API** (`@restaurant/api`).

---

## Authentication & Token Storage

### Storage Backend
All tokens are stored using **expo-secure-store**, which maps to:
- **iOS**: Keychain Services (AES-256 at rest)
- **Android**: Android Keystore (hardware-backed where available)

**Never** use `AsyncStorage`, `MMKV`, or `localStorage` for tokens.

### Token Lifecycle

```
Login → POST /api/v1/auth/login
         └─ Returns { access_token, refresh_token, expires_in, token_type }

Store:
  - access_token  → SecureStore("restaurant_access_token")
  - refresh_token → SecureStore("restaurant_refresh_token")
  - tenant_id     → SecureStore("restaurant_tenant_id")

Request:
  - Authorization: Bearer <access_token>
  - X-Tenant-ID:   <tenant_id>

Refresh:
  - On 401, call POST /api/v1/auth/refresh with refresh_token
  - Store new access_token
  - Retry original request

Logout:
  - DELETE /api/v1/auth/logout  (revokes refresh session)
  - SecureStore.deleteItemAsync for all keys
```

### Customer Auth Flows
1. **Email + Password** → `POST /api/v1/auth/login`
2. **Phone OTP** → `POST /api/v1/auth/otp/request` → receive SMS → `POST /api/v1/auth/login/otp`

### Rider Auth Flows
1. **Email + Password** only (riders are pre-enrolled by branch manager)

---

## Deep Links

| Route | URL | Screen |
|-------|-----|--------|
| Order detail | `restaurant://orders/:orderId` | Customer order detail |
| Track delivery | `restaurant://orders/:orderId/track` | Live map tracker |
| Support ticket | `restaurant://support/:ticketId` | Support chat |
| Rider delivery | `restaurant-rider://deliveries/:deliveryId` | Active delivery screen |

### iOS Universal Links
Configure `apple-app-site-association` at `https://yourrestaurant.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.restaurant.customer",
        "paths": ["/orders/*", "/support/*"]
      }
    ]
  }
}
```

### Android App Links
Configure `assetlinks.json` at `https://yourrestaurant.com/.well-known/assetlinks.json`.

---

## Push Notifications

### Setup Flow

```
App starts → Request notification permission
          → Get Expo push token (expo-notifications)
          → POST /api/v1/notifications/push-token { token, platform, device_id }
          → Backend stores token against user/customer record
```

### Server → Client Events

| Event | Payload `data.event` | Triggered by |
|-------|---------------------|--------------|
| Order confirmed | `order.confirmed` | Order confirmed webhook |
| Order ready | `order.ready` | Kitchen marks ready |
| Rider assigned | `order.rider_assigned` | Dispatch assigns rider |
| Order delivered | `order.delivered` | Rider marks delivered |
| New delivery | `delivery.new` | Dispatch (rider app) |
| Support reply | `support.reply` | Staff replies to ticket |

### Backend Implementation Note
Push notifications are dispatched via the `NotificationsModule`. FCM (Firebase Cloud Messaging) is used for Android, APNs (via FCM) for iOS. See `PHASE-19` for the notification module.

---

## Rider Background Location

### Design
- Tracking is **only active** during an active delivery assignment.
- Uses `expo-location` + `expo-task-manager` with `startLocationUpdatesAsync`.
- Location is sent to `PATCH /api/v1/riders/location` every **10 seconds** or **50 meters** (whichever comes first).
- The background task respects `LocationAccuracy.Balanced` to conserve battery.

### iOS
- Requires `NSLocationAlwaysAndWhenInUseUsageDescription` in `Info.plist`.
- `UIBackgroundModes: ["location"]` must be set in `app.json`.
- Shows a **blue status bar** indicator while tracking (via `showsBackgroundLocationIndicator: true`).

### Android
- Requires `ACCESS_BACKGROUND_LOCATION` permission (shown in system permission dialog).
- A **foreground service notification** is shown: "Delivery in progress".

### Opt-Out
- Rider can set availability to `OFFLINE` via the app.
- On OFFLINE: `stopRiderLocationTracking()` is called.
- On logout: background task is unregistered completely.

---

## Offline / Reconnect Behavior

| Scenario | Customer App | Rider App |
|----------|--------------|-----------|
| No internet on launch | Show cached last-seen menu (via local state) | Show offline banner |
| Lost connection mid-order | Queue order confirmation poll for reconnect | Queue location updates in memory (max 10), flush on reconnect |
| WebSocket disconnect | Reconnect with exponential backoff (5s, 10s, 20s, 40s max) | Same |
| Token expired offline | Refresh on next network availability | Same |

> **Implementation**: Offline state management and queue flushing will be implemented in Phase 25 (Production Launch). Phase 24 documents the design contract.

---

## API Client Usage (React Native)

```typescript
import { ApiClient } from "@restaurant/api-client";
import { tokenStorage } from "../lib/auth-storage";
import Constants from "expo-constants";

const api = new ApiClient({
  baseUrl: Constants.expoConfig?.extra?.apiUrl,
  getAccessToken: tokenStorage.getAccessToken,
  getTenantId: tokenStorage.getTenantId,
});

// Login
const tokens = await api.auth.loginWithEmail({ email, password });
await tokenStorage.setAccessToken(tokens.access_token);
await tokenStorage.setRefreshToken(tokens.refresh_token);

// Fetch menu
const menu = await api.catalog.getMenu(branchId);

// Add to cart
const cart = await api.cart.addItem({ product_id, quantity: 1 });

// Place order
const order = await api.orders.placeOrder(cart.id, { payment_method: "CASH" });
```

---

## No Web-Only Backend Dependencies

All features used by the mobile apps are platform-agnostic REST endpoints:
- ✅ Auth: REST + JWT (no cookies, no CSRF)
- ✅ Catalog: REST
- ✅ Cart: REST (guest_token or customer_id based)
- ✅ Orders: REST
- ✅ Real-time: Socket.IO (works on React Native via `socket.io-client`)
- ✅ Notifications: FCM (cross-platform)
- ✅ Location: REST (no server-side web dependency)
- ❌ No `HttpOnly` cookies used for mobile auth flows
- ❌ No browser-specific APIs used in API responses
