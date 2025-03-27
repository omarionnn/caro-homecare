# Caro - Home Care Management App

A comprehensive mobile application for home care management with robust features for caregivers and agencies.

## Core Features

1. **Electronic Visit Verification (EVV)**
   - GPS-based clock-in/out system
   - Location validation
   - Compliant with EVV mandates

2. **Schedule Management**
   - Real-time schedule viewing
   - Push notifications for updates
   - Shift swapping functionality

3. **Patient Information Management**
   - Secure patient profiles
   - Comprehensive medical information
   - Role-based access controls

4. **Case Broadcasting & Shift Management**
   - Shift marketplace
   - Smart matching algorithms
   - Geographic and skill-based filtering

5. **Visit Documentation**
   - Multi-format data entry (text, images, audio)
   - Structured reporting templates
   - Compliance-ready documentation

6. **Communication Infrastructure**
   - Real-time messaging
   - Read receipts
   - Message categorization

7. **Unscheduled Visit Capabilities**
   - Ad-hoc visit creation
   - Automatic notifications

8. **Multilingual Support**
   - Support for multiple languages
   - Dynamic language switching

9. **Offline Mode**
   - Full offline functionality
   - Background syncing
   - Conflict resolution

10. **Care Insights Tracking**
    - Health assessments
    - Condition monitoring
    - Trend tracking

## Technical Stack

- **Frontend**: React Native
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **Real-time Features**: WebSockets
- **Offline Storage**: Redux Persist
- **Geolocation**: React Native Geolocation API
- **Push Notifications**: Firebase Cloud Messaging

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/caro-homecare.git
```

2. Install dependencies
```
cd caro-homecare
npm install
```

3. Start the Metro bundler
```
npm start
```

4. Run on iOS or Android
```
npm run ios
```
or
```
npm run android
```

## Project Structure

```
src/
   assets/         # Images, fonts, etc.
   components/     # Reusable UI components
   config/         # Configuration files
   constants/      # App constants
   hooks/          # Custom React hooks
   navigation/     # Navigation configuration
   redux/          # Redux state management
   screens/        # App screens
   services/       # API and other services
   utils/          # Utility functions
```

## Compliance & Security

- HIPAA compliant architecture
- End-to-end encryption
- Multi-factor authentication
- Regular security audits

## License

[MIT License](LICENSE)