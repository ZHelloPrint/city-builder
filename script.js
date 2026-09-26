/* =========================================================
   METROFORGE
   MILESTONE 1
   PLAYABLE CITY-BUILDER FOUNDATION
========================================================= */


/* =========================================================
   GAME STATE
========================================================= */

const city = {

    money: 50000,

    population: 0,

    jobs: 0,

    happiness: 75,

    day: 1,

    minutes: 480,

    speed: 0,

    demand: {
        residential: 65,
        commercial: 45,
        industrial: 55
    },

    roads: [],

    zones: [],

    buildings: [],

    objects: [],

    selectedTool: "select",

    selectedObject: null

};


/* =========================================================
   CONSTANTS
========================================================= */

const WORLD_SIZE = 260;

const GRID_SIZE = 4;

const WATER_LEVEL = 0.4;

const ROAD_WIDTH = 5;

const ROAD_COST_PER_METER = 35;

const ZONE_SIZE = 8;

const BUILDING_COST = {
    residential: 700,
    commercial: 950,
    industrial: 850
};


/* =========================================================
   THREE.JS SETUP
========================================================= */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x8f9daa);

scene.fog =
    new THREE.Fog(
        0x8f9daa,
        130,
        430
    );


const camera =
    new THREE.PerspectiveCamera(
        55,
        innerWidth / innerHeight,
        0.1,
        1000
    );


const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    innerWidth,
    innerHeight
);

renderer.setPixelRatio(
    Math.min(devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document
    .getElementById("game")
    .appendChild(renderer.domElement);


/* =========================================================
   LIGHTING
========================================================= */

const hemisphere =
    new THREE.HemisphereLight(
        0xddeeff,
        0x405044,
        2.1
    );

scene.add(hemisphere);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

sun.position.set(
    100,
    140,
    80
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -180;
sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180;
sun.shadow.camera.bottom = -180;

scene.add(sun);


/* =========================================================
   TERRAIN
========================================================= */

function terrainHeight(x, z) {

    const large =
        Math.sin(x * 0.045) *
        Math.cos(z * 0.04) *
        3.2;

    const medium =
        Math.sin(x * 0.105 + z * 0.065) *
        1.0;

    const small =
        Math.sin(x * 0.19) *
        Math.cos(z * 0.14) *
        0.35;

    return (
        large +
        medium +
        small +
        1.2
    );
}


const terrainGeometry =
    new THREE.PlaneGeometry(
        WORLD_SIZE,
        WORLD_SIZE,
        100,
        100
    );

const vertices =
    terrainGeometry.attributes.position;

for (
    let i = 0;
    i < vertices.count;
    i++
) {

    const x =
        vertices.getX(i);

    const y =
        vertices.getY(i);

    vertices.setZ(
        i,
        terrainHeight(x, y)
    );
}

terrainGeometry.computeVertexNormals();


const terrainMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x66785f,
        roughness: 1
    });


const terrain =
    new THREE.Mesh(
        terrainGeometry,
        terrainMaterial
    );

terrain.rotation.x =
    -Math.PI / 2;

terrain.receiveShadow = true;

terrain.userData.type =
    "terrain";

scene.add(terrain);


/* =========================================================
   WATER
========================================================= */

const waterGeometry =
    new THREE.PlaneGeometry(
        80,
        WORLD_SIZE
    );

const waterMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x456f8c,
        transparent: true,
        opacity: 0.78,
        roughness: 0.25,
        metalness: 0.1
    });

const water =
    new THREE.Mesh(
        waterGeometry,
        waterMaterial
    );

water.rotation.x =
    -Math.PI / 2;

water.position.set(
    -91,
    WATER_LEVEL,
    0
);

scene.add(water);


/* =========================================================
   GRID
========================================================= */

const grid =
    new THREE.GridHelper(
        WORLD_SIZE,
        WORLD_SIZE / GRID_SIZE,
        0x58645a,
        0x69736b
    );

grid.position.y =
    0.12;

grid.material.opacity =
    0.18;

grid.material.transparent =
    true;

scene.add(grid);


/* =========================================================
   NATURE
========================================================= */

const natureGroup =
    new THREE.Group();

scene.add(natureGroup);


function createTree(x, z) {

    const group =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.18,
                0.23,
                1.4,
                6
            ),
            new THREE.MeshStandardMaterial({
                color: 0x62452d
            })
        );

    trunk.position.y =
        terrainHeight(x, z) + 0.7;


    const crown =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                1.1,
                2.6,
                7
            ),
            new THREE.MeshStandardMaterial({
                color: 0x304f37
            })
        );

    crown.position.y =
        terrainHeight(x, z) + 2.2;

    group.add(
        trunk,
        crown
    );

    group.position.x = x;
    group.position.z = z;

    group.userData.type =
        "tree";

    natureGroup.add(group);
}


