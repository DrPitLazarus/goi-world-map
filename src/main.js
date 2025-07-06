import L from "leaflet";
import { format, formatDistanceToNowStrict } from "date-fns";
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
    prefix: `<a href="https://github.com/DrPitLazarus/goi-world-map" target="_blank">goi-world-map</a>`,
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
// Default Alliance config:
let allianceMode = false;
let alliance1Factions = [1, 2, 3];
let alliance1ColorIndex = 1;
let alliance2ColorIndex = 6;
// History Viewer variables:
let historyViewerEnabled = false;
let historySnapshotsData = null;
let historySnapshotDropdown = document.querySelector("#history-snapshot-dropdown");
let historyKeyPrevious = ",";
let historyKeyNext = ".";

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

    let terrMetaRef = terrMeta.find((terr) => terr.refBounds === e.sourceTarget);

    if (painterCycle) {
      let currentColor = e.sourceTarget.options.color;
      let currentColorIndex = colorToFactionId(currentColor);
      let newColorIndex = 0;

      if (allianceMode) {
        newColorIndex =
          currentColorIndex === alliance1ColorIndex
            ? alliance2ColorIndex
            : alliance1ColorIndex;
      } else {
        // Non-allianceMode painterCycle
        // Left click increase color index / right click decrease.
        newColorIndex = e.type === "click" ? currentColorIndex + 1 : currentColorIndex - 1;
        if (newColorIndex > factions.length - 1) {
          newColorIndex = 0;
        }
        if (newColorIndex < 0) {
          newColorIndex = factions.length - 1;
        }
        terrMetaRef.lastFaction = newColorIndex;
      }
      painterColor = factions[newColorIndex].color;
    } else {
      // Non-painterCycle mode
      terrMetaRef.lastFaction = colorToFactionId(painterColor);
    }

    paintTerritory(e.sourceTarget, painterColor);

    if (allianceMode && !painterCycle) {
      updateAllianceModePaint();
    }
  })
  .addTo(theMap);
let overlayCapitols = L.layerGroup().addTo(theMap);
// Didn't addTo(theMap) so it isn't enabled by default.
let overlayMonuments = L.featureGroup();
let overlayPathways = L.layerGroup();

let baseMaps = { "The Map": mapImage };
let overlayMaps = {
  "Territory Bounds": overlayTerritory,
  "Capitol Markers": overlayCapitols,
  "Monuments": overlayMonuments,
  "Pathways": overlayPathways,
};

// extend the normal layer control to add territory bounds painter
L.Control.Layers.Custom = L.Control.Layers.extend({
  _initLayout: async function () {
    L.Control.Layers.prototype._initLayout.call(this);
    L.DomUtil.create("div", "leaflet-control-layers-separator", this._section);
    let painterElement = createTerritoryBoundsPainterElement();
    let allianceElement = createAllianceConfigElement();
    let historyViewerElement = await createHistoryViewerElement();

    // last step: move the element into the layer control
    this._section.appendChild(painterElement);
    this._section.appendChild(allianceElement);
    this._section.appendChild(historyViewerElement);
  },
});

function createTerritoryBoundsPainterElement() {
  let painterDiv = document.querySelector("territory-bounds-painter");
  let painterDivSection = document.querySelector("territory-bounds-painter > section");
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
  painterLatestState.addEventListener("click", paintTerritoriesFromApi);

  let painterPaintAll = document.querySelector("#paint-all");
  painterPaintAll.addEventListener("click", () => {
    paintAllTerritories(painterColor);
  });

  let painterRandomizeAll = document.querySelector("#randomize-all");
  painterRandomizeAll.addEventListener("click", paintAllTerritoriesRandomized);
  return painterDiv;
}

