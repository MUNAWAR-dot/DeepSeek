# ChatsApp - Modern Messaging Application

A fully functional WhatsApp-like messaging application built with React Native.

## Features

### Core Features
- **Real-time Messaging**: Send and receive messages instantly
- **Multiple Login Methods**: Email, Phone Number, Google Sign-in
- **Media Sharing**: Images, Videos, Audio, Documents
- **Voice & Video Calls**: High-quality calls using Agora SDK
- **Group Chats**: Create and manage groups up to 256 members
- **Status Stories**: Share updates that disappear after 24 hours
- **End-to-End Encryption**: AES-256 encryption for all messages

### Advanced Features
- **Multi-language Support**: 10+ languages including English, Hindi, Urdu, Chinese, Arabic
- **Dark Mode**: Full dark theme support
- **Push Notifications**: Firebase Cloud Messaging integration
- **Offline Support**: Messages queue when offline
- **Message Reactions**: React to messages with emojis
- **Reply & Forward**: Reply to specific messages, forward to other chats
- **Location Sharing**: Share live and static locations
- **QR Code Scanning**: Scan QR codes to add contacts
- **Contact Sync**: Sync phone contacts to find friends on ChatsApp
- **Privacy Controls**: Granular privacy settings
- **Block/Report**: Block and report users

## Tech Stack

### Frontend
- React Native 0.72+
- React Navigation 6
- Zustand (State Management)
- Socket.io Client
- Firebase SDK
- i18next (Internationalization)
- React Native Reanimated
- React Native Vector Icons

### Backend
- Node.js
- Express.js
- Socket.io
- Firebase Admin SDK
- Agora Token Server
- Multer (File Upload)
- JSON Web Tokens

### Database & Storage
- Firebase Firestore
- Firebase Storage
- Firebase Authentication
- Firebase Cloud Messaging

## Prerequisites

- Node.js >= 18
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)
- Firebase Project

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chatsapp.git
cd chatsapp
