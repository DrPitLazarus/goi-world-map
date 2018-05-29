import Konva from 'konva'
import vars, { factions } from './vars'
import { stage, layer, group, eventBus } from './index'
import loadResources from './load_resources'
import data from './territory_data'


export default function initTerritories(writeMessage) {
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
        nodeLine.transformsEnabled('position');
        if (vars.enableDraggableTerritories) {
            nodeLine.on('dragend', e => {
                let x = nodeLine.getAbsolutePosition().x - group.getAbsolutePosition().x,
                    y = nodeLine.getAbsolutePosition().y - group.getAbsolutePosition().y + vars.mapOffsetY
                console.log(`[${x}, ${y}]`);
            });
        }
        let nodeCaptiol = new Konva.Circle({
            x: data[node].capitol[0] * vars.scale,
            y: data[node].capitol[1] * vars.scale,
            radius: 6,
            fill: 'white',
            listening: false
        });
        nodeCaptiol.transformsEnabled('position');
        group.add(nodeLine);
        group.add(nodeCaptiol);
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
