# Real-Time Chat Mobile

React Native CLI mobile client for the existing chat backend.

The Node.js/Express/MongoDB backend stays unchanged. This app connects to the same REST API and Socket.IO server used by the web frontend.

## Screens

- Login/Register
- Guest login
- Chat room list
- Create room
- Chat screen with Socket.IO messages, typing, and online user count
- Profile summary and logout on the room list screen

## Configure backend URL

By default the app connects to the local backend on port `5000`.

- Android emulator: `http://10.0.2.2:5000`
- iOS simulator: `http://localhost:5000`

For a real phone, edit `src/config.ts` and set `LAN_HOST` to your computer's Wi-Fi IP address.

## Run

```sh
cd mobile
npm install
npm start
```

In another terminal:

```sh
npm run android
```

For iOS on macOS:

```sh
npm run ios
```
