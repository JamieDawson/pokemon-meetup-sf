# 🌻 Sunflower's 151 — Bay Area's Largest Pokémon Cosplay Meetup

I built this site for **Sunflower's 151**, a fan-made Pokémon cosplay meetup happening in the SF Bay Area.

The idea is pretty simple: **hundreds of people are dressing up as Pokémon, and the site lets everyone see which Pokémon are still available to cosplay.** 🎃⚡

I wanted to make something that was actually useful for the meetup instead of just making another event page. The site pulls its data directly from Google Sheets, so the organizers can update Pokémon availability without having to touch the code.

**Unofficial fan project. Not affiliated with Nintendo or The Pokémon Company.**

## 🎮 What I Built

### 🌻 Landing Page

The landing page gives you the event info right away, with a big call to join and links to explore the Pokémon lineup.

![First thing users see when the page loads](./src/assets/sunflower-1.png)

### ⚡ Pokémon Still Available

This page shows all of the Pokémon that are still available to cosplay.

The organizers can simply change the `available` value in the Google Sheet and the site updates automatically.

![Pokemon availability](./src/assets/sunflower-2.png)

### 👀 Who's That Pokémon?

Once a Pokémon has been claimed, it moves over to the **Who's That Pokémon?** page.

The site matches the Pokémon to the cosplayer's Instagram handle so people can see who's taking on each character.

![Which Pokemon can be cosplayed / already claimed](./src/assets/sunflower-3.png)

## 📊 Powered by Google Sheets

One of the things I wanted to do with this project was keep the organizers completely out of the code.

The site uses **two Google Sheets** as its data source:

**Sheet 1 — Pokémon availability**

- National Dex #
- Pokémon name
- `available` (`TRUE` / `FALSE`)
- Image URL

**Sheet 2 — Cosplayers**

- Pokémon name
- Instagram handle
- Signup information

The React app pulls both sheets and combines the data:

1. Fetch the Pokémon availability sheet.
2. Fetch the cosplayer sheet.
3. `TRUE` Pokémon → show them as **available**.
4. `FALSE` Pokémon → move them to **Who's That Pokémon?**
5. Match claimed Pokémon with the cosplayer's Instagram handle.
6. Ignore signup entries that aren't Pokémon, like Nurse Joy or Team Rocket Grunts.

So if someone claims Pikachu, the organizer only needs to change Pikachu from `TRUE` to `FALSE` in the spreadsheet.

**No code changes required.**

## 🛠️ Built With

- React
- TypeScript
- Vite
- Tailwind CSS
- Google Sheets
- Netlify

## 🎟️ Event

- **When:** September 13, 12pm–7pm
- **Doors:** 11:30am
- **Where:** South San Francisco
- **Who:** 18+
- **Ticket:** Required
- **Host:** [Sunflowercos](https://www.instagram.com/sunflowercos) + Mimi, Sonic, Dame & Poppy

## 🚀 Run It Locally

```bash
npm install
npm run dev
```
