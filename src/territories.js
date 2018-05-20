import Konva from 'konva';
import vars, { factions } from './vars';
import { stage, layer, eventBus } from './index';
import loadResources from './load_resources';
import data from './territory_data';

const { scale } = vars;

export default function initTerritories(group, writeMessage) {
    for (let node in data) {
        let nodeLine = new Konva.Line({
            points: data[node].boundaries.map(val => val * 0.78),
            fill: data[node].faction ? factions[data[node].faction].color : 'gray',
            closed: true,
            opacity: 0.5,
            x: data[node].position[0],
            y: data[node].position[1],
            draggable: vars.enableDraggableTerritories
        });
        if (vars.enableDraggableTerritories) {
            nodeLine.on('dragend', e => {
                let x = nodeLine.getAbsolutePosition().x - group.getAbsolutePosition().x,
                    y = nodeLine.getAbsolutePosition().y - group.getAbsolutePosition().y + vars.mapOffsetY
                console.log(`[${x}, ${y}]`);
            });
        }
        let nodeCaptiol = new Konva.Circle({
            x: data[node].capitol[0] * scale,
            y: data[node].capitol[1] * scale,
            radius: 6,
            fill: 'white'
        });
        let nodeResourcesGroup = new Konva.Group({
            x: data[node].capitol[0] * scale,
            y: data[node].capitol[1] * scale - 25,
            visible: false
        });
        let nodeResourcesCircle = new Konva.Circle({
            fill: 'orange',
            radius: 16
        });
        let nodeResourcesTextRect = new Konva.Rect({
            fill: '#1b1b13',
            width: 40,
            height: 24,
            offsetY: 12,
            cornerRadius: 10
        });
        let nodeResourcesText = new Konva.Text({
            text: data[node].resourceValue ? data[node].resourceValue.toString() : '',
            fill: 'white',
            fontSize: 16,
            x: 20,
            y: -8
        });
        let nodeResourcesImage = new Image();
        nodeResourcesImage.onload = function () {
            let img = new Konva.Image({
                image: nodeResourcesImage,
                width: 24,
                height: 24,
                offsetX: 12,
                offsetY: 12
            });
            nodeResourcesGroup.add(img);
        }
        nodeResourcesImage.src = data[node].resource ? loadResources[data[node].resource] : loadResources['water'];
        group.add(nodeLine);
        group.add(nodeCaptiol);
        nodeResourcesGroup.add(nodeResourcesCircle);
        nodeResourcesGroup.add(nodeResourcesTextRect);
        nodeResourcesGroup.add(nodeResourcesText)
        nodeResourcesTextRect.moveToBottom();
        group.add(nodeResourcesGroup);
        eventBus.addEventListener("viewSelectChange", e => {
            nodeResourcesGroup.visible(e.target == 'resources' ? true : false);
            layer.draw();
        });
        if (data[node].contested) {
            let { attacker, attackerGoal, attackerProgress, defender, defenderGoal, defenderProgress } = data[node].contested;
            let nodeBattle = new Konva.Group({
                x: data[node].capitol[0],
                y: data[node].capitol[1],
                offsetX: 30,
                offsetY: 75
            });
            let nodeBattleBase = new Konva.Line({
                points: [0, 0, 60, 0, 60, 50, 30, 70, 0, 50],
                fill: 'black',
                closed: true
            });
            let nodeBattleAttacker = new Konva.Rect({
                x: 5,
                y: 5,
                width: 50 * (attackerProgress / attackerGoal),
                height: 6,
                fill: factions[attacker].color
            });
            let nodeBattleDefender = new Konva.Rect({
                x: 5,
                y: 13,
                width: 50 * (defenderProgress / defenderGoal),
                height: 6,
                fill: factions[defender].color
            });
            nodeBattle.add(nodeBattleBase);
            nodeBattle.add(nodeBattleAttacker);
            nodeBattle.add(nodeBattleDefender);
            group.add(nodeBattle);
            eventBus.addEventListener("viewSelectChange", e => {
                nodeBattle.visible(e.target == 'battles' ? true : false);
                layer.draw();
            });
        }
        nodeLine.on('mouseover', function () {
            let msg = data[node].name;
            if (data[node].contested) {
                let { attacker, attackerGoal, attackerProgress, defender, defenderGoal, defenderProgress } = data[node].contested;
                msg += `\n
Attacker: ${attacker}\r
Progress: ${attackerProgress}/${attackerGoal}(${Math.round(attackerProgress / attackerGoal * 100)}%)\n
Defender: ${defender}\r
Progress: ${defenderProgress}/${defenderGoal}(${Math.round(defenderProgress / defenderGoal * 100)}%)
`
            }
            writeMessage(msg);
        });
    }
}
