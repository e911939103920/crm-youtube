# GlassCRM

A minimalist, visually elegant customer relationship management web application. GlassCRM combines the design philosophies of Linear, Attio, and Notion with lightweight CRM workflows, featuring a calm, glassy, and responsive UI.

## Features

- 🎨 **Beautiful Glass UI** - Frosted glass effects with subtle translucency
- 📊 **Dashboard** - Real-time analytics, KPIs, and performance metrics
- 🔄 **Pipeline Management** - Kanban board with smooth drag-and-drop
- 👥 **Leads Management** - Comprehensive lead tracking with search and filters
- 📤 **CSV Import/Export** - Bulk import leads from CSV files
- 💳 **Billing** - Subscription management interface
- ⚙️ **Settings** - Customizable appearance and preferences
- 🌓 **Dark Mode** - Seamless light/dark theme switching
- ✨ **Micro-animations** - Smooth, delightful interactions throughout

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS with custom glass effects
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Charts:** Recharts
- **Drag & Drop:** react-beautiful-dnd
- **CSV Processing:** PapaParse
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crm-youtube
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── pipeline/          # Pipeline/Kanban page
│   ├── leads/             # Leads management page
│   ├── billing/           # Billing page
│   ├── settings/          # Settings page
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Notification.tsx   # Toast notifications
│   ├── ThemeProvider.tsx  # Theme context
│   ├── LoadingSkeleton.tsx
│   └── ErrorState.tsx
├── lib/                   # Utilities and stores
│   └── store.ts           # Zustand state management
├── hooks/                 # Custom React hooks
│   └── useNotifications.ts
└── public/                # Static assets
```

## Design Principles

1. **Calm Clarity** - Minimal noise, abundant white space, balanced typography
2. **Glassy Transparency** - Subtle frosted-glass translucency with low contrast shadows
3. **Micro-Interactions** - Tactile, responsive transitions (150-300ms)
4. **Human Flow** - Smooth, satisfying actions throughout
5. **Information at Rest** - Perfectly balanced views when not in motion

## Key Features

### Dashboard
- KPI cards with animated counters
- Pipeline distribution pie chart
- Conversion over time line chart
- Recent leads timeline

### Pipeline (Kanban)
- Drag-and-drop lead cards between stages
- Stage metrics (count and value)
- Inline card editing
- Smooth animations on drag

### Leads Management
- Searchable table view
- Create, edit, and delete leads
- CSV import with progress tracking
- CSV export functionality

### Authentication
- Login and signup pages
- Mock authentication (ready for Supabase integration)
- Protected routes

## State Management

The app uses Zustand for state management with localStorage persistence. The store manages:
- User authentication
- Leads data
- Pipeline stages
- UI preferences

## Future Enhancements

- [ ] Supabase backend integration
- [ ] Real authentication
- [ ] Email integration
- [ ] Team collaboration features
- [ ] AI-powered lead scoring
- [ ] Custom pipeline fields
- [ ] Mobile responsive optimizations
- [ ] Advanced analytics
- [ ] Stripe payment integration

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Credits

Inspired by the design philosophies of:
- Linear
- Attio
- Notion
- Apple macOS Big Sur

---

Built with ❤️ using Next.js and TailwindCSS
