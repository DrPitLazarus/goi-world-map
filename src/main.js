import L from "leaflet";
import { formatDistanceToNowStrict } from 'date-fns';
import terrBounds from "./territory_bounds";
import terrMeta from "./territory_meta";
import factions from "./factions";
import monumentData from "./monuments";
import assetMap from "../assets/map_compressed.png";
import assetMonumentIcon from "../assets/monuments/monument-icon.png";

// padding allows rendering outside of the visible area, preventing redraws when panning
let theMap = L.map("map", {
  attributionControl: false,
  center: [1024, 1024],
  crs: L.CRS.Simple,
  inertia: true,
  maxBoundsViscosity: 1,
  maxZoom: 1,
  minZoom: -1.5,
  renderer: L.svg({ padding: 1 }),
  zoom: -0.5,
  zoomDelta: 0.5,
  zoomSnap: 0.5,
});

// uncomment to get mouse position in console
// theMap.addEventListener("mousemove", (event) => {
//   let lat = Math.round(event.latlng.lat * 100000) / 100000;
//   let lng = Math.round(event.latlng.lng * 100000) / 100000;
//   console.log(lat, lng);
// });

let attribution = L.control
  .attribution({ 
    prefix: `<a href="https://github.com/DrPitLazarus/goi-world-map" target="_blank">goi-world-map</a>` 
  })
  .addTo(theMap);
attribution.addAttribution("Assets &copy; Muse Games");

// [bottom, left], [top, right]
let bounds = [
  [0, 0],
  [2048, 2048],
];
theMap.setMaxBounds(bounds);
let mapImage = L.imageOverlay(assetMap, bounds).addTo(theMap);

const PAINTER_COLOR_UNCLAIMED = "#AAA";
let painterColor = PAINTER_COLOR_UNCLAIMED;
let painterEnabled = false;
let painterCycle = true;

// add setInteractivity to layer
// https://github.com/Leaflet/Leaflet/issues/5442#issuecomment-424014428
L.Layer.prototype.setInteractive = function (interactive) {
  if (this.getLayers) {
    this.getLayers().forEach((layer) => {
      layer.setInteractive(interactive);
    });
    return;
  }
  if (!this._path) {
    return;
  }
  this.options.interactive = interactive;
  if (interactive) {
    L.DomUtil.addClass(this._path, "leaflet-interactive");
  } else {
    L.DomUtil.removeClass(this._path, "leaflet-interactive");
  }
};

let overlayTerritory = L.featureGroup()
  // ability to click territories to paint
  .on("click contextmenu dblclick", (e) => {
    if (e.type === "dblclick") {
      // Prevent double click to zoom.
      L.DomEvent.stopPropagation(e);
      return;
    }
    if (painterCycle) {
      let currentColor = e.sourceTarget.options.color;
      let currentColorIndex = factions.findIndex((fac) => fac.color === currentColor);
      let newColorIndex = e.type === "click" ? currentColorIndex + 1 : currentColorIndex - 1;
      if (newColorIndex > factions.length - 1) {
        newColorIndex = 0;
      }
      if (newColorIndex < 0) {
        newColorIndex = factions.length - 1;
      }
      painterColor = factions[newColorIndex].color;
    }
    paintTerritory(e.sourceTarget, painterColor);
  })
  .addTo(theMap);
let overlayCapitols = L.layerGroup().addTo(theMap);
// Didn't addTo(theMap) so it isn't enabled by default.
let overlayMonuments = L.featureGroup();

let baseMaps = { "The Map": mapImage };
let overlayMaps = {
  "Territory Bounds": overlayTerritory,
  "Capitol Markers": overlayCapitols,
  "Monuments": overlayMonuments,
};