function createRock(x, z) {

    const rock =
        new THREE.Mesh(
            new THREE.DodecahedronGeometry(
                0.7 + Math.random() * 0.8,
                0
            ),
            new THREE.MeshStandardMaterial({
                color: 0x686d69,
                roughness: 1
            })
        );

    rock.position.set(
        x,
        terrainHeight(x, z) + 0.4,
        z
    );

    rock.rotation.y =
        Math.random() * Math.PI;

    rock.userData.type =
        "rock";

    natureGroup.add(rock);
}


for (
    let i = 0;
    i < 130;
    i++
) {

    const x =
        -50 +
        Math.random() * 170;

    const z =
        -115 +
        Math.random() * 230;

    if (
        terrainHeight(x, z) > 2.0
    ) {

        createTree(x, z);

    }
}


for (
    let i = 0;
    i < 45;
    i++
) {

    const x =
        -45 +
        Math.random() * 160;

    const z =
        -115 +
        Math.random() * 230;

    createRock(x, z);
}


/* =========================================================
   CAMERA
========================================================= */

let cameraDistance = 105;

let cameraYaw = Math.PI / 4;

let cameraPitch = 0.72;

const cameraTarget =
    new THREE.Vector3(
        20,
        0,
        0
    );


const cameraVelocity =
    new THREE.Vector3();

let cameraDragging = false;

let rightDragging = false;

let moved = false;

let previousMouse = {
    x: 0,
    y: 0
};


const keys = {};


window.addEventListener(
    "keydown",
    event => {

        keys[event.key.toLowerCase()] =
            true;

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.key.toLowerCase()] =
            false;

    }
);


renderer.domElement.addEventListener(
    "contextmenu",
    e => e.preventDefault()
);


renderer.domElement.addEventListener(
    "pointerdown",
    event => {

        cameraDragging = true;

        rightDragging =
            event.button === 2;

        moved = false;

        previousMouse.x =
            event.clientX;

        previousMouse.y =
            event.clientY;

        renderer.domElement.setPointerCapture(
            event.pointerId
        );

    }
);


window.addEventListener(
    "pointerup",
    () => {

        cameraDragging = false;
        rightDragging = false;

    }
);


window.addEventListener(
    "pointermove",
    event => {

        if (!cameraDragging)
            return;

        const dx =
            event.clientX -
            previousMouse.x;

        const dy =
            event.clientY -
            previousMouse.y;

        if (
            Math.abs(dx) +
            Math.abs(dy) > 3
        ) {

            moved = true;

        }

        previousMouse.x =
            event.clientX;

        previousMouse.y =
            event.clientY;


        if (rightDragging) {

            const speed =
                cameraDistance * 0.0015;

            const forward =
                new THREE.Vector3(
                    Math.sin(cameraYaw),
                    0,
                    Math.cos(cameraYaw)
                );

            const right =
                new THREE.Vector3(
                    Math.cos(cameraYaw),
                    0,
                    -Math.sin(cameraYaw)
                );

            cameraTarget.add(
                right.multiplyScalar(
                    -dx * speed
                )
            );

            cameraTarget.add(
                forward.multiplyScalar(
                    dy * speed
                )
            );

        } else {

            cameraYaw -=
                dx * 0.008;

            cameraPitch -=
                dy * 0.006;

            cameraPitch =
                clamp(
                    cameraPitch,
                    0.25,
                    1.35
                );

        }

    }
);


renderer.domElement.addEventListener(
    "wheel",
    event => {

        cameraDistance +=
            event.deltaY * 0.08;

        cameraDistance =
            clamp(
                cameraDistance,
                15,
                180
            );

    }
);


function updateCamera(delta) {

    let forwardX =
        Math.sin(cameraYaw);

    let forwardZ =
        Math.cos(cameraYaw);

    let rightX =
        Math.cos(cameraYaw);

    let rightZ =
        -Math.sin(cameraYaw);


    const movement =
        35 *
        delta *
        Math.max(
            1,
            cameraDistance / 70
        );


    if (keys.w) {

        cameraTarget.x -=
            forwardX * movement;

        cameraTarget.z -=
            forwardZ * movement;

    }

    if (keys.s) {

        cameraTarget.x +=
            forwardX * movement;

        cameraTarget.z +=
            forwardZ * movement;

    }

    if (keys.a) {

        cameraTarget.x -=
            rightX * movement;

        cameraTarget.z -=
            rightZ * movement;

    }

    if (keys.d) {

        cameraTarget.x +=
            rightX * movement;

        cameraTarget.z +=
            rightZ * movement;

    }


    cameraTarget.x =
        clamp(
            cameraTarget.x,
            -115,
            115
        );

    cameraTarget.z =
        clamp(
            cameraTarget.z,
            -115,
            115
        );


    const x =
        cameraTarget.x +
        Math.sin(cameraYaw) *
        Math.cos(cameraPitch) *
        cameraDistance;

    const y =
        cameraTarget.y +
        Math.sin(cameraPitch) *
        cameraDistance;

    const z =
        cameraTarget.z +
        Math.cos(cameraYaw) *
        Math.cos(cameraPitch) *
        cameraDistance;


    camera.position.lerp(
        new THREE.Vector3(
            x,
            y,
            z
        ),
        0.12
    );

    camera.lookAt(
        cameraTarget
    );
}


