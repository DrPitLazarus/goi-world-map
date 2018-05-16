import 'konva';
import mapImageUrl from '../assets/map.png';
import initTerritories from './territories';

let width = window.innerWidth,
    height = window.innerHeight,
    scale = 1;

let stage = new Konva.Stage({
    container: 'main',
    width,
    height
});

let layer = new Konva.Layer();
let textLayer = new Konva.Layer();

let group = new Konva.Group({
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
        if (pos.y > 0) {
            y = 0;
        }
        if (height - Math.floor(imageObj.height * scale) > pos.y) {
            y = height - Math.floor(imageObj.height * scale);
        }
        return { x, y }
    }
});

let text = new Konva.Text({
    x: 0,
    y: 0,
    fontFamily: 'Arial',
    fontSize: 22,
    text: 'hover over a territory',
    fill: 'teal',
    // width: 300
});

let textXY = new Konva.Text({
    x: width - 100,
    width,
    fontFamily: 'Arial',
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

    group.add(img);
    img.moveToBottom();
    layer.draw();
};
imageObj.src = mapImageUrl;

initTerritories(scale, group, function (newMsg) {
    text.setText(newMsg);
    textLayer.draw();
});

layer.add(group);

textLayer.add(text);
textLayer.add(textXY);
stage.add(layer);
stage.add(textLayer);

// Show xy coords on image 
stage.on('mousemove', function () {
    let pos = stage.getPointerPosition() || { x: 0, y: 0 };
    textXY.setText(`x: ${(pos.x - group.getAbsolutePosition().x)}\ny: ${pos.y - group.getAbsolutePosition().y}`);
    textLayer.draw();
})