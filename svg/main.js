const map = document.querySelector("#map")
const mapTerritories = document.querySelector("#map-territories")
const svgNS = 'http://www.w3.org/2000/svg'



function createMapGroup(_id) {
	let newEl = document.createElementNS(svgNS, "g")
	newEl.id = _id
	map.appendChild(newEl)
	return newEl
}

const mapLabels = createMapGroup("map-labels")

/* Create territory labels */
for (let val in territories) {
	let newEl = document.createElementNS(svgNS, "text")
	newEl.textContent = territories[val].name
	newEl.setAttributeNS(null, "x", territories[val].position[0])
	newEl.setAttributeNS(null, "y", territories[val].position[1])
	if (territories[val].isHomeCapitol === true) {
		newEl.setAttributeNS(null, "class", "capitol-label ignore")
	} else {
		newEl.setAttributeNS(null, "class", "territory-label ignore")
	}
	mapLabels.appendChild(newEl)
}
 
 // Create circles
for (let val in territories) {
	let newEl = document.createElementNS(svgNS, "circle")
	newEl.textContent = territories[val].name
	newEl.setAttributeNS(null, "cx", territories[val].capitol[0])
	newEl.setAttributeNS(null, "cy", territories[val].capitol[1])
	if (territories[val].isHomeCapitol === true) {
		newEl.setAttributeNS(null, "r", 8)
	} else {
		newEl.setAttributeNS(null, "r", 6)
	}
	newEl.setAttributeNS(null, "class", "ignore")
	mapTerritories.appendChild(newEl)
}


// Start
const panZoom = svgPanZoom('svg')