/* =========================================================
   RAYCASTING
========================================================= */

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


function getTerrainPoint(event) {

    const rect =
        renderer.domElement
        .getBoundingClientRect();

    mouse.x =
        ((event.clientX - rect.left) /
            rect.width) *
        2 - 1;

    mouse.y =
        -((event.clientY - rect.top) /
            rect.height) *
        2 + 1;

    raycaster.setFromCamera(
        mouse,
        camera
    );

    const hits =
        raycaster.intersectObject(
            terrain
        );

    if (!hits.length)
        return null;

    return hits[0].point.clone();
}


function getObjectAt(event) {

    const rect =
        renderer.domElement
        .getBoundingClientRect();

    mouse.x =
        ((event.clientX - rect.left) /
            rect.width) *
        2 - 1;

    mouse.y =
        -((event.clientY - rect.top) /
            rect.height) *
        2 + 1;

    raycaster.setFromCamera(
        mouse,
        camera
    );

    const targets =
        city.objects.concat(
            city.zones
        );

    const hits =
        raycaster.intersectObjects(
            targets,
            true
        );

    if (!hits.length)
        return null;

    let object =
        hits[0].object;

    while (
        object.parent &&
        !city.objects.includes(object) &&
        !city.zones.includes(object)
    ) {

        object =
            object.parent;

    }

    return object;
}


/* =========================================================
   SNAP
========================================================= */

function snap(value) {

    return Math.round(
        value / GRID_SIZE
    ) * GRID_SIZE;

}


function snapPoint(point) {

    return new THREE.Vector3(
        snap(point.x),
        terrainHeight(
            snap(point.x),
            snap(point.z)
        ),
        snap(point.z)
    );

}


/* =========================================================
   ROAD SYSTEM
========================================================= */

const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x292c30,
        roughness: 0.92
    });


const roadEdgeMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x41454a,
        roughness: 0.85
    });


let roadStart = null;

let roadPreview = null;


function removeRoadPreview() {

    if (!roadPreview)
        return;

    scene.remove(
        roadPreview
    );

    roadPreview.geometry.dispose();

    roadPreview.material.dispose();

    roadPreview = null;
}


function getRoadAngle(start, end) {

    return Math.atan2(
        end.x - start.x,
        end.z - start.z
    );

}


function createRoadMesh(
    start,
    end,
    preview = false
) {

    const distance =
        start.distanceTo(end);

    if (distance < 0.5)
        return null;


    const geometry =
        new THREE.BoxGeometry(
            ROAD_WIDTH,
            0.24,
            distance
        );


    const material =
        preview
            ? new THREE.MeshStandardMaterial({
                color: 0x9ca5ab,
                transparent: true,
                opacity: 0.6
            })
            : roadMaterial;


    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );


    const center =
        new THREE.Vector3()
        .addVectors(
            start,
            end
        )
        .multiplyScalar(0.5);


    mesh.position.copy(center);

    mesh.position.y =
        terrainHeight(
            center.x,
            center.z
        ) + 0.15;


    mesh.rotation.y =
        getRoadAngle(
            start,
            end
        );


    mesh.castShadow =
        !preview;

    mesh.receiveShadow =
        !preview;

    return mesh;
}


function findNearestRoadPoint(point) {

    let best = null;

    let bestDistance = 5;


    for (
        const road of city.roads
    ) {

        const data =
            road.userData;

        const a =
            data.start;

        const b =
            data.end;


        const ab =
            new THREE.Vector3()
            .subVectors(b, a);


        const ap =
            new THREE.Vector3()
            .subVectors(point, a);


        const lengthSquared =
            ab.lengthSq();


        if (
            lengthSquared === 0
        )
            continue;


        const t =
            clamp(
                ap.dot(ab) /
                lengthSquared,
                0,
                1
            );


        const projected =
            new THREE.Vector3()
            .copy(a)
            .add(
                ab.multiplyScalar(t)
            );


        const distance =
            projected.distanceTo(point);


        if (
            distance < bestDistance
        ) {

            best =
                projected;

            bestDistance =
                distance;

        }

    }

    return best;
}


function createRoadPreview(
    start,
    end
) {

    removeRoadPreview();

    if (
        start.distanceTo(end) < 1
    )
        return;


    const snappedEnd =
        snapPoint(end);


    const mesh =
        createRoadMesh(
            start,
            snappedEnd,
            true
        );


    if (!mesh)
        return;


    roadPreview =
        mesh;

    scene.add(
        roadPreview
    );


    const distance =
        start.distanceTo(
            snappedEnd
        );


    const cost =
        Math.ceil(
            distance *
            ROAD_COST_PER_METER
        );


    showBuildPreview(
        eventMouseX,
        eventMouseY,
        `ROAD · ${distance.toFixed(0)}m · $${cost.toLocaleString()}`
    );
}


