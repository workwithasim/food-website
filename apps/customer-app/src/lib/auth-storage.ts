import * as SecureStore from "expo-secure-store";
import { ApiClient } from "@restaurant/api-client";
import Constants from "expo-constants";

const ACCESS_TOKEN_KEY = "restaurant_access_token";
const REFRESH_TOKEN_KEY = "restaurant_refresh_token";
const TENANT_ID_KEY = "restaurant_tenant_id";

/**
 * Secure token storage using expo-secure-store.
 *
 * Security decisions:
 * - Tokens stored in the system Keychain (iOS) / Android Keystore.
 * - Never stored in AsyncStorage, MMKV, or plain SharedPreferences.
 * - Access token has short TTL (15 min); refresh token has longer TTL (30 days).
 * - Token refresh happens transparently via `getAccessToken`.
 */
export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  getTenantId: () => SecureStore.getItem(TENANT_ID_KEY),
  setTenantId: (id: string) => SecureStore.setItemAsync(TENANT_ID_KEY, id),
  clearAll: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(TENANT_ID_KEY);
  },
};

/**
 * Singleton API client for the customer app.
 * Reads stored tenant and token on every request.
 */
export const apiClient = new ApiClient({
  baseUrl: Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:4000",
  getAccessToken: tokenStorage.getAccessToken,
  getTenantId: tokenStorage.getTenantId,
});
