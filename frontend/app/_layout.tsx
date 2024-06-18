import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="screens/Login" options={{ title: "Login" }} />
      <Stack.Screen
        name="screens/Admin/AdminRegister"
        options={{ title: "Admin Register" }}
      />
      <Stack.Screen
        name="screens/Tenant/TenantRegister"
        options={{ title: "Tenant Register" }}
      />
      <Stack.Screen
        name="screens/Admin/AdminDashboard"
        options={{ title: "Admin Dashboard" }}
      />
      <Stack.Screen
        name="screens/Tenant/TenantDashboard"
        options={{ title: "Tenant Dashboard" }}
      />
      <Stack.Screen
        name="screens/Admin/ManageTenants"
        options={{ title: "Manage Tenants" }}
      />
      <Stack.Screen
        name="screens/Admin/ManageLaundries"
        options={{ title: "Manage Laundries" }}
      />
      <Stack.Screen
        name="screens/Admin/BookingDashboard"
        options={{ title: "Booking Dashboard" }}
      />
      {/* <Stack.Screen
        name="screens/Tenant/ViewSlots"
        options={{ title: "View Slots" }}
      /> */}
      <Stack.Screen
        name="screens/Tenant/BookLaundry"
        options={{ title: "Book Laundry" }}
      />
      <Stack.Screen
        name="screens/Tenant/ViewMyBookings"
        options={{ title: "View My Bookings" }}
      />
    </Stack>
  );
}