function createRoad(
    start,
    end
) {

    const snappedStart =
        snapPoint(start);

    const snappedEnd =
        snapPoint(end);


    const distance =
        snappedStart.distanceTo(
            snappedEnd
        );


    if (distance < 8) {

        notify(
            "Road is too short"
        );

        return false;

    }


    const cost =
        Math.ceil(
            distance *
            ROAD_COST_PER_METER
        );


    if (
        city.money < cost
    ) {

        notify(
            "Not enough money"
        );

        return false;

    }


    const road =
        createRoadMesh(
            snappedStart,
            snappedEnd
        );


    if (!road)
        return false;


    road.userData = {

        type: "road",

        length: distance,

        cost: cost,

        start: {
            x: snappedStart.x,
            y: snappedStart.y,
            z: snappedStart.z
        },

        end: {
            x: snappedEnd.x,
            y: snappedEnd.y,
            z: snappedEnd.z
        }

    };


    scene.add(
        road
    );

    city.objects.push(
        road
    );

    city.roads.push(
        road
    );


    city.money -=
        cost;


    updateUI();

    notify(
        `Road constructed · $${cost.toLocaleString()}`
    );

    return true;
}


/* =========================================================
   ZONING
========================================================= */

const zoneMaterials = {

    residential:
        new THREE.MeshBasicMaterial({
            color: 0x4d91ff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        }),

    commercial:
        new THREE.MeshBasicMaterial({
            color: 0xffc04d,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        }),

    industrial:
        new THREE.MeshBasicMaterial({
            color: 0xff704d,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        })

};


function hasRoadAccess(
    point
) {

    for (
        const road of city.roads
    ) {

        const start =
            new THREE.Vector3(
                road.userData.start.x,
                0,
                road.userData.start.z
            );

        const end =
            new THREE.Vector3(
                road.userData.end.x,
                0,
                road.userData.end.z
            );


        const p =
            new THREE.Vector3(
                point.x,
                0,
                point.z
            );


        const line =
            new THREE.Line3(
                start,
                end
            );


        const closest =
            line.closestPointToPoint(
                p,
                true,
                new THREE.Vector3()
            );


        if (
            closest.distanceTo(p) <= 8
        ) {

            return true;

        }

    }

    return false;
}


function findZoneAt(point) {

    for (
        const zone of city.zones
    ) {

        if (
            Math.abs(
                zone.position.x -
                point.x
            ) <= ZONE_SIZE / 2 &&

            Math.abs(
                zone.position.z -
                point.z
            ) <= ZONE_SIZE / 2
        ) {

            return zone;

        }

    }

    return null;
}


function createZone(
    point,
    type
) {

    const snapped =
        snapPoint(point);


    if (
        snapped.x < -50
    ) {

        notify(
            "Water cannot be zoned"
        );

        return;

    }


    const existing =
        findZoneAt(snapped);


    if (existing) {

        existing.userData.zoneType =
            type;

        existing.material =
            zoneMaterials[type];

        notify(
            `${capitalize(type)} zone updated`
        );

        return;

    }


    if (
        !hasRoadAccess(snapped)
    ) {

        notify(
            "Zone requires road access"
        );

        return;

    }


    const geometry =
        new THREE.PlaneGeometry(
            ZONE_SIZE - 0.4,
            ZONE_SIZE - 0.4
        );


    const zone =
        new THREE.Mesh(
            geometry,
            zoneMaterials[type]
        );


    zone.rotation.x =
        -Math.PI / 2;


    zone.position.set(
        snapped.x,
        terrainHeight(
            snapped.x,
            snapped.z
        ) + 0.12,
        snapped.z
    );


    zone.userData = {

        type: "zone",

        zoneType: type,

        developed: false,

        growth: 0

    };


    scene.add(
        zone
    );

    city.zones.push(
        zone
    );


    notify(
        `${capitalize(type)} zone created`
    );

}


/* =========================================================
   BUILDINGS
========================================================= */

const buildingColors = {

    residential: 0xbcc9d5,

    commercial: 0xcdbb88,

    industrial: 0x929e9d

};


function createBuilding(
    zone
) {

    const type =
        zone.userData.zoneType;


    const cost =
        BUILDING_COST[type];


    if (
        city.money < cost
    )
        return false;


    const x =
        zone.position.x;

    const z =
        zone.position.z;


    const width =
        4.5 +
        Math.random() * 2.5;

    const depth =
        4.5 +
        Math.random() * 2.5;


    let height;


    if (
        type === "residential"
    ) {

        height =
            5 +
            Math.random() * 7;

    } else if (
        type === "commercial"
    ) {

        height =
            7 +
            Math.random() * 11;

    } else {

        height =
            4 +
            Math.random() * 5;

    }


    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );


    const material =
        new THREE.MeshStandardMaterial({
            color:
                buildingColors[type],
            roughness: 0.82
        });


    const building =
        new THREE.Mesh(
            geometry,
            material
        );


    const ground =
        terrainHeight(
            x,
            z
        );


    building.position.set(
        x,
        ground + height / 2,
        z
    );


    building.rotation.y =
        Math.random() *
        Math.PI;


    const residents =
        type === "residential"
            ? Math.floor(
                8 +
                Math.random() * 25
            )
            : 0;


    const jobs =
        type !== "residential"
            ? Math.floor(
                8 +
                Math.random() * 28
            )
            : 0;


    building.userData = {

        type: type,

        level: 1,

        residents: residents,

        jobs: jobs,

        happiness:
            70 +
            Math.floor(
                Math.random() * 20
            ),

        landValue:
            50 +
            Math.floor(
                Math.random() * 50
            ),

        zoneId:
            zone.uuid,

        growth: 0

    };


    building.castShadow = true;

    building.receiveShadow = true;


    scene.add(
        building
    );

    city.objects.push(
        building
    );

    city.buildings.push(
        building
    );


    zone.userData.developed =
        true;

    zone.userData.growth =
        100;


    city.money -=
        cost;

    city.population +=
        residents;

    city.jobs +=
        jobs;


    updateUI();

    notify(
        `${capitalize(type)} building developed`
    );

    return true;
}


