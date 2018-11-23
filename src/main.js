const L = require('leaflet')


let theMap = L.map('map', { 
    attributionControl: false,
    center: [256, 256],
    crs: L.CRS.Simple,
    maxBounds: [[-100,-100],[612,612]],
    zoom: 2
})

let attribution = L.control.attribution({ prefix: "Map Image &copy; Muse Games" }).addTo(theMap)

let imageUrl = "map.png",
    imageBounds = [[0,0],[512,512]]

let imgOverlay = L.imageOverlay(imageUrl, imageBounds).addTo(theMap)