// extend the normal layer control to add territory bounds painter
L.Control.Layers.Custom = L.Control.Layers.extend({
  _initLayout: function () {
    L.Control.Layers.prototype._initLayout.call(this);
    L.DomUtil.create("div", "leaflet-control-layers-separator", this._section);
    let painterDiv = document.querySelector("territory-bounds-painter");
    let painterDivSection = document.querySelector(
      "territory-bounds-painter > section"
    );
    let painterCheckbox = document.querySelector("#painter-checkbox");
    painterCheckbox.addEventListener("change", (e) => {
      painterEnabled = e.target.checked;
      overlayTerritory.setInteractive(painterEnabled);
      painterDivSection.classList.toggle("hidden");
    });
    let painterPaints = document.querySelector("paints");
    painterPaints.addEventListener("change", (e) => {
      if (e.target.value === "cycle") {
        painterCycle = true;
        return;
      }
      painterCycle = false;
      painterColor = factions.find((fac) => fac.id === parseInt(e.target.value)).color;
    });

    // populate painter paints
    let toAddToInnerHtml = "";
    toAddToInnerHtml += `<label><input type="radio" class="leaflet-control-layers-selector" name="painter-radio" value="cycle" checked>Cycle (Left+/Right-)</label>`;
    for (let faction of factions) {
      toAddToInnerHtml += `<label><input type="radio" class="leaflet-control-layers-selector" name="painter-radio" value="${faction.id}">${faction.name}</label>`;
    }
    painterPaints.innerHTML = toAddToInnerHtml;

    // buttons
    let painterReset = document.querySelector("#painter-reset");
    painterReset.addEventListener("click", resetAllTerritoriesPaint);

    let painterLatestState = document.querySelector("#painter-latest-state");
    painterLatestState.addEventListener("click", paintTerritoriesFromLatestState);

    let painterPaintAll = document.querySelector("#paint-all");
    painterPaintAll.addEventListener("click", () => {
      paintAllTerritories(painterColor);
    });

    let painterRandomizeAll = document.querySelector("#randomize-all");
    painterRandomizeAll.addEventListener(
      "click",
      paintAllTerritoriesRandomized
    );

    // last step: move the painter div into the layer control
    this._section.appendChild(painterDiv);
  },
});

let layerControl = new L.Control.Layers.Custom(baseMaps, overlayMaps, {
  collapsed: true,
  hideSingleBase: true,
}).addTo(theMap);

for (let [index, territory] of terrMeta.entries()) {
  // Create bounds polygon.
  let bounds = terrBounds[territory.boundsIndex][1];
  let territoryPolygon = L.polygon(bounds, {
    color: PAINTER_COLOR_UNCLAIMED,
    weight: 0,
    fillOpacity: 0.4,
    interactive: painterEnabled,
  }).addTo(overlayTerritory);
  // Create capitol marker.
  let capitolMarker = L.circleMarker(territory.capitol, {
    radius: 3,
    color: "#fff",
    fillOpacity: 1,
    weight: 1,
    interactive: false,
  }).addTo(overlayCapitols);
  // Add references to terrMeta.
  terrMeta[index].refBounds = territoryPolygon;
  terrMeta[index].refCapitolMarker = capitolMarker;
}

let monumentIcon = L.icon({
  iconUrl: assetMonumentIcon,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -16],
});
monumentData.forEach((monument) => {
  createMonumentMarker(monument);
});

// the original 7 factions: https://trello.com/c/Ev9RfFv5/126-the-7-factions
function paintFactionBaseTerritories() {
  for (let territory of terrMeta) {
    let faction = factions.find((fac) => fac.id === territory.startingFactionId);
    paintTerritory(territory.refBounds, faction.color);
  }
}

let lastUpdate = null;
let lastUpdateAttrib = "";

async function paintTerritoriesFromLatestState() {
  // Reset to default color.
  paintAllTerritories();
  let response = await fetch("https://goi-library.drpitlazar.us/api/territory-states");
  if (!response.ok) {
    console.error("API response not OK! :(");
    paintFactionBaseTerritories();
    return;
  }
  let data = await response.json();
  lastUpdate = data.results[0].updatedAt;
  // Update attribution.
  attribution.removeAttribution(lastUpdateAttrib);
  let attribText = `State updated ${timeAgo(lastUpdate)}`;
  attribution.addAttribution(attribText);
  lastUpdateAttrib = attribText;
  // Paint from data.
  for (let territory of data.results) {
    let ref = terrMeta.find((terr) => terr.id === territory.territoryId);
    let faction = factions.find((fac) => fac.id === territory.factionId);
    paintTerritory(ref.refBounds, faction.color);
  }
}

function timeAgo(date) {
  return formatDistanceToNowStrict(date, { addSuffix: true, roundingMethod: 'floor' });
}

function resetAllTerritoriesPaint() {
  paintAllTerritories(PAINTER_COLOR_UNCLAIMED);
  paintFactionBaseTerritories();
}

function paintTerritory(ref, color = PAINTER_COLOR_UNCLAIMED) {
  ref.setStyle({ color: color });
}

function paintAllTerritories(color = PAINTER_COLOR_UNCLAIMED) {
  for (let territory of terrMeta) {
    paintTerritory(territory.refBounds, color);
  }
}

function paintAllTerritoriesRandomized() {
  let colors = [];
  for (let faction in factions) {
    colors.push(factions[faction].color);
  }
  for (let territory of terrMeta) {
    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    paintTerritory(territory.refBounds, randomColor);
  }
}

function createMonumentMarker(monumentData) {
  return L.marker(monumentData.position, { icon: monumentIcon })
    .bindPopup(`<img src="${monumentData.imageUrl}"/>${monumentData.text}`, {
      className: "monument-image",
    })
    .addTo(overlayMonuments);
}

// run once
paintTerritoriesFromLatestState();