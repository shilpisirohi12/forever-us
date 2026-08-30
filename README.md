# ❤️ Forever Us — Intimate Couple Web App

A modern, playful, and intimate couple companion built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Supabase**, ready to deploy on **Vercel**.

---

## 🌟 Features

```
❤️ Couple App
│   ├── Realtime message exchange & message reactions (❤️, 🔥, 💋, 😂)
│   ├── Quick romantic triggers: "Send Kiss 💋", "Heartbeat Nudge 💓", "Warm Hug 🤗"
│   └── Quick love prompts carousel
├── 🎲 Games
│   ├── Couple Bingo: 5x5 interactive grid with line completion & victory confetti
│   └── Challenges: Creator-coloured couple quests with completion notes & point rewards
├── ❤️ Date Night
│   ├── Random Date Roulette: Filter by Budget ($, $$, $$$), Mood (Cozy, Adventurous, Romantic, Foodie), & Location
│   └── Date Bucket List & Memories Scrapbook (5-star ratings & memories)
├── 🔥 Private Zone (PIN-Protected)
│   ├── Secret 4-digit PIN lock (Default: `1234`) & "Grocery Disguise" panic button
│   ├── Spicy / Adult Scratch-off & Flip cards
│   ├── Pleasure / Romance 3-Dice Roller (Action + Target + Vibe)
│   └── Secret Mutual Fantasy Matcher (Only reveals if BOTH partners vote Yes!)
└── 🏆 Rewards
    ├── Shared Love Coins Economy (Earned via games, challenges & gestures)
    ├── Custom Love Coupon Book (Massages, Breakfast in Bed, Chore Pass)
    └── Redeem & Partner Honor/Approval workflow
```

---

## 🚀 Getting Started

### 1. Install Dependencies & Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> The app comes with **instant offline / demo persistence** out of the box! You and your partner can switch views using the partner toggle in the top header and start playing immediately without configuring anything.

---

## ⚡ Supabase Setup (Optional for Multi-Device Cloud Sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the entire script found in [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy your **Project URL** and **Anon API Key** from `Settings` -> `API`.
4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repo.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to **Environment Variables** in Vercel.
4. Click **Deploy**! 🚀
