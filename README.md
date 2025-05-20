# NeuroMine - Biomedical Search Platform

NeuroMine is a modern web application for searching and exploring biomedical compounds and their effects. Built with Next.js, TypeScript, and MongoDB, it provides a powerful interface for researchers and medical professionals to access biomedical data.

## Live Demo

🌐 [https://neuro-mine.vercel.app/](https://neuro-mine.vercel.app/)

## Features

- 🔍 Advanced search functionality for biomedical compounds
- 🎯 Filter results by evidence type, disease, and confidence score
- 🌓 Dark/Light theme support
- 📱 Responsive design
- ⚡ Fast and efficient search with MongoDB
- 🎨 Modern UI with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Theme**: next-themes

## Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- npm or yarn

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/NeuroMine.git
cd NeuroMine
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── main-content.tsx  # Main search interface
│   └── theme-provider.tsx # Theme configuration
├── lib/                   # Utility functions
│   └── mongodb.ts        # MongoDB connection
├── models/               # Database models
│   └── BiomedicalData.ts # Biomedical data schema
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint



