# This file is only for editing file nodes, do not break the structure

/src
├── assets/          # Static resources directory, storing static files like images and fonts
│
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components, avoid modifying or rewriting unless necessary
│   └── chat/       # Chat feature components for the Quick Chat application
│       ├── ChatInput.tsx     # Chat input component with file attachment functionality
│       ├── ChatRoom.tsx      # Chat room component to manage and display messages
│       ├── JoinRoom.tsx      # Component to create or join chat rooms
│       └── MessageItem.tsx   # Individual message component with file display support
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Pre-installed mobile detection Hook from shadcn (import { useIsMobile } from '@/hooks/use-mobile')
│   └── use-toast.ts  # Toast notification system hook for displaying toast messages (import { useToast } from '@/hooks/use-toast')
│
├── lib/            # Utility library directory
│   ├── utils.ts    # Utility functions, including the cn function for merging Tailwind class names
│   └── fileUtils.ts # File handling utility functions for the chat application
│
├── pages/          # Page components directory, based on React Router structure
│   ├── HomePage.tsx  # Home page component, introducing the chat application
│   ├── ChatPage.tsx  # Main chat application page that manages room joining and messaging
│   └── NotFoundPage.tsx # 404 error page component, displays when users access non-existent routes
│
├── store/          # State management directory
│   └── chatStore.ts # Chat state management using zustand
│
├── App.tsx         # Root component, with React Router routing system configured
│                   # Add new route configurations in this file
│                   # Includes catch-all route (*) for 404 page handling
│
├── main.tsx        # Entry file, rendering the root component and mounting to the DOM
│
├── index.css       # Global styles file, containing Tailwind configuration and custom styles
│                   # Modify theme colors and design system variables in this file 
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file
                      # Contains theme customization, plugins, and content paths
                      # Includes shadcn/ui theme configuration 
