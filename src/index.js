import Konva from 'konva'
import EventBus from 'eventbusjs'
import _ from 'lodash'
import vars from './vars'
import mapImageUrl from '../assets/map.png'
import mapWallImageUrl from '../assets/map_wall.png'
import initTerritories from './territories'
import initResources from './resources'
import initBattles from './battles'
import rawData from './territory_data'

const { width, height, scale, mapOffsetY } = vars;

export let eventBus = EventBus;
document.querySelector('#viewSelect').addEventListener('change', e => {
    eventBus.dispatch("viewSelectChange", e.target.value);
})

export let stage = new Konva.Stage({
    container: 'main',
    width,
    height
});

export let layer = new Konva.Layer();
let textLayer = new Konva.Layer();

export let group = new Konva.Group({
    offsetY: mapOffsetY,
    draggable: true,
    dragBoundFunc(pos) {
        let x = pos.x,
            y = pos.y;
        if (pos.x > 0) {
            x = 0;
        }
        if (width - Math.floor(imageObj.width * scale) > pos.x) {
            x = width - Math.floor(imageObj.width * scale);
        }
        if (pos.y > 0 + mapOffsetY) {
            y = 0 + mapOffsetY;
        }
        if (height + mapOffsetY - Math.floor(imageObj.height * scale) > pos.y) {
            y = height + mapOffsetY - Math.floor(imageObj.height * scale);
        }
        return { x, y }
    }
});

let text = new Konva.Text({
    fontSize: 22,
    text: 'hover over a territory',
    fill: 'white'
});

let textXY = new Konva.Text({
    x: width - 100,
    width: width,
    fontSize: 18,
    text: '',
    fill: 'teal'
});


let imageObj = new Image();
imageObj.onload = function () {
    let img = new Konva.Image({
        fill: '#080702',
        image: imageObj,
        width: 2048 * scale,
        height: 2048 * scale
    });
    img.transformsEnabled('position');
    group.add(img);
    img.moveToBottom();
    layer.batchDraw();
};
imageObj.src = mapImageUrl;

let mapWallImage = new Image();
mapWallImage.onload = function () {
    let img = new Konva.Image({
        image: mapWallImage,
        width: 305,
        height: 305,
        x: 702,
        y: 885,
        listening: false,
        name: 'mapWall'
    });
    img.transformsEnabled('position');
    group.add(img);
    layer.batchDraw();
    layer.find('.mapWall').moveToTop();
    layer.find('.resourcesGroup').forEach(node => node.moveToTop());
}
mapWallImage.src = mapWallImageUrl;

fetch('https://drpitlazar.us/goi/sample-map.php')
    .then(r => r.json())
    .then(function (r) {
        let data = _.merge(r, rawData);
        initTerritories(data, function (newMsg) {
            text.setText(newMsg);
            textLayer.batchDraw();
        });
        initBattles(data);
        initResources(data);
        layer.find('.mapWall').moveToTop();
        layer.find('.resourcesGroup').forEach(node => node.moveToTop());
    });


layer.add(group);

textLayer.add(text);
textLayer.add(textXY);
stage.add(layer);
stage.add(textLayer);

// Show xy coords on image 
if (vars.showPointerCoords) {
    stage.on('mousemove', function () {
        let pos = stage.getPointerPosition() || { x: 0, y: 0 };
        let x = pos.x - group.getAbsolutePosition().x,
            y = pos.y - group.getAbsolutePosition().y + mapOffsetY;
        textXY.setText(`x: ${x}\ny: ${y}`);
        textLayer.draw();
    });
}

if (module.hot) {
    module.hot.accept(() => {
        window.location.reload();
    });
}