/* =========================================================
   BUILDING GROWTH
========================================================= */

function simulateBuildingGrowth() {

    if (
        city.speed === 0
    )
        return;


    for (
        const zone of city.zones
    ) {

        if (
            zone.userData.developed
        )
            continue;


        const type =
            zone.userData.zoneType;


        const demand =
            city.demand[type];


        if (
            demand < 50
        )
            continue;


        if (
            Math.random() >
            0.08 *
            city.speed
        )
            continue;


        createBuilding(
            zone
        );

    }


    for (
        const building
        of city.buildings
    ) {

        if (
            building.userData.level >= 3
        )
            continue;


        const demand =
            city.demand[
                building.userData.type
            ];


        if (
            demand < 70
        )
            continue;


        if (
            Math.random() >
            0.015 *
            city.speed
        )
            continue;


        upgradeBuilding(
            building
        );

    }

}


/* =========================================================
   BUILDING UPGRADES
========================================================= */

function upgradeBuilding(
    building
) {

    const data =
        building.userData;


    data.level++;


    const oldHeight =
        building.geometry.parameters.height;


    const growth =
        1.25;


    building.scale.y *=
        growth;


    const addedResidents =
        data.type === "residential"
            ? Math.floor(
                8 *
                data.level
            )
            : 0;


    const addedJobs =
        data.type !== "residential"
            ? Math.floor(
                7 *
                data.level
            )
            : 0;


    data.residents +=
        addedResidents;

    data.jobs +=
        addedJobs;


    city.population +=
        addedResidents;

    city.jobs +=
        addedJobs;

}


/* =========================================================
   BULLDOZE
========================================================= */

function bulldozeObject(
    object
) {

    if (!object)
        return;


    const data =
        object.userData;


    if (
        data.type === "zone"
    ) {

        const index =
            city.zones.indexOf(
                object
            );

        if (
            index !== -1
        ) {

            city.zones.splice(
                index,
                1
            );

        }

        scene.remove(
            object
        );

        notify(
            "Zone removed"
        );

        return;
    }


    if (
        data.type === "road"
    ) {

        city.money +=
            Math.floor(
                data.cost * 0.25
            );

        removeFromArray(
            city.roads,
            object
        );

    }


    if (
        data.type === "residential"
    ) {

        city.population -=
            data.residents || 0;

    }


    if (
        data.type !== "road" &&
        data.type !== "residential"
    ) {

        city.jobs -=
            data.jobs || 0;

    }


    removeFromArray(
        city.buildings,
        object
    );

    removeFromArray(
        city.objects,
        object
    );


    scene.remove(
        object
    );


    city.selectedObject =
        null;


    clearSelection();


    updateUI();

    notify(
        "Object demolished"
    );

}


/* =========================================================
   SELECTION
========================================================= */

function selectObject(
    object
) {

    if (!object) {

        clearSelection();

        return;

    }


    city.selectedObject =
        object;


    showObjectInfo(
        object
    );

}


function clearSelection() {

    city.selectedObject =
        null;


    document
        .getElementById(
            "selectedName"
        )
        .textContent =
        "No Selection";


    document
        .getElementById(
            "selectedType"
        )
        .textContent =
        "Select an object";


    document
        .getElementById(
            "selectedInfo"
        )
        .innerHTML =
        "";

}


function showObjectInfo(
    object
) {

    const data =
        object.userData;


    let name =
        "Object";


    if (
        data.type === "road"
    ) {

        name =
            "Road";

    } else if (
        data.type === "zone"
    ) {

        name =
            capitalize(
                data.zoneType
            ) +
            " Zone";

    } else {

        name =
            capitalize(
                data.type
            ) +
            " Building";

    }


    document
        .getElementById(
            "selectedName"
        )
        .textContent =
        name;


    document
        .getElementById(
            "selectedType"
        )
        .textContent =
        (
            data.zoneType ||
            data.type
        ).toUpperCase();


    let html = "";


    if (
        data.type === "road"
    ) {

        html += row(
            "Length",
            data.length.toFixed(1) +
            " m"
        );

        html += row(
            "Construction",
            "$" +
            data.cost.toLocaleString()
        );

    } else if (
        data.type === "zone"
    ) {

        html += row(
            "Zone",
            capitalize(
                data.zoneType
            )
        );

        html += row(
            "Status",
            data.developed
                ? "Developed"
                : "Available"
        );

        html += row(
            "Growth",
            Math.round(
                data.growth
            ) + "%"
        );

    } else {

        html += row(
            "Level",
            data.level
        );

        html += row(
            "Residents",
            data.residents || 0
        );

        html += row(
            "Jobs",
            data.jobs || 0
        );

        html += row(
            "Happiness",
            (data.happiness || 0) +
            "%"
        );

        html += row(
            "Land Value",
            "$" +
            (data.landValue || 0)
        );

    }


    document
        .getElementById(
            "selectedInfo"
        )
        .innerHTML =
        html;

}


