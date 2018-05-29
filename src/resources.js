import Konva from 'konva'
import { layer, group, eventBus } from './index'
import vars from './vars'
import data from './territory_data'
import loadResources from './load_resources'


export default function initResources() {
    for (let node in data) {
        let resourcesGroup = new Konva.Group({
            x: data[node].capitol[0] * vars.scale,
            y: data[node].capitol[1] * vars.scale - 25,
            visible: false,
            listening: false,
            name: 'resourcesGroup'
        });
        resourcesGroup.transformsEnabled('position');
        let resourcesCircle = new Konva.Circle({
            fill: '#ddd',
            radius: 16,
            listening: false
        });
        resourcesCircle.transformsEnabled('position');
        let resourcesTextRect = new Konva.Rect({
            fill: '#1b1b13',
            width: 40,
            height: 24,
            y: -12,
            cornerRadius: 10,
            listening: false
        });
        resourcesTextRect.transformsEnabled('position');
        let resourcesText = new Konva.Text({
            text: data[node].resourceValue ? data[node].resourceValue.toString() : '?',
            fill: 'white',
            fontSize: 16,
            x: 20,
            y: -8,
            listening: false
        });
        resourcesText.transformsEnabled('position');
        let resourcesImage = new Image();
        resourcesImage.onload = function () {
            let img = new Konva.Image({
                image: resourcesImage,
                width: 24,
                height: 24,
                x: -12,
                y: -12,
                listening: false
            });
            img.transformsEnabled('position');
            resourcesGroup.add(img);
        }
        resourcesImage.src = data[node].resource ? loadResources[data[node].resource] : loadResources['water'];
        resourcesGroup.add(resourcesCircle);
        resourcesGroup.add(resourcesTextRect);
        resourcesGroup.add(resourcesText)
        resourcesTextRect.moveToBottom();
        group.add(resourcesGroup);
        eventBus.addEventListener("viewSelectChange", e => {
            resourcesGroup.visible(e.target == 'resources' ? true : false);
            layer.batchDraw();
        });
    }
}
