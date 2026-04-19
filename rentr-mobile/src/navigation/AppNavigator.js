// ============================================
// AppNavigator.js
// ============================================
// This is the ROOT navigator of the entire app.
//
// HOW REACT NAVIGATION WORKS (beginner explanation):
// ─────────────────────────────────────────────────
// Think of navigation like a stack of cards on a table:
//
//  • Stack Navigator  → push screens on top of each other. Back button pops.
//  • Bottom Tab Navigator → shows a tab bar at the bottom. Tap to switch.
//  • Nested navigators → a tab can CONTAIN its own stack (so you can push
//    a detail screen from within a tab without hiding the tab bar).
//
// Our structure:
//
//   AppNavigator (Stack)
//   ├── AuthStack     (Stack) — shown when user is NOT logged in
//   │   ├── Splash
//   │   ├── Welcome
//   │   ├── Login
//   │   ├── Register
//   │   ├── RolePicker
//   │   ├── ForgotPassword
//   │   └── ResetPassword
//   └── MainTabs      (Bottom Tabs) — shown when user IS logged in
//       ├── HomeStack (Stack)
//       │   ├── MapHome
//       │   ├── CategoryPicker
//       │   └── SearchFilters
//       ├── BrowseStack (Stack)
//       │   ├── BrowseFeed
//       │   ├── ItemDetail
//       │   ├── AvailabilityCalendar
//       │   ├── BookingRequest
//       │   ├── Checkout
//       │   └── BookingConfirmation
//       ├── BookingsStack (Stack)
//       │   ├── MyBookings
//       │   ├── IncomingRequests
//       │   ├── BookingDetail
//       │   ├── PickupPhotos
//       │   ├── ReturnConfirmation
//       │   ├── Chat
//       │   └── ReviewSubmit
//       ├── ChatStack (Stack — direct messages list)
//       └── ProfileStack (Stack)
//           ├── ProfileHome
//           ├── EditProfile
//           ├── MyListings
//           ├── AddListing
//           ├── Earnings
//           ├── StripeConnect
//           ├── SavedItems
//           ├── Notifications
//           ├── Settings
//           └── RaiseDispute
// ============================================

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { Ionicons }                   from '@expo/vector-icons';
import { colors }                     from '../theme/theme';

// ── Auth screens ──────────────────────────────────────────────────────────────
import SplashScreen          from '../screens/auth/SplashScreen';
import WelcomeScreen         from '../screens/auth/WelcomeScreen';
import LoginScreen           from '../screens/auth/LoginScreen';
import RegisterScreen        from '../screens/auth/RegisterScreen';
import RolePickerScreen      from '../screens/auth/RolePickerScreen';
import ForgotPasswordScreen  from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen   from '../screens/auth/ResetPasswordScreen';

// ── Home / Map screens ────────────────────────────────────────────────────────
import MapHomeScreen         from '../screens/home/MapHomeScreen';
import CategoryPickerScreen  from '../screens/home/CategoryPickerScreen';
import SearchFiltersScreen   from '../screens/home/SearchFiltersScreen';

// ── Browse screens ────────────────────────────────────────────────────────────
import BrowseFeedScreen           from '../screens/browse/BrowseFeedScreen';
import ItemDetailScreen           from '../screens/browse/ItemDetailScreen';
import AvailabilityCalendarScreen from '../screens/browse/AvailabilityCalendarScreen';
import BookingRequestScreen       from '../screens/browse/BookingRequestScreen';
import CheckoutScreen             from '../screens/browse/CheckoutScreen';
import BookingConfirmationScreen  from '../screens/browse/BookingConfirmationScreen';

// ── Bookings screens ──────────────────────────────────────────────────────────
import MyBookingsScreen        from '../screens/bookings/MyBookingsScreen';
import IncomingRequestsScreen  from '../screens/bookings/IncomingRequestsScreen';
import BookingDetailScreen     from '../screens/bookings/BookingDetailScreen';
import PickupPhotosScreen      from '../screens/bookings/PickupPhotosScreen';
import ReturnConfirmationScreen from '../screens/bookings/ReturnConfirmationScreen';
import ChatScreen              from '../screens/bookings/ChatScreen';
import ReviewSubmitScreen      from '../screens/bookings/ReviewSubmitScreen';