function createAllianceConfigElement() {
  let element = document.querySelector("alliance-config");
  let elementSection = document.querySelector("alliance-config > section");
  let sectionCheckbox = document.querySelector("#alliance-checkbox");
  elementSection.classList.toggle("hidden", !sectionCheckbox.checked);
  sectionCheckbox.addEventListener("change", (e) => {
    elementSection.classList.toggle("hidden", !e.target.checked);
  });
  let alliance1ColorDropdown = document.querySelector("#alliance-1-color-dropdown");
  let alliance2ColorDropdown = document.querySelector("#alliance-2-color-dropdown");

  // Populate alliance 1 checkboxes.
  let alliance1FactionsElement = document.querySelector("#alliance-1-factions");
  alliance1FactionsElement.innerHTML = (() => {
    let newInnerHtml = ``;
    for (let faction of factions.filter((faction) => faction.id > 0)) {
      let isDefaultSelected = alliance1Factions.includes(faction.id) ? "checked" : "";
      newInnerHtml += `<label><input type="checkbox" class="leaflet-control-layers-selector" value="${faction.id}" ${isDefaultSelected}/> <span>${faction.name}</span></label>`;
    }
    return newInnerHtml;
  })();
  let alliance1FactionsCheckboxes =
    alliance1FactionsElement.querySelectorAll(`input[type="checkbox"]`);

  // Populate alliance faction colors.
  let toAddToInnerHtml = ``;
  for (let faction of factions.filter((faction) => faction.id > 0)) {
    let isDefaultSelected = faction.id === alliance1ColorIndex ? "selected" : "";
    toAddToInnerHtml += `<option value="${faction.id}" ${isDefaultSelected}>${faction.name}</option>`;
  }
  alliance1ColorDropdown.innerHTML = toAddToInnerHtml;

  toAddToInnerHtml = ``;
  for (let faction of factions.filter((faction) => faction.id > 0)) {
    let isDefaultSelected = faction.id === alliance2ColorIndex ? "selected" : "";
    toAddToInnerHtml += `<option value="${faction.id}" ${isDefaultSelected}>${faction.name}</option>`;
  }
  alliance2ColorDropdown.innerHTML = toAddToInnerHtml;

  // Buttons
  let applyButton = document.querySelector("#alliance-apply");
  let values = [];
  applyButton.addEventListener("click", (e) => {
    console.time("allianceApplyPaint");
    allianceMode = true;
    updateAllianceModeStatus();
    alliance1FactionsElement = [];
    alliance1ColorIndex = parseInt(alliance1ColorDropdown.value);
    alliance2ColorIndex = parseInt(alliance2ColorDropdown.value);
    // Get values from the checkboxes.
    values = [];
    for (let checkbox of alliance1FactionsCheckboxes) {
      let factionId = parseInt(checkbox.value);
      let isFaction1 = checkbox.checked;
      let allianceColorId = isFaction1
        ? parseInt(alliance1ColorDropdown.value)
        : parseInt(alliance2ColorDropdown.value);
      let color = factions.find((fac) => fac.id === allianceColorId).color;
      values.push({
        factionId,
        isFaction1,
        color,
      });
      if (isFaction1) {
        alliance1FactionsElement.push(factionId);
      }
    }
    // Paint!
    for (let territory of terrMeta.filter((terr) => terr.lastFaction > 0)) {
      let color = values.find((val) => val.factionId === territory.lastFaction).color;
      paintTerritory(territory.refBounds, color);
    }
    console.timeEnd("allianceApplyPaint");
  });

  let removeButton = document.querySelector("#alliance-remove");
  removeButton.addEventListener("click", (e) => {
    console.time("allianceRemovePaint");
    allianceMode = false;
    updateAllianceModeStatus();
    // Paint!
    for (let territory of terrMeta.filter((terr) => terr.lastFaction > 0)) {
      let color = factions.find((fac) => fac.id === territory.lastFaction).color;
      paintTerritory(territory.refBounds, color);
    }
    console.timeEnd("allianceRemovePaint");
  });

  return element;
}

async function createHistoryViewerElement() {
  let baseApiUrl = "https://goi-library.drpitlazar.us/api/territory-states";
  let historyViewerDiv = document.querySelector("history-viewer");
  let historySectionDiv = document.querySelector("history-viewer > section");
  let historyCheckbox = document.querySelector("#history-viewer-checkbox");
  historyCheckbox.addEventListener("change", (e) => {
    historyViewerEnabled = e.target.checked;
  });
  let historyLoadPreviousButton = document.querySelector("#history-load-previous-button");
  let historyLoadNextButton = document.querySelector("#history-load-next-button");
  historyCheckbox.addEventListener("change", async (e) => {
    historySectionDiv.classList.toggle("hidden");
    // On first open, populate the snapshot data dropdown.
    if (historySnapshotsData == null) {
      let snapshotDataRequest = await fetch(`${baseApiUrl}?war=2025-04-30&get=sids`);
      historySnapshotsData = await snapshotDataRequest.json();
      if (historySnapshotsData.success) {
        let dropdownOptionsString = ``;
        for (let option of historySnapshotsData.results) {
          dropdownOptionsString += `<option value="${option.submissionId}">${
            option.submissionId
          }. ${formatDate(option.createdAt)}</option>`;
        }
        historySnapshotDropdown.innerHTML = dropdownOptionsString;
        let changeEvent = new Event("change");
        historySnapshotDropdown.dispatchEvent(changeEvent);
      }
    }
  });

  historySnapshotDropdown.addEventListener("change", historyLoadSelectedSnapshot);

  function historyLoadSelectedSnapshot() {
    let submissionId = Number.parseInt(historySnapshotDropdown.value ?? "-1");
    if (submissionId === -1) return;
    paintTerritoriesFromApi(`${baseApiUrl}?sid=${submissionId}`);
  }

  historyLoadPreviousButton.addEventListener("click", historyLoadPreviousSnapshot);

  function historyLoadPreviousSnapshot() {
    if (historySnapshotDropdown.selectedIndex - 1 >= 0) {
      historySnapshotDropdown.selectedIndex = historySnapshotDropdown.selectedIndex - 1;
      let submissionId = Number.parseInt(historySnapshotDropdown.value ?? "-1");
      if (submissionId === -1) return;
      paintTerritoriesFromApi(`${baseApiUrl}?sid=${submissionId}`);
    }
  }

  historyLoadNextButton.addEventListener("click", historyLoadNextSnapshot);

  function historyLoadNextSnapshot() {
    if (historySnapshotDropdown.selectedIndex + 1 < historySnapshotDropdown.options.length) {
      historySnapshotDropdown.selectedIndex = historySnapshotDropdown.selectedIndex + 1;
      let submissionId = Number.parseInt(historySnapshotDropdown.value ?? "-1");
      if (submissionId === -1) return;
      paintTerritoriesFromApi(`${baseApiUrl}?sid=${submissionId}`);
    }
  }

  document.body.addEventListener("keyup", (e) => {
    if (!historyViewerEnabled) return;
    if (e.key === historyKeyPrevious) {
      historyLoadPreviousSnapshot();
    } else if (e.key === historyKeyNext) {
      historyLoadNextSnapshot();
    }
  });

  return historyViewerDiv;
}

