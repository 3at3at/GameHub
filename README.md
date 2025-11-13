# 🎮 GameHub - Smart Management System for Gaming Shops

A full-stack application for managing gaming shops, reservations, tournaments, and player loyalty programs.

## 🚀 Tech Stack

- **Backend**: .NET 8.0 C# Web API
- **Frontend**: React.js with Vite
- **Database**: SQL Server (LocalDB)
- **Styling**: Bootstrap 5 with Dark Theme
- **Authentication**: JWT Bearer Tokens

## 📋 Features

- ✅ Online Reservations - Book gaming stations in advance
- ✅ Smart Time Tracking & Billing - Automatic billing with accurate playtime
- ✅ Membership & Loyalty Program - Earn points for hours played
- ✅ Tournament Management - Organize and join gaming tournaments
- ✅ Community Features - Player profiles, stats, and leaderboards
- ✅ Admin Dashboard - Manage shops, players, and tournaments

## 🛠️ Setup Instructions

### Prerequisites

- .NET 8.0 SDK
- Node.js (v20+)
- SQL Server LocalDB (or SQL Server Express)

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd Backend/GameHub.API
   ```

2. Restore packages:
   ```bash
   dotnet restore
   ```

3. Update the connection string in `appsettings.json` if needed (default uses LocalDB)

4. Run the application:
   ```bash
   dotnet run
   ```

   The API will be available at:
   - HTTP: `http://localhost:5041`
   - HTTPS: `https://localhost:7247`
   - Swagger UI: `http://localhost:5041/swagger`

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
GameHub Full Stack Project/
├── Backend/
│   └── GameHub.API/
│       ├── Controllers/      # API Controllers
│       ├── Data/            # DbContext
│       ├── DTOs/            # Data Transfer Objects
│       ├── Models/          # Entity Models
│       └── Program.cs       # Application entry point
│
└── Frontend/
    └── src/
        ├── components/      # React Components
        ├── context/         # React Context (Auth)
        ├── pages/          # Page Components
        ├── services/       # API Service Layer
        └── App.jsx         # Main App Component
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Shops
- `GET /api/shops` - Get all shops
- `GET /api/shops/{id}` - Get shop details

### Gaming Stations
- `GET /api/gamingstations/shop/{shopId}` - Get stations by shop
- `GET /api/gamingstations/available` - Get available stations

### Reservations (Requires Auth)
- `GET /api/reservations` - Get user's reservations
- `POST /api/reservations` - Create new reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/{id}` - Get tournament details
- `POST /api/tournaments/{id}/register` - Register for tournament (Requires Auth)
- `GET /api/tournaments/my-registrations` - Get user's tournament registrations (Requires Auth)

## 🎨 Dark Theme

The application uses a custom dark theme with Bootstrap 5. The color scheme is optimized for gaming aesthetics with:
- Dark backgrounds (#0d1117, #161b22)
- Primary blue accents (#58a6ff)
- High contrast text for readability

## 📝 Database Models

- **User** - Player accounts with loyalty points
- **Shop** - Gaming shop information
- **GamingStation** - PC/PlayStation/Xbox stations
- **Reservation** - Booking system
- **PlaySession** - Active gaming sessions
- **Tournament** - Tournament management
- **TournamentRegistration** - Player tournament registrations

## 🔧 Configuration

### Backend Configuration

Update `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your connection string here"
  },
  "Jwt": {
    "Key": "Your secret key (at least 32 characters)",
    "Issuer": "GameHub",
    "Audience": "GameHubUsers"
  }
}
```

### Frontend Configuration

Update `src/services/api.js` to match your backend URL:
```javascript
const API_BASE_URL = 'http://localhost:5041/api';
```

## 🚦 Running the Application

1. Start the backend:
   ```bash
   cd Backend/GameHub.API
   dotnet run
   ```

2. Start the frontend (in a new terminal):
   ```bash
   cd Frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## 📦 Building for Production

### Backend
```bash
cd Backend/GameHub.API
dotnet publish -c Release
```

### Frontend
```bash
cd Frontend
npm run build
```

## 🤝 Contributing

This is a full-stack project template. Feel free to extend it with additional features like:
- Payment integration
- Real-time notifications
- Advanced analytics
- Mobile app support

## 📄 License

This project is open source and available for educational purposes.

---

**Built with ❤️ for the gaming community**

