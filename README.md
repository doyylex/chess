# Chess

A browser chess game built with plain HTML, CSS, and JavaScript, plus a Spring Boot backend for guest online rooms.

## Features

- Local two-player chess
- Play vs AI with simple JavaScript AI and Stockfish WASM
- Online guest rooms by code
- Basic online chat
- Legal move validation
- Move hints, promotion modal, result modal, sounds, visual themes, and English/Spanish UI

## Frontend

Run a static server from the project root:

```powershell
cd C:\Users\Usuario\Desktop\chess
python -m http.server 8000
```

Open:

```text
http://127.0.0.1:8000/
```

## Backend

Run Spring Boot:

```powershell
cd C:\Users\Usuario\Desktop\chess\backend
mvn spring-boot:run
```

The backend runs on:

```text
http://127.0.0.1:8080/
```

## Notes

- No login or database yet.
- Online rooms are temporary and stored in memory.
- Vendor files are committed so the frontend can run without relying on CDN libraries.
