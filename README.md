# iOS Sleep Disruptor

A Progressive Web App (PWA) that prevents your iOS device from sleeping by playing random sounds at intervals. Perfect for situations where you need to keep your device awake without constant interaction.

![App Screenshot](screenshot.png) <!-- Add a screenshot if available -->

## Features

- ⏲️ **Custom Timer**: Set duration in hours, minutes, and seconds
- 🔊 **Adjustable Sound**:
  - Volume control (0-100%)
  - Three pitch options (Low, Mid, High)
- 📱 **PWA Support**: Installable on iOS homescreen
- 🔋 **Wake Lock**: Prevents device from sleeping (when supported)
- ♿ **Accessible**: Designed with ARIA attributes and keyboard navigation
- 🌓 **Dark/Light Mode**: Automatically adapts to system preferences

## How It Works

The app plays random short beeps (1-5 seconds) at irregular intervals (5-15 seconds) to prevent iOS from automatically locking the screen or going to sleep. This is particularly useful for:

- Presentations where you need your device to stay awake
- Reading long articles without constant tapping
- Any situation requiring uninterrupted screen time

## Installation

1. **Web Version**:
   - Simply visit [https://yourdomain.com/path-to-app]() <!-- Add your URL -->
   
2. **iOS Home Screen**:
   1. Open in Safari
   2. Tap the Share button
   3. Select "Add to Home Screen"
   4. Launch like a native app

## Usage

1. Set your desired duration using the time picker
2. Adjust volume and pitch to your preference
3. Tap "Start" to begin
4. The app will automatically:
   - Prevent screen sleep (when supported)
   - Play random sounds
   - Show countdown timer

## Technical Details

- **Web Technologies**:
  - HTML5, CSS3, JavaScript
  - Web Audio API
  - Screen Wake Lock API (with polyfill)
  - PWA capabilities (Service Worker, Web Manifest)

- **Browser Support**:
  - iOS Safari (with some limitations)
  - Most modern browsers

## Known Limitations

- **iOS Restrictions**:
  - Audio may pause when app is in background
  - Wake Lock API not fully supported on iOS
- **Battery Impact**: Continuous use will drain battery faster

## Development

To run locally:

```bash
git clone https://github.com/yourusername/ios-sleep-disruptor.git
cd ios-sleep-disruptor
# Serve using your preferred method (e.g., python3 -m http.server 8000)
