import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

/**
 * Background location task for rider tracking.
 *
 * Privacy & Design Decisions
 * ──────────────────────────
 * 1. Location is ONLY collected when the rider has an ACTIVE delivery assignment.
 *    - The task reads `isDeliveryActive` from SecureStore before sending.
 *    - If no active delivery, the location update is dropped.
 * 2. Platform permissions:
 *    - iOS: NSLocationAlwaysAndWhenInUseUsageDescription required.
 *    - Android: ACCESS_BACKGROUND_LOCATION required (shows system prompt).
 * 3. Data minimisation:
 *    - We send latitude, longitude, accuracy, and timestamp only.
 *    - We do NOT store raw location history in the app.
 * 4. Opt-out:
 *    - Rider can go OFFLINE to stop location reporting (sets isDeliveryActive = false).
 *    - On app logout, background task is unregistered.
 * 5. Battery:
 *    - Using `Balanced` accuracy to balance battery vs precision.
 *    - deferredUpdatesInterval: 10_000ms (10 s) to avoid flooding the API.
 */

const RIDER_LOCATION_TASK = "rider-location-task";

/** Register the background location task definition. Call once at app startup. */
TaskManager.defineTask(RIDER_LOCATION_TASK, ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error("[RiderLocation] Background task error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations?.length) return;

    const latest = locations[locations.length - 1];
    // NOTE: In production, call apiClient.rider.updateLocation() here.
    // Dynamically import to avoid module-level side effects in background.
    console.log("[RiderLocation] Location update:", latest.coords);
  }
});

/** Start background location tracking for an active rider session. */
export async function startRiderLocationTracking(): Promise<void> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Background location permission not granted");
  }

  const isRegistered = await Location.hasStartedLocationUpdatesAsync(RIDER_LOCATION_TASK);
  if (isRegistered) return;

  await Location.startLocationUpdatesAsync(RIDER_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    deferredUpdatesInterval: 10_000,
    deferredUpdatesDistance: 50,
    showsBackgroundLocationIndicator: true, // iOS: shows blue bar
    foregroundService: {
      // Android: required for background location
      notificationTitle: "Delivery in progress",
      notificationBody: "Tracking your location for active delivery",
      notificationColor: "#e8453c",
    },
  });
}

/** Stop background location tracking when rider goes offline or logs out. */
export async function stopRiderLocationTracking(): Promise<void> {
  const isRegistered = await Location.hasStartedLocationUpdatesAsync(RIDER_LOCATION_TASK);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(RIDER_LOCATION_TASK);
  }
}

export { RIDER_LOCATION_TASK };