function row(
    label,
    value
) {

    return `
        <div class="info-row">
            <span>${label}</span>
            <span>${value}</span>
        </div>
    `;

}


/* =========================================================
   MOUSE INPUT
========================================================= */

let eventMouseX = 0;

let eventMouseY = 0;


renderer.domElement.addEventListener(
    "pointermove",
    event => {

        eventMouseX =
            event.clientX;

        eventMouseY =
            event.clientY;


        if (
            city.selectedTool === "road" &&
            roadStart
        ) {

            const point =
                getTerrainPoint(
                    event
                );


            if (!point)
                return;


            const end =
                snapPoint(point);


            createRoadPreview(
                roadStart,
                end
            );

        }

    }
);


renderer.domElement.addEventListener(
    "click",
    event => {

        if (moved)
            return;


        const point =
            getTerrainPoint(
                event
            );


        if (!point)
            return;


        /* ROAD */

        if (
            city.selectedTool === "road"
        ) {

            const snapped =
                snapPoint(point);


            if (!roadStart) {

                roadStart =
                    snapped;

                notify(
                    "Road start selected"
                );

            } else {

                createRoad(
                    roadStart,
                    snapped
                );

                roadStart =
                    null;

                removeRoadPreview();

            }

            return;
        }


        /* ZONING */

        if (
            city.selectedTool ===
            "residential"
        ) {

            createZone(
                point,
                "residential"
            );

            return;
        }


        if (
            city.selectedTool ===
            "commercial"
        ) {

            createZone(
                point,
                "commercial"
            );

            return;
        }


        if (
            city.selectedTool ===
            "industrial"
        ) {

            createZone(
                point,
                "industrial"
            );

            return;
        }


        /* BULLDOZE */

        if (
            city.selectedTool ===
            "bulldoze"
        ) {

            const object =
                getObjectAt(event);

            bulldozeObject(
                object
            );

            return;
        }


        /* SELECT */

        const object =
            getObjectAt(event);

        selectObject(
            object
        );

    }
);


/* =========================================================
   TOOL SYSTEM
========================================================= */

const descriptions = {

    select: [
        "SELECT TOOL",
        "Click an object to inspect it."
    ],

    road: [
        "ROAD TOOL",
        "Click a start point, then click an end point."
    ],

    residential: [
        "RESIDENTIAL ZONING",
        "Create housing zones beside roads."
    ],

    commercial: [
        "COMMERCIAL ZONING",
        "Create commercial zones beside roads."
    ],

    industrial: [
        "INDUSTRIAL ZONING",
        "Create industrial zones beside roads."
    ],

    bulldoze: [
        "BULLDOZE",
        "Click a road, zone, or building to remove it."
    ]

};


document
    .querySelectorAll(
        ".tool[data-tool]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const tool =
                        button.dataset.tool;


                    city.selectedTool =
                        tool;


                    roadStart =
                        null;

                    removeRoadPreview();


                    document
                        .querySelectorAll(
                            ".tool[data-tool]"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    document
                        .getElementById(
                            "toolStatus"
                        )
                        .textContent =
                        descriptions[
                            tool
                        ][0];


                    document
                        .getElementById(
                            "toolDescription"
                        )
                        .textContent =
                        descriptions[
                            tool
                        ][1];

                }
            );

        }
    );


/* =========================================================
   BUILD PREVIEW UI
========================================================= */

function showBuildPreview(
    x,
    y,
    text
) {

    const element =
        document.getElementById(
            "buildPreview"
        );


    element.style.display =
        "block";


    element.style.left =
        (x + 15) +
        "px";


    element.style.top =
        (y + 15) +
        "px";


    element.textContent =
        text;

}


function hideBuildPreview() {

    document
        .getElementById(
            "buildPreview"
        )
        .style.display =
        "none";

}


/* =========================================================
   SAVE SYSTEM
========================================================= */

function saveCity() {

    const data = {

        money: city.money,

        population: city.population,

        jobs: city.jobs,

        happiness: city.happiness,

        day: city.day,

        minutes: city.minutes,

        speed: 0,

        demand: city.demand,

        roads: city.roads.map(
            road => ({
                ...road.userData
            })
        ),

        zones: city.zones.map(
            zone => ({
                x: zone.position.x,
                y: zone.position.y,
                z: zone.position.z,
                userData: {
                    ...zone.userData
                }
            })
        ),

        buildings: city.buildings.map(
            building => ({
                x: building.position.x,
                y: building.position.y,
                z: building.position.z,
                rotation: building.rotation.y,
                scaleY: building.scale.y,
                userData: {
                    ...building.userData
                }
            })
        )

    };


    localStorage.setItem(
        "metroforge-save",
        JSON.stringify(data)
    );


    notify(
        "City saved"
    );

}