// ── Profile screens ───────────────────────────────────────────────────────────
import ProfileHomeScreen     from '../screens/profile/ProfileHomeScreen';
import EditProfileScreen     from '../screens/profile/EditProfileScreen';
import MyListingsScreen      from '../screens/profile/MyListingsScreen';
import AddListingScreen      from '../screens/profile/AddListingScreen';
import EarningsScreen        from '../screens/profile/EarningsScreen';
import StripeConnectScreen   from '../screens/profile/StripeConnectScreen';
import SavedItemsScreen      from '../screens/profile/SavedItemsScreen';
import NotificationsScreen   from '../screens/profile/NotificationsScreen';
import SettingsScreen        from '../screens/profile/SettingsScreen';
import RaiseDisputeScreen    from '../screens/profile/RaiseDisputeScreen';
import MapPickerScreen       from '../screens/profile/MapPickerScreen';
import ListingDetailScreen   from '../screens/profile/ListingDetailScreen';
import EditListingScreen     from '../screens/profile/EditListingScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Create navigator instances
// Each navigator type is created with its factory function.
// ─────────────────────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Auth Stack ────────────────────────────────────────────────────────────────
// We pass onLoginSuccess via screenOptions initialParams so Login + RolePicker
// can call it to switch to the MainTabs.
function AuthStack({ onLoginSuccess }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"         component={SplashScreen} />
      <Stack.Screen name="Welcome"        component={WelcomeScreen} />
      <Stack.Screen name="Login"
        children={(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="RolePicker"
        children={(props) => <RolePickerScreen {...props} onLoginSuccess={onLoginSuccess} />}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

// ── Home Stack (Map tab) ──────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapHome"        component={MapHomeScreen} />
      <Stack.Screen name="CategoryPicker" component={CategoryPickerScreen} />
      <Stack.Screen name="SearchFilters"  component={SearchFiltersScreen} />
    </Stack.Navigator>
  );
}

// ── Browse Stack ──────────────────────────────────────────────────────────────
function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseFeed"           component={BrowseFeedScreen} />
      <Stack.Screen name="ItemDetail"           component={ItemDetailScreen} />
      <Stack.Screen name="AvailabilityCalendar" component={AvailabilityCalendarScreen} />
      <Stack.Screen name="BookingRequest"       component={BookingRequestScreen} />
      <Stack.Screen name="Checkout"             component={CheckoutScreen} />
      <Stack.Screen name="BookingConfirmation"  component={BookingConfirmationScreen} />
    </Stack.Navigator>
  );
}

// ── Bookings Stack ────────────────────────────────────────────────────────────
function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyBookings"         component={MyBookingsScreen} />
      <Stack.Screen name="IncomingRequests"   component={IncomingRequestsScreen} />
      <Stack.Screen name="BookingDetail"      component={BookingDetailScreen} />
      <Stack.Screen name="PickupPhotos"       component={PickupPhotosScreen} />
      <Stack.Screen name="ReturnConfirmation" component={ReturnConfirmationScreen} />
      <Stack.Screen name="Chat"               component={ChatScreen} />
      <Stack.Screen name="ReviewSubmit"       component={ReviewSubmitScreen} />
    </Stack.Navigator>
  );
}

// ── Profile Stack ─────────────────────────────────────────────────────────────
function ProfileStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome">
        {(props) => <ProfileHomeScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="EditProfile"   component={EditProfileScreen} />
      <Stack.Screen name="MyListings"    component={MyListingsScreen} />
      <Stack.Screen name="AddListing"    component={AddListingScreen} />
      <Stack.Screen name="Earnings"      component={EarningsScreen} />
      <Stack.Screen name="StripeConnect" component={StripeConnectScreen} />
      <Stack.Screen name="SavedItems"    component={SavedItemsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings"      component={SettingsScreen} />
      <Stack.Screen name="RaiseDispute"  component={RaiseDisputeScreen} />
      <Stack.Screen name="MapPicker"       component={MapPickerScreen} />
      <Stack.Screen name="ListingDetail"  component={ListingDetailScreen} />
      <Stack.Screen name="EditListing"    component={EditListingScreen} />
    </Stack.Navigator>
  );
}

// ── Bottom Tab Navigator ──────────────────────────────────────────────────────
function MainTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        // Dynamic icon based on route name + focused state
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home:     focused ? 'location'          : 'location-outline',
            Browse:   focused ? 'grid'              : 'grid-outline',
            Bookings: focused ? 'calendar'          : 'calendar-outline',
            Chat:     focused ? 'chatbubbles'       : 'chatbubbles-outline',
            Profile:  focused ? 'person-circle'     : 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeStack} />
      <Tab.Screen name="Browse"   component={BrowseStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileStack {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
// This is what App.js renders.
// It decides whether to show AuthStack or MainTabs based on isLoggedIn.
export default function AppNavigator({ isLoggedIn, onLoginSuccess, onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main">
          {(props) => <MainTabs {...props} onLogout={onLogout} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Auth">
          {(props) => <AuthStack {...props} onLoginSuccess={onLoginSuccess} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
