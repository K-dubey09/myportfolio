# Portfolio Frontend

A modern React portfolio website built with Vite, featuring an admin panel for content management.

## Features

- **Profile Management**: Update personal information and profile picture
- **Skills Management**: Add, edit, and delete technical skills
- **Responsive Design**: Mobile-friendly interface
- **Authentication**: Secure admin login system
- **Real-time Updates**: Live preview of changes

## Technologies Used

- React 18
- Vite (Build tool)
- React Router (Navigation)
- CSS3 (Styling)
- Fetch API (HTTP requests)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) to view the portfolio

## Admin Panel

Access the admin panel at `/admin` to manage portfolio content. The admin panel includes:

- Profile information management
- Skills management with categories and proficiency levels
- User authentication and session management

## Project Structure

```
src/
├── Admin/              # Admin panel components
│   ├── AdminPanel.jsx  # Main admin interface
│   └── AdminPanel.css  # Admin panel styling
├── components/         # Reusable components
├── assets/            # Static assets
└── main.jsx           # Application entry point
```

## Development

- Frontend runs on port 5173
- Backend API expected on port 5000
- Hot module replacement enabled for fast development