function loadCity() {

    const raw =
        localStorage.getItem(
            "metroforge-save"
        );


    if (!raw) {

        notify(
            "No saved city"
        );

        return;
    }


    try {

        const data =
            JSON.parse(raw);


        clearCityObjects();


        city.money =
            data.money ?? 50000;

        city.population =
            data.population ?? 0;

        city.jobs =
            data.jobs ?? 0;

        city.happiness =
            data.happiness ?? 75;

        city.day =
            data.day ?? 1;

        city.minutes =
            data.minutes ?? 480;

        city.demand =
            data.demand ?? {
                residential: 65,
                commercial: 45,
                industrial: 55
            };


        for (
            const roadData
            of data.roads || []
        ) {

            const start =
                new THREE.Vector3(
                    roadData.start.x,
                    roadData.start.y,
                    roadData.start.z
                );

            const end =
                new THREE.Vector3(
                    roadData.end.x,
                    roadData.end.y,
                    roadData.end.z
                );


            const road =
                createRoadMesh(
                    start,
                    end
                );


            road.userData =
                roadData;


            scene.add(
                road
            );

            city.roads.push(
                road
            );

            city.objects.push(
                road
            );

        }


        for (
            const zoneData
            of data.zones || []
        ) {

            const geometry =
                new THREE.PlaneGeometry(
                    ZONE_SIZE - 0.4,
                    ZONE_SIZE - 0.4
                );


            const type =
                zoneData.userData.zoneType;


            const zone =
                new THREE.Mesh(
                    geometry,
                    zoneMaterials[type]
                );


            zone.rotation.x =
                -Math.PI / 2;


            zone.position.set(
                zoneData.x,
                zoneData.y,
                zoneData.z
            );


            zone.userData =
                zoneData.userData;


            scene.add(
                zone
            );

            city.zones.push(
                zone
            );

        }


        for (
            const buildingData
            of data.buildings || []
        ) {

            const type =
                buildingData.userData.type;


            const geometry =
                new THREE.BoxGeometry(
                    5,
                    6,
                    5
                );


            const material =
                new THREE.MeshStandardMaterial({
                    color:
                        buildingColors[type]
                });


            const building =
                new THREE.Mesh(
                    geometry,
                    material
                );


            building.position.set(
                buildingData.x,
                buildingData.y,
                buildingData.z
            );


            building.rotation.y =
                buildingData.rotation || 0;


            building.scale.y =
                buildingData.scaleY || 1;


            building.userData =
                buildingData.userData;


            building.castShadow =
                true;

            building.receiveShadow =
                true;


            scene.add(
                building
            );

            city.buildings.push(
                building
            );

            city.objects.push(
                building
            );

        }


        updateUI();

        notify(
            "City loaded"
        );

    } catch (error) {

        console.error(error);

        notify(
            "Save data is invalid"
        );

    }

}


/* =========================================================
   NEW CITY
========================================================= */

function clearCityObjects() {

    for (
        const object
        of city.objects
    ) {

        scene.remove(
            object
        );

        if (
            object.geometry
        )
            object.geometry.dispose();

    }


    for (
        const zone
        of city.zones
    ) {

        scene.remove(
            zone
        );

        if (
            zone.geometry
        )
            zone.geometry.dispose();

    }


    city.objects = [];

    city.roads = [];

    city.zones = [];

    city.buildings = [];

    clearSelection();

}


function newCity() {

    if (
        !confirm(
            "Start a new city? Your current city will be cleared."
        )
    )
        return;


    clearCityObjects();


    city.money =
        50000;

    city.population =
        0;

    city.jobs =
        0;

    city.happiness =
        75;

    city.day =
        1;

    city.minutes =
        480;

    city.speed =
        0;


    city.demand = {
        residential: 65,
        commercial: 45,
        industrial: 55
    };


    updateUI();

    notify(
        "New city created"
    );

}


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById(
        "saveButton"
    )
    .addEventListener(
        "click",
        saveCity
    );


document
    .getElementById(
        "loadButton"
    )
    .addEventListener(
        "click",
        loadCity
    );


document
    .getElementById(
        "newButton"
    )
    .addEventListener(
        "click",
        newCity
    );


/* =========================================================
   TIME SYSTEM
========================================================= */

document
    .querySelectorAll(
        ".time-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    city.speed =
                        Number(
                            button.dataset.speed
                        );


                    document
                        .querySelectorAll(
                            ".time-btn"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );

                }
            );

        }
    );


/* =========================================================
   SIMULATION
========================================================= */

let simulationAccumulator = 0;


