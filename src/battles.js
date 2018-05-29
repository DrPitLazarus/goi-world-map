import Konva from 'konva'
import { layer, group, eventBus } from './index'
import { factions } from './vars'
import data from './territory_data'


export default function initBattles() {
    for (let node in data) {
        if (!data[node].contested) continue;
        let { attacker, attackerGoal, attackerProgress, defender, defenderGoal, defenderProgress } = data[node].contested;
        let battleGroup = new Konva.Group({
            x: data[node].capitol[0],
            y: data[node].capitol[1],
            offsetX: 30,
            offsetY: 75,
            name: 'battlesGroup'
        });
        let battleBase = new Konva.Line({
            points: [0, 0, 60, 0, 60, 50, 30, 70, 0, 50],
            fill: 'black',
            closed: true
        });
        let battleAttacker = new Konva.Rect({
            x: 5,
            y: 5,
            width: 50 * (attackerProgress / attackerGoal),
            height: 6,
            fill: factions[attacker].color
        });
        let battleDefender = new Konva.Rect({
            x: 5,
            y: 13,
            width: 50 * (defenderProgress / defenderGoal),
            height: 6,
            fill: factions[defender].color
        });
        battleGroup.add(battleBase);
        battleGroup.add(battleAttacker);
        battleGroup.add(battleDefender);
        group.add(battleGroup);
        eventBus.addEventListener("viewSelectChange", e => {
            battleGroup.visible(e.target == 'battles' ? true : false);
            layer.batchDraw();
        });
    }

}

function createFactionImages() {
    
}