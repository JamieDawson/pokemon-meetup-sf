# Sunflower's 151

This is the website for **Sunflower's 151** — a fanmade Pokémon cosplay meetup in the SF Bay Area.

It's unofficial. Not affiliated with Nintendo or The Pokémon Company. Just a bunch of people cosplaying Pokémon and hanging out.

## The event (quick version)

- **When:** September 13, 12pm–7pm (doors at 11:30am)
- **Where:** South San Francisco (full address goes out after you sign up)
- **Who:** 18+, you need a ticket
- **Host:** [Sunflowercos](https://www.instagram.com/sunflowercos), with help from Mimi, Sonic, Dame & Poppy

## What's on the site

### Home page

Basically the main promo page. It has:

- What the event is about
- What's happening that day (photos, sets, snacks, etc.)
- Which Pokémon are still up for grabs
- How to join
- Links to Instagram, Eventbrite, and Discord

### Who's that Pokemon page

This one's for Pokémon that are already taken.

It pulls everything marked `FALSE` (not available) and shows the cosplayer's Instagram handle under each one. So you can see who's who.

## How the Google Sheets work

There are two spreadsheets driving this thing.

### Sheet 1 — available or not

Columns are basically:

- National Dex #
- Pokémon name
- available (`TRUE` / `FALSE`)
- Image URL

If it's `TRUE`, it shows up on the home page.  
If it's `FALSE`, it shows up on Who's that Pokemon.

Flip a value in the sheet and the site picks it up next time someone loads the page (or comes back to the tab).

### Sheet 2 — cosplayer names

This one has the IG tags and preferred names.

The site matches people to Pokémon by name from Sheet 1. Stuff that isn't in Sheet 1 (Nurse Joy, Rocket Grunt, etc.) gets ignored on purpose.

On the Who's that Pokemon page, we show the **IG handle**, not the preferred name.

## Tech stuff

- React + Vite + TypeScript
- React Router (so we can have more than one page)
- Google Sheets as the "database"
- Locally, Vite proxies the sheets so data stays fresh
- On Netlify, `netlify.toml` does the same proxy thing (this is important — without it, live updates and IG handles break in production)

## Running it locally

```bash
npm install
npm run dev
```

Then open whatever URL Vite gives you (usually `http://localhost:5173/`).

## Deploying on Netlify

- Build command: `npm run build`
- Publish folder: `dist`

`netlify.toml` already handles the sheet proxies and the SPA routes like `/whos-that-pokemon`.