function updateSimulation(
    delta
) {

    if (
        city.speed === 0
    )
        return;


    city.minutes +=
        delta *
        city.speed *
        8;


    if (
        city.minutes >= 1440
    ) {

        city.minutes -=
            1440;

        city.day++;

    }


    simulationAccumulator +=
        delta *
        city.speed;


    if (
        simulationAccumulator >= 1
    ) {

        simulationAccumulator = 0;

        updateEconomy();

        updateDemand();

        simulateBuildingGrowth();

        updateHappiness();

    }

}


/* =========================================================
   ECONOMY
========================================================= */

function updateEconomy() {

    const residentialIncome =
        city.population * 0.18;

    const commercialIncome =
        city.jobs * 0.12;

    const industrialIncome =
        city.jobs * 0.10;


    const income =
        residentialIncome +
        commercialIncome +
        industrialIncome;


    const upkeep =
        city.roads.length * 2 +
        city.buildings.length * 1.5;


    city.money +=
        income -
        upkeep;

}


/* =========================================================
   DEMAND
========================================================= */

function updateDemand() {

    const population =
        city.population;

    const jobs =
        city.jobs;


    const housingPressure =
        Math.max(
            0,
            jobs - population
        );


    const unemployment =
        Math.max(
            0,
            population - jobs
        );


    city.demand.residential =
        clamp(
            68 -
            population * 0.025 +
            housingPressure * 0.035,
            5,
            95
        );


    city.demand.commercial =
        clamp(
            35 +
            population * 0.025 -
            city.buildings.filter(
                b =>
                    b.userData.type ===
                    "commercial"
            ).length *
            1.5,
            5,
            95
        );


    city.demand.industrial =
        clamp(
            50 +
            unemployment * 0.03 -
            city.buildings.filter(
                b =>
                    b.userData.type ===
                    "industrial"
            ).length *
            1.2,
            5,
            95
        );


    updateDemandUI();

}


/* =========================================================
   HAPPINESS
========================================================= */

function updateHappiness() {

    const employmentRate =
        city.population <= 0
            ? 1
            : Math.min(
                1,
                city.jobs /
                city.population
            );


    const housingDemand =
        city.demand.residential;


    const target =
        55 +
        employmentRate * 20 +
        housingDemand * 0.1;


    city.happiness +=
        (
            target -
            city.happiness
        ) *
        0.08;


    city.happiness =
        clamp(
            city.happiness,
            0,
            100
        );

}


/* =========================================================
   UI
========================================================= */

function updateDemandUI() {

    const values = [
        [
            "res",
            city.demand.residential
        ],
        [
            "com",
            city.demand.commercial
        ],
        [
            "ind",
            city.demand.industrial
        ]
    ];


    for (
        const [
            id,
            value
        ]
        of values
    ) {

        const fill =
            document.getElementById(
                id + "Demand"
            );


        const text =
            document.getElementById(
                id + "DemandText"
            );


        fill.style.width =
            value + "%";


        text.textContent =
            Math.round(
                value
            ) + "%";

    }

}


function updateUI() {

    document
        .getElementById(
            "money"
        )
        .textContent =
        "$" +
        Math.floor(
            city.money
        ).toLocaleString();


    document
        .getElementById(
            "population"
        )
        .textContent =
        Math.floor(
            city.population
        ).toLocaleString();


    document
        .getElementById(
            "jobs"
        )
        .textContent =
        Math.floor(
            city.jobs
        ).toLocaleString();


    document
        .getElementById(
            "happiness"
        )
        .textContent =
        Math.floor(
            city.happiness
        ) + "%";


    updateDemandUI();


    if (
        city.selectedObject
    ) {

        showObjectInfo(
            city.selectedObject
        );

    }

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const hours =
        Math.floor(
            city.minutes / 60
        );


    const minutes =
        Math.floor(
            city.minutes % 60
        );


    const time =
        String(hours)
            .padStart(2, "0") +
        ":" +
        String(minutes)
            .padStart(2, "0");


    document
        .getElementById(
            "clock"
        )
        .textContent =
        "DAY " +
        city.day +
        "  " +
        time;

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

let notificationTimer;


function notify(
    message
) {

    const element =
        document.getElementById(
            "notification"
        );


    element.textContent =
        message;


    element.classList.add(
        "show"
    );


    clearTimeout(
        notificationTimer
    );


    notificationTimer =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            1800
        );

}


/* =========================================================
   HELPERS
========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


function capitalize(
    text
) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function removeFromArray(
    array,
    object
) {

    const index =
        array.indexOf(
            object
        );


    if (
        index !== -1
    ) {

        array.splice(
            index,
            1
        );

    }

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            innerWidth /
            innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            innerWidth,
            innerHeight
        );

    }
);


/* =========================================================
   MAIN LOOP
========================================================= */

let lastTime =
    performance.now();


function animate() {

    requestAnimationFrame(
        animate
    );


    const now =
        performance.now();


    const delta =
        Math.min(
            (now - lastTime) / 1000,
            0.05
        );


    lastTime =
        now;


    updateSimulation(
        delta
    );

    updateCamera(
        delta
    );

    updateClock();


    renderer.render(
        scene,
        camera
    );

}


updateUI();

updateClock();

updateDemand();

animate();
