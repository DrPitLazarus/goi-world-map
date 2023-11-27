import L from "leaflet";
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
  .attribution({ prefix: "Map Image &copy; Muse Games" })
  .addTo(theMap);
attribution.addAttribution(
  '<a href="https://leafletjs.com" target="_blank">Leaflet</a>'
);

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
  .on("click", (e) => paintTerritory(e.sourceTarget, painterColor))
  .addTo(theMap);
let overlayCapitols = L.layerGroup().addTo(theMap);
let overlayMonuments = L.featureGroup().addTo(theMap);

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
      if (e.target.value == "unclaimed")
        return (painterColor = PAINTER_COLOR_UNCLAIMED);
      painterColor = factions[e.target.value].color;
    });

    // populate painter paints
    let toAddToInnerHtml = "";
    toAddToInnerHtml += `<label><input type="radio" class="leaflet-control-layers-selector" name="painter-radio" value="unclaimed" checked> Unclaimed</label>`;
    for (let faction in factions) {
      toAddToInnerHtml += `<label><input type="radio" class="leaflet-control-layers-selector" name="painter-radio" value="${faction}"> ${factions[faction].name}</label>`;
    }
    painterPaints.innerHTML = toAddToInnerHtml;

    // buttons
    let painterReset = document.querySelector("#painter-reset");
    painterReset.addEventListener("click", resetAllTerritoriesPaint);

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

let refTerritories = {};
// import territory bounds data
terrBounds.forEach((territory) => {
  let name = territory[0];
  let ref = L.polygon(territory[1], {
    color: PAINTER_COLOR_UNCLAIMED,
    weight: 1,
    interactive: painterEnabled,
  }).addTo(overlayTerritory);
  refTerritories[name] = ref;
});
// import capitol data
terrMeta.forEach((meta) => {
  L.circleMarker(meta.capitol, {
    radius: 5,
    color: "#fff",
    fillOpacity: 1,
    weight: 1,
    interactive: false,
  }).addTo(overlayCapitols);
});

let monumentIcon = L.icon({
  iconUrl: assetMonumentIcon,
  iconSize: [64, 64],
  iconAnchor: [32, 32],
  popupAnchor: [0, -16],
});
monumentData.forEach((monument) => {
  createMonumentMarker(monument);
});

// the original 7 factions: https://trello.com/c/Ev9RfFv5/126-the-7-factions
function paintFactionBaseTerritories() {
  let angelanTerritories = [
    "kinforth",
    "tamblair",
    "oaxley",
    "utentana",
    "cusichaca",
    "hongshiCoast",
    "hanat",
    "qinqaachi",
    "ulavaar",
  ];
  angelanTerritories.forEach((territory) => {
    paintTerritory(refTerritories[territory], factions.anglea.color);
  });
  let baronTerritories = [
    "lordsLeap",
    "anvala",
    "urhal",
    "northlake",
    "glowwater",
    "skyend",
    "ravenrock",
    "blackcliff",
    "serpentsPoint",
  ];
  baronTerritories.forEach((territory) => {
    paintTerritory(refTerritories[territory], factions.baron.color);
  });
  let chaladonTerritories = [
    "averna",
    "itonia",
    "anthos",
    "lascus",
    "allonia",
    "lutessa",
    "ballast",
    "beldusios",
    "lirodunum",
  ];
  chaladonTerritories.forEach((territory) => {
    paintTerritory(refTerritories[territory], factions.chaladon.color);
  });
  let merchantTerritories = [
    "vyshtorg",
    "troydon",
    "sabakumura",
    "orlevsela",
    "selogorod",
    "starostrog",
    "vamaRea",
    "morMare",
    "andelata",
  ];
  merchantTerritories.forEach((territory) => {
    paintTerritory(refTerritories[territory], factions.merchant.color);
  });
  let arashiTerritories = [
    "alleron",
    "flyaway",
    "sabbia",
    "canon",
    "naufrage",
    "faron",
    "landmark",
    "caldera",
    "kire",
  ];
  arashiTerritories.forEach((territory) => {
    paintTerritory(refTerritories[territory], factions.arashi.color);
  });
  let yeshaTerritories = [
    "changning",
    "jingshan",
    "qinjuru",
    "wuTower",
    "sanctuary",
    "yaoLingPass",
    "luTower",
    "baiHuaHills",
    "dragontown",
  ];
  yeshaTerritories.forEach((territory) => {
    paintTerritory(refTerritories[territory], factions.yesha.color);
  });
}

function resetAllTerritoriesPaint() {
  paintAllTerritories(PAINTER_COLOR_UNCLAIMED);
  paintFactionBaseTerritories();
}

function paintTerritory(ref, color = PAINTER_COLOR_UNCLAIMED) {
  ref.setStyle({ color: color });
}

function paintAllTerritories(color = PAINTER_COLOR_UNCLAIMED) {
  for (let territory in refTerritories) {
    paintTerritory(refTerritories[territory], color);
  }
}

function paintAllTerritoriesRandomized() {
  let colors = [];
  for (let faction in factions) {
    colors.push(factions[faction].color);
  }
  for (let territory in refTerritories) {
    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    paintTerritory(refTerritories[territory], randomColor);
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
paintFactionBaseTerritories();
