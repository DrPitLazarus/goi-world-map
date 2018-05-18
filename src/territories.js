import Konva from 'konva';
import vars, { factions } from './vars';
import { stage, layer, eventBus } from './index';
import loadResources from './load_resources';
import territoryBoundaries from './territory_boundries';

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

export const data = {
    tamblair: {
        boundaries: territoryBoundaries[68],
        capitol: [235, 565],
        faction: 'anglea',
        name: 'Tamblair',
        position: [179, 396],
        resource: 'medicine',
        resourceValue: 4
    },
    kinforth: {
        boundaries: territoryBoundaries[16],
        capitol: [317, 476],
        faction: 'anglea',
        name: 'Kinforth',
        position: [263, 390],
        resource: 'medicine',
        resourceValue: 1
    },
    oaxley: {
        boundaries: territoryBoundaries[0],
        capitol: [348, 541],
        faction: 'anglea',
        name: 'Oaxley',
        position: [317, 496],
        resource: 'medicine',
        resourceValue: 3
    },
    utentana: {
        boundaries: territoryBoundaries[38],
        capitol: [549, 535],
        faction: 'anglea',
        name: 'Utentana',
        position: [431, 422],
        resource: 'lumber',
        resourceValue: 4
    },
    cusichaca: {
        boundaries: territoryBoundaries[62],
        capitol: [235, 671],
        faction: 'anglea',
        name: 'Cusichaca',
        position: [156, 653],
        resource: 'mine',
        resourceValue: 3
    },
    hongshiCoast: {
        boundaries: territoryBoundaries[3],
        capitol: [419, 777],
        // contested: {
        //     attacker: "yesha",
        //     attackerProgress: 17000,
        //     attackerGoal: 282000,
        //     defender: "anglea",
        //     defenderProgress: 234000,
        //     defenderGoal: 372000
        // },
        faction: 'anglea',
        name: 'Hongshi Coast',
        position: [299, 759],
        resource: 'medicine',
        resourceValue: 4
    },
    yunin: {
        boundaries: territoryBoundaries[49],
        capitol: [588, 810],
        faction: 'anglea',
        name: 'Yunin',
        position: [513, 714],
        resource: 'farm',
        resourceValue: 2
    },
    paritus: {
        boundaries: territoryBoundaries[50],
        capitol: [677, 712],
        faction: 'baron',
        name: 'Paritus',
        position: [580, 646],
        resource: 'lumber',
        resourceValue: 4
    },
    hanat: {
        boundaries: territoryBoundaries[17],
        capitol: [611, 588],
        faction: 'baron',
        name: 'Hanat',
        position: [529, 574],
        resource: 'oil',
        resourceValue: 3
    },
    qinqaachi: {
        boundaries: territoryBoundaries[55],
        capitol: [749, 500],
        faction: 'baron',
        name: 'Qinqaachi',
        position: [629, 447],
        resource: 'water',
        resourceValue: 0
    },
    ulavaar: {
        boundaries: territoryBoundaries[47],
        capitol: [885, 536],
        faction: 'baron',
        name: 'Ulavaar',
        position: [790, 495],
        resource: 'lumber',
        resourceValue: 4
    },
    anvala: {
        boundaries: territoryBoundaries[58],
        capitol: [875, 727],
        faction: 'baron',
        name: 'Anvala',
        position: [811, 593],
        resource: 'farm',
        resourceValue: 3
    },
    virna: {
        boundaries: territoryBoundaries[40],
        capitol: [840, 809],
        faction: 'baron',
        name: 'Virna',
        position: [770, 687],
        resource: 'oil',
        resourceValue: 4
    },
    urhal: {
        boundaries: territoryBoundaries[43],
        capitol: [984, 748],
        faction: 'baron',
        name: 'Urhal',
        position: [935, 657],
        resource: 'lumber',
        resourceValue: 4
    },
    northlake: {
        boundaries: territoryBoundaries[21],
        capitol: [1078, 603],
        faction: 'baron',
        name: 'Northlake',
        position: [969, 576],
        resource: 'lumber',
        resourceValue: 3
    },
    lordsLeap: {
        boundaries: territoryBoundaries[60],
        capitol: [1148, 770],
        faction: 'baron',
        name: "Lord's Leap",
        position: [1078, 661],
        resource: 'lumber',
        resourceValue: 1
    },
    skyend: {
        boundaries: territoryBoundaries[19],
        capitol: [1080, 798],
        faction: 'baron',
        name: 'Skyend',
        position: [989, 767],
        resource: 'lumber',
        resourceValue: 4
    },
    ravenrock: {
        boundaries: territoryBoundaries[31],
        capitol: [1150, 819],
        faction: 'baron',
        name: 'Ravenrock',
        position: [1088, 790],
        resource: 'mine',
        resourceValue: 3
    },
    glowwater: {
        boundaries: territoryBoundaries[73],
        capitol: [1221, 618],
        faction: 'baron',
        name: 'Glowwater',
        position: [1093, 518],
        resource: 'water',
        resourceValue: 2
    },
    faberia: {
        boundaries: territoryBoundaries[36],
        capitol: [1006, 886],
        faction: 'baron',
        name: 'Faberia',
        position: [931, 779],
        resource: 'oil',
        resourceValue: 4
    },
    aspara: {
        boundaries: territoryBoundaries[22],
        capitol: [1190, 971],
        faction: 'merchant',
        name: 'Aspara',
        position: [933, 893],
        resource: 'oil',
        resourceValue: 4
    },
    bannensRest: {
        boundaries: territoryBoundaries[41],
        capitol: [888, 913],
        faction: 'baron',
        name: "Bannen's Rest",
        position: [827, 832],
        resource: 'mine',
        resourceValue: 3
    },
    fallow: {
        boundaries: territoryBoundaries[12],
        capitol: [766, 868],
        faction: 'baron',
        name: "Fallow",
        position: [652, 801],
        resource: 'oil',
        resourceValue: 3
    },
    cathedral: {
        boundaries: territoryBoundaries[23],
        capitol: [799, 971],
        faction: 'baron',
        name: "Cathedral",
        position: [715, 888],
        resource: 'medicine',
        resourceValue: 4
    },
    aleston: {
        boundaries: territoryBoundaries[33],
        capitol: [695, 943],
        faction: 'anglea',
        name: "Aleston",
        position: [625, 863],
        resource: 'water',
        resourceValue: 0
    },
    suna: {
        boundaries: territoryBoundaries[44],
        capitol: [604, 907],
        faction: 'anglea',
        name: "Suna",
        position: [429, 827],
        resource: 'lumber',
        resourceValue: 3
    },
    jingshan: {
        boundaries: territoryBoundaries[29],
        capitol: [394, 901],
        faction: 'anglea',
        name: "Jingshan",
        position: [234, 831],
        resource: 'medicine',
        resourceValue: 4
    },
    changning: {
        boundaries: territoryBoundaries[71],
        capitol: [294, 1057],
        faction: 'yesha',
        name: "Changning",
        position: [208, 909],
        resource: 'water',
        resourceValue: 1
    },
    wuTower: {
        boundaries: territoryBoundaries[34],
        capitol: [400, 1017],
        faction: 'yesha',
        name: "Wu Tower",
        position: [340, 949],
        resource: 'water',
        resourceValue: 0
    },
    qinjuru: {
        boundaries: territoryBoundaries[61],
        capitol: [511, 987],
        faction: 'yesha',
        name: "Qinjuru",
        position: [429, 887],
        resource: 'water',
        resourceValue: 3
    },
    saltpan: {
        boundaries: territoryBoundaries[15],
        capitol: [576, 1039],
        faction: 'yesha',
        name: "Saltpan",
        position: [532, 977],
        resource: 'medicine',
        resourceValue: 4
    },
    oblivionPass: {
        boundaries: territoryBoundaries[64],
        capitol: [685, 1022],
        faction: 'anglea',
        name: "Oblivion Pass",
        position: [610, 983],
        resource: 'water',
        resourceValue: 3
    },
    garrow: {
        boundaries: territoryBoundaries[27],
        capitol: [747, 1036],
        faction: 'anglea',
        name: "Garrow",
        position: [716, 1006],
        resource: 'water',
        resourceValue: 3
    },
    sunder: {
        boundaries: territoryBoundaries[18],
        capitol: [871, 1029],
        faction: 'merchant',
        name: "Sunder",
        position: [818, 973],
        resource: 'mine',
        resourceValue: 3
    },
    lookout: {
        boundaries: territoryBoundaries[7],
        capitol: [1021, 1032],
        faction: 'merchant',
        name: "Lookout",
        position: [960, 967],
        resource: 'farm',
        resourceValue: 2
    },
    ballast: {
        boundaries: territoryBoundaries[11],
        capitol: [1152, 1070],
        faction: 'merchant',
        name: "Ballast",
        position: [1057, 994],
        resource: 'mine',
        resourceValue: 4
    },
    troydon: {
        boundaries: territoryBoundaries[14],
        capitol: [1218, 1162],
        faction: 'merchant',
        name: "Troydon",
        position: [1021, 1072],
        resource: 'lumber',
        resourceValue: 2
    },
    boomtown: {
        boundaries: territoryBoundaries[10],
        capitol: [1008, 1088],
        faction: 'merchant',
        name: "Boomtown",
        position: [921, 1047],
        resource: 'mine',
        resourceValue: 3
    },
    jacksonHole: {
        boundaries: territoryBoundaries[20],
        capitol: [936, 1124],
        faction: 'merchant',
        name: "Jackson Hole",
        position: [854, 1090],
        resource: 'farm',
        resourceValue: 4
    },
    albys: {
        boundaries: territoryBoundaries[46],
        capitol: [908, 1279],
        faction: 'merchant',
        name: "Albys",
        position: [764, 1118],
        resource: 'farm',
        resourceValue: 4
    },
    orrington: {
        boundaries: territoryBoundaries[72],
        capitol: [596, 1147],
        faction: 'arashi',
        name: "Orrington",
        position: [541, 1051],
        resource: 'lumber',
        resourceValue: 3
    },
    sanctuary: {
        boundaries: territoryBoundaries[67],
        capitol: [486, 1172],
        faction: 'arashi',
        name: "Sanctuary",
        position: [432, 1054],
        resource: 'water',
        resourceValue: 3
    },
    yaoLingPass: {
        boundaries: territoryBoundaries[56],
        capitol: [359, 1195],
        faction: 'arashi',
        name: "Yao Ling Pass",
        position: [264, 1093],
        resource: 'oil',
        resourceValue: 3
    },
    luTower: {
        boundaries: territoryBoundaries[35],
        capitol: [235, 1154],
        faction: 'arashi',
        name: "Lu Tower",
        position: [175, 1090],
        resource: 'water',
        resourceValue: 3
    },
    baiHuaHills: {
        boundaries: territoryBoundaries[1],
        capitol: [260, 1236],
        faction: 'arashi',
        name: "Bai Hua Hills",
        position: [178, 1219],
        resource: 'mine',
        resourceValue: 2
    },
    dragontown: {
        boundaries: territoryBoundaries[39],
        capitol: [466, 1266],
        faction: 'arashi',
        name: "Dragontown",
        position: [292, 1211],
        resource: 'medicine',
        resourceValue: 3
    },
    faron: {
        boundaries: territoryBoundaries[69],
        capitol: [645, 1250],
        faction: 'arashi',
        name: "Faron",
        position: [482, 1212],
        resource: 'farm',
        resourceValue: 3
    },
    landmark: {
        boundaries: territoryBoundaries[51],
        capitol: [578, 1443],
        faction: 'arashi',
        name: "Landmark",
        position: [447, 1380],
        resource: 'farm',
        resourceValue: 4
    },
    naufrage: {
        boundaries: territoryBoundaries[5],
        capitol: [430, 1370],
        faction: 'arashi',
        name: "Naufrage",
        position: [355, 1336],
        resource: 'water',
        resourceValue: 3
    },
    sabbia: {
        boundaries: territoryBoundaries[26],
        capitol: [348, 1356],
        faction: 'arashi',
        name: "Sabbia",
        position: [285, 1283],
        resource: 'oil',
        resourceValue: 2
    },
    flyaway: {
        boundaries: territoryBoundaries[45],
        capitol: [211, 1344],
        faction: 'arashi',
        name: "Flyaway",
        position: [182, 1273],
        resource: 'water',
        resourceValue: 3
    },
    canon: {
        boundaries: territoryBoundaries[13],
        capitol: [306, 1464],
        faction: 'arashi',
        name: "Canon",
        position: [239, 1376],
        resource: 'medicine',
        resourceValue: 3
    },
    alleron: {
        boundaries: territoryBoundaries[70],
        capitol: [382, 1543],
        faction: 'arashi',
        name: "Alleron",
        position: [286, 1420],
        resource: 'farm',
        resourceValue: 1
    },
    caldera: {
        boundaries: territoryBoundaries[37],
        capitol: [578, 1566],
        faction: 'arashi',
        name: "Caldera",
        position: [453, 1514],
        resource: 'lumber',
        resourceValue: 3
    },
    kire: {
        boundaries: territoryBoundaries[52],
        capitol: [743, 1586],
        name: "Kire",
        position: [625, 1459]
    },
    sabakumura: {
        boundaries: territoryBoundaries[24],
        capitol: [885, 1563],
        name: "Sabakumura",
        position: [786, 1523]
    },
    selogorod: {
        boundaries: territoryBoundaries[30],
        capitol: [1020, 1557],
        name: "Selogorod",
        position: [913, 1519]
    },
    orlevsela: {//FIX
        boundaries: territoryBoundaries[8],
        capitol: [1029, 1486],
        name: "Orlevsela",
        position: [869, 1437]
    },
    starostrog: {
        boundaries: territoryBoundaries[4],
        capitol: [1103, 1417],
        name: "Starostrog",
        position: [1038, 1414]
    },
    vyshtorg: {
        boundaries: territoryBoundaries[54],
        capitol: [1142, 1584],
        name: "Vyshtorg",
        position: [1046, 1471]
    },
    vamaRea: {
        boundaries: territoryBoundaries[66],
        capitol: [1225, 1368],
        name: "Vama Rea",
        position: [1163, 1321]
    },
    morMare: {
        boundaries: territoryBoundaries[59],
        capitol: [1391, 1496],
        name: "Mor Mare",
        position: [1233, 1382]
    },
    andelata: {
        boundaries: territoryBoundaries[42],
        capitol: [1590, 1367],
        name: "Andelata",
        position: [1467, 1325]
    },
    lirodunum: {
        boundaries: territoryBoundaries[25],
        capitol: [1638, 1295],
        name: "Lirodunum",
        position: [1599, 1256]
    },
    beldusios: {
        boundaries: territoryBoundaries[32],
        capitol: [1781, 1240],
        name: "Beldusios",
        position: [1687, 1235]
    },
    allonia: {
        boundaries: territoryBoundaries[53],
        capitol: [1761, 1078],
        name: "Allonia",
        position: [1660, 995]
    },
    lutessa: {
        boundaries: territoryBoundaries[57],
        capitol: [1633, 1184],
        name: "Lutessa",
        position: [1568, 1014]
    },
    averna: {
        boundaries: territoryBoundaries[48],
        capitol: [1602, 989],
        name: "Averna",
        position: [1561, 876]
    },
    anthos: {
        boundaries: territoryBoundaries[65],
        capitol: [1579, 878],
        name: "Anthos",
        position: [1535, 736]
    },
    lascus: {
        boundaries: territoryBoundaries[63],
        capitol: [1487, 1002],
        name: "Lascus",
        position: [1410, 820]
    },
    itonia: {
        boundaries: territoryBoundaries[74],
        capitol: [1409, 897],
        name: "Itonia",
        position: [1399, 630]
    },
    serpentsPoint: {
        boundaries: territoryBoundaries[6],
        capitol: [1326, 770],
        name: "Serpent's Point",
        position: [1300, 711]
    },
    blackcliff: {
        boundaries: territoryBoundaries[2],
        capitol: [1284, 820],
        name: "Blackcliff",
        position: [1226, 775]
    }
}
