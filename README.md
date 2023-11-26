# goi-world-map

An interactive world map for the game Guns of Icarus Online/Alliance.

Hosted here: https://goi-world-map.drpitlazar.us


## Features

- normal map things like panning, zooming, and mobile support
- togglable overlays for territories and capitol markers
- paintable territories!
  - enable the painter and select what faction to paint *(any paint as long as it's blue)*
  - click/tap territories to paint
  - buttons for paint all, randomize paint, and reset
  - paint data is not stored; everything will reset on reload
- v0.2.0 monument overlay has been added: view monument image and text


## Technologies

- JavaScript, NodeJS, pnpm package manager
- [leaflet](https://github.com/Leaflet/Leaflet#readme) mapping library
- [vitejs](https://vitejs.dev/) front-end tooling (hot-reloading and building)
- [vercel](https://vercel.com/) simple and free web deployment and hosting


## Development environment

**WARNING!!!** Source code may be radioactive. Please wear proper protection before looking.

Clone and install dependencies:

```
git clone https://github.com/DrPitLazarus/goi-world-map.git

cd goi-world-map

pnpm i
```

Run vite development server:

```
pnpm dev
```


## Build and Deploy to Vercel

```
pnpm build

cd dist

vercel
```