let layerControl = new L.Control.Layers.Custom(baseMaps, overlayMaps, {
  collapsed: true,
  hideSingleBase: true,
}).addTo(theMap);

// Import data into the overlays.
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
  // Create lines connecting adjacent territories for pathways.
  // I know it'll create duplicate lines on each other, but eh.
  for (let adjacentId of territory.adjacentIds) {
    let adjacentCoords = terrMeta.find((terr) => terr.id === adjacentId).capitol;
    let latlngs = [territory.capitol, adjacentCoords];
    L.polyline(latlngs, {
      opacity: 0.4,
      interactive: false,
    }).addTo(overlayPathways);
  }
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
    territory.lastFaction = territory.factionId;
    paintTerritory(territory.refBounds, faction.color);
  }
}

let lastUpdate = null;
let lastUpdateAttrib = "";

async function paintTerritoriesFromApi(customApiUrl = null) {
  let apiUri = "https://goi-library.drpitlazar.us/api/territory-states";
  if (customApiUrl && typeof customApiUrl === "string") {
    apiUri = customApiUrl;
  }
  // List of all territory IDs. Remove from set when it is painted. Paint remaining with unclaimed.
  let territoryIds = new Set(terrMeta.map((terr) => terr.id));
  let response = await fetch(apiUri);
  if (!response.ok) {
    console.error("API response not OK! :(");
    paintFactionBaseTerritories();
    return;
  }
  let data = await response.json();
  lastUpdate = data.results[0].createdAt;
  // Update attribution.
  attribution.removeAttribution(lastUpdateAttrib);
  let attribText = "";
  if (historyViewerEnabled) {
    let submissionId = historySnapshotDropdown.value;
    attribText = `Historic: #${submissionId}. ${formatDate(lastUpdate)}`;
  } else {
    attribText = `State updated ${timeAgo(lastUpdate)}`;
  }

  attribution.addAttribution(attribText);
  lastUpdateAttrib = attribText;
  // Paint from data.
  for (let territory of data.results) {
    let ref = terrMeta.find((ter) => ter.id === territory.territoryId);
    let faction = factions.find((fac) => fac.id === territory.factionId);
    let color = faction.color;
    ref.lastFaction = territory.factionId;
    paintTerritory(ref.refBounds, color);
    territoryIds.delete(ref.id);
  }
  for (let unclaimedTerritoryId of territoryIds) {
    paintTerritory(terrMeta.find((terr) => terr.id === unclaimedTerritoryId).refBounds);
  }
  updateAllianceModePaint();
}

function formatDate(date) {
  return format(date, "yyyy-MM-dd HH:mm:ss");
}

function timeAgo(date) {
  return formatDistanceToNowStrict(date, { addSuffix: true, roundingMethod: "floor" });
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
    territory.lastFaction = colorToFactionId(color);
    paintTerritory(territory.refBounds, color);
  }
  updateAllianceModePaint();
}

function paintAllTerritoriesRandomized() {
  let colors = [];
  for (let faction in factions) {
    colors.push(factions[faction].color);
  }
  for (let territory of terrMeta) {
    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    territory.lastFaction = colorToFactionId(randomColor);
    paintTerritory(territory.refBounds, randomColor);
  }
  updateAllianceModePaint();
}

function createMonumentMarker(monumentData) {
  return L.marker(monumentData.position, { icon: monumentIcon })
    .bindPopup(`<img src="${monumentData.imageUrl}"/>${monumentData.text}`, {
      className: "monument-image",
    })
    .addTo(overlayMonuments);
}

function updateAllianceModePaint() {
  let applyButton = document.querySelector("#alliance-apply");
  let clickEvent = new Event("click");
  if (allianceMode) {
    applyButton.dispatchEvent(clickEvent);
  }
}

function updateAllianceModeStatus() {
  let allianceStatusElement = document.querySelector("#alliance-status");
  allianceStatusElement.textContent = allianceMode ? "ON" : "OFF";
}

function colorToFactionId(color) {
  return factions.findIndex((fac) => fac.color === color);
}

// run once
await paintTerritoriesFromApi();
updateAllianceModeStatus();
