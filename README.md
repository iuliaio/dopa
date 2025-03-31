# Dopa - React Native Mobile App

Dopa is a modern mobile application built with React Native, featuring a clean architecture and robust development setup. This project uses Expo for development and testing, with native iOS and Android builds available.

## Project Structure

```
dopa/
├── frontend/           # React Native application (this is what you'll be working with)
│   ├── app/           # Main application code
│   ├── components/    # Reusable UI components
│   ├── screens/       # Screen components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript type definitions
│   ├── assets/        # Images, fonts, and other static assets
│   ├── config/        # Configuration files
│   ├── ios/          # iOS native code
│   └── android/      # Android native code
└── backend/          # Backend server code (deployed on GCP - can be ignored for local development)
```

## Prerequisites

Before you begin, ensure you have the following installed:

1. [Node.js](https://nodejs.org/) (v14 or later)
2. [Xcode](https://developer.apple.com/xcode/) (for iOS development)
3. [CocoaPods](https://cocoapods.org/) (for iOS dependencies)
4. [Git](https://git-scm.com/)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/iuliaio/dopa.git
   cd dopa
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Install iOS dependencies:

   ```bash
   cd ios
   pod install
   cd ..
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

Note: The backend server is already deployed on Google Cloud Platform (GCP). You can ignore the `backend` folder as it's not needed for local development. The frontend app is already configured to connect to the deployed backend.

## Development

- The app uses TypeScript for type safety
- Expo is used for development and testing
- React Navigation for routing
- Custom hooks for shared logic
- Component-based architecture for reusability

## XCode and iOS simulator installation

To get started using Simulators:

- Install Xcode from the Mac App Store.
- Once installed, launch Xcode so that it can complete its first launch.
- A dialog will be presented that indicates which Simulator runtimes are built-in, and which Simulator runtimes you may download. For now, choose Continue to finish setting up Xcode.
- Once Xcode has finished setting up, relaunch the app

If you do not want to run the app through npm, you can follow these steps:

- Ensure you have the Xcode app and its iOS simulator extension installed
- Install Expo Orbit on your Macbook (2 min): https://expo.dev/orbit
- Download this file and unzip it: https://drive.google.com/file/d/19uPkT47Uqs8ir__zi2lMVBmQ5CIJvN7k/view
- You will have a small planet icon appearing at the top of your screen, select an iPhone device, click on "Select build from local file..." and select the "frontend" file you downloaded
  This should open the Xcode simulator and allow you to test the app
