# **App Name**: TheDigiOcean

## Core Features:

- AI Risk Guardian System: An always-on AI-powered tool that monitors trader psychology (e.g., speed of re-entry, increasing position size after losses) to detect and intervene in revenge or greed-driven trading patterns.
- Multi-Chart Terminal with AI Overlay: A professional, customizable multi-window TradingView chart terminal, augmented with real-time AI overlays for support/resistance, entry/exit zones, and signal indications.
- AI F&O Strategy Recommender: A Gemini AI tool that analyzes live options chain data, market bias, and FII/DII positions to recommend optimal F&O strike prices and strategies with detailed reasoning and payoff analysis.
- Live Market Data & Indices: Real-time display of NSE/BSE stock quotes, major Indian indices (NIFTY, SENSEX), FII/DII activity, and P&L, providing traders with an immediate market overview.
- Broker Connection & Order Execution: Seamless integration with popular Indian stockbrokers (e.g., Zerodha, Upstox) allowing users to connect their accounts and execute trades with integrated risk checks directly from the platform.
- AI Trading Agent: A conversational AI tool (Digi AI mascot) that assists traders by providing market analysis, personalized insights, and risk-aware trade recommendations based on current market and user data.
- Personalized AI Trading Coach: An AI tool that analyzes historical trade journal data to provide narrative reports on trading psychology, identifies strengths and weaknesses, and suggests personalized rule adjustments to improve discipline.

## Style Guidelines:

- The primary brand color is a deep purple (#6B4EFF), used for primary actions and branding. A soft purple (#EDE9FF) is used for hover states and info badges. Pressed/focus states use a darker purple (#4B2FD9). The main page background is a warm cream (#F5F0EB), complemented by a clean white (#FFFFFF) for cards and panels. Chart backgrounds and dark panels use a deep dark gray (#0D0D1A).
- Crucial trading status indicators use distinct colors: 'bull' green (#00C853) for positive P&L/BUY, 'bear' red (#FF3D57) for losses/SELL, and 'neutral' golden yellow (#FFB300) for warnings or HOLD states. Critical information for locking mechanisms are represented by a bold danger red (#FF1744), often with a light transparent version (#FF174420) for backgrounds.
- All headings and brand text utilize 'Plus Jakarta Sans' (sans-serif) for a modern, bold display. UI text, labels, and descriptions are set in 'DM Sans' (sans-serif) for clarity and readability. Critical financial numbers like prices, P&L, and volumes are displayed in 'JetBrains Mono' (monospace) for distinctness and tabular alignment.
- The animated 'Digi' blob mascot is a central iconic element, displaying various expressive states (e.g., happy, sweating, thinking) corresponding to the user's P&L and AI risk status. General icons should be clean and professional, aligning with the platform's tech-savvy nature.
- The application features a fixed 64px topbar, a collapsible sidebar (240px to 68px icon-only), and a floating 56px circular AI chat button (Digi mascot) at the bottom-right. Auth pages employ a distinct split-screen layout with a vibrant left panel featuring a large, animated Digi mascot. Trading sections utilize flexible, data-dense grid layouts for multi-chart terminals and dedicated cockpits.
- Interactive elements like cards, buttons, and inputs are consistently styled with specific radius (e.g., rounded-xl for cards, rounded-md for inputs), purple-tinted shadows (rgba(107,78,255,0.10)), and subtle borders (#E5DDD5) to maintain a cohesive, polished look.
- Subtle animations are integrated throughout the UI, including the expressive states of the Digi mascot, hover effects on interactive elements, dynamic changes in the risk progress bar (e.g., pulsing red when 90% reached), and smooth transitions between UI elements, often leveraging Framer Motion for fluidity.