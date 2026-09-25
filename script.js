/* =========================================================
   METROFORGE
   3D CITY BUILDER
   ========================================================= */


/* -------------------------
   GAME STATE
------------------------- */

const city = {
    money: 50000,
    population: 0,
    buildings: 0,

    selectedTool: "select",

    roads: [],
    objects: []
};


/* -------------------------
   THREE.JS SETUP
------------------------- */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9aa8b5);

scene.fog = new THREE.Fog(
    0x9aa8b5,
    120,
    400
);


const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(
    65,
    65,
    65
);


const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document
    .getElementById("game")
    .appendChild(renderer.domElement);


/* -------------------------
   LIGHTING
------------------------- */

const hemisphere = new THREE.HemisphereLight(
    0xe8f1ff,
    0x44504a,
    2.2
);

scene.add(hemisphere);


const sun = new THREE.DirectionalLight(
    0xffffff,
    3
);

sun.position.set(
    80,
    120,
    60
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -150;
sun.shadow.camera.right = 150;
sun.shadow.camera.top = 150;
sun.shadow.camera.bottom = -150;

scene.add(sun);


/* -------------------------
   TERRAIN
------------------------- */

const terrainSize = 240;

const terrainGeometry =
    new THREE.PlaneGeometry(
        terrainSize,
        terrainSize,
        80,
        80
    );


/*
   Slight terrain variation
*/

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

    const height =
        Math.sin(x * 0.06) *
        Math.cos(y * 0.05) *
        1.8;

    vertices.setZ(
        i,
        height
    );
}

terrainGeometry.computeVertexNormals();


const terrainMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x63735f,
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

scene.add(terrain);


/* -------------------------
   GRID
------------------------- */

const grid =
    new THREE.GridHelper(
        terrainSize,
        terrainSize / 2,
        0x59655b,
        0x657064
    );

grid.position.y = 0.08;

scene.add(grid);


/* -------------------------
   CAMERA SYSTEM
------------------------- */

let cameraDistance = 95;

let cameraYaw = Math.PI / 4;
let cameraPitch = 0.72;

let cameraTarget =
    new THREE.Vector3(
        0,
        0,
        0
    );


let dragging = false;
let rightDragging = false;

let previousMouse = {
    x: 0,
    y: 0
};


renderer.domElement.addEventListener(
    "contextmenu",
    function(event) {
        event.preventDefault();
    }
);


renderer.domElement.addEventListener(
    "pointerdown",
    function(event) {

        dragging = true;

        rightDragging =
            event.button === 2;

        previousMouse.x =
            event.clientX;

        previousMouse.y =
            event.clientY;
    }
);


window.addEventListener(
    "pointerup",
    function() {
        dragging = false;
        rightDragging = false;
    }
);


window.addEventListener(
    "pointermove",
    function(event) {

        if (!dragging) return;

        const dx =
            event.clientX -
            previousMouse.x;

        const dy =
            event.clientY -
            previousMouse.y;


        previousMouse.x =
            event.clientX;

        previousMouse.y =
            event.clientY;


        if (rightDragging) {

            /*
               PAN
            */

            const panSpeed =
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
                    -dx * panSpeed
                )
            );

            cameraTarget.add(
                forward.multiplyScalar(
                    dy * panSpeed
                )
            );

        } else {

            /*
               ROTATE
            */

            cameraYaw -=
                dx * 0.008;

            cameraPitch -=
                dy * 0.006;

            cameraPitch =
                Math.max(
                    0.25,
                    Math.min(
                        1.35,
                        cameraPitch
                    )
                );
        }
    }
);


renderer.domElement.addEventListener(
    "wheel",
    function(event) {

        cameraDistance +=
            event.deltaY * 0.08;

        cameraDistance =
            Math.max(
                15,
                Math.min(
                    180,
                    cameraDistance
                )
            );
    }
);


/* -------------------------
   CAMERA UPDATE
------------------------- */

function updateCamera() {

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


    camera.position.set(
        x,
        y,
        z
    );

    camera.lookAt(
        cameraTarget
    );
}


/* -------------------------
   RAYCASTING
------------------------- */

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


function getTerrainPoint(event) {

    const rect =
        renderer.domElement.getBoundingClientRect();


    mouse.x =
        ((event.clientX - rect.left) /
            rect.width) * 2 - 1;

    mouse.y =
        -((event.clientY - rect.top) /
            rect.height) * 2 + 1;


    raycaster.setFromCamera(
        mouse,
        camera
    );


    const hits =
        raycaster.intersectObject(
            terrain
        );


    if (hits.length === 0) {
        return null;
    }

    return hits[0].point;
}


/* -------------------------
   GRID SNAP
------------------------- */

function snap(value) {

    const gridSize = 2;

    return Math.round(
        value / gridSize
    ) * gridSize;
}


/* -------------------------
   ROAD MATERIAL
------------------------- */

const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x25282b,
        roughness: 0.9
    });


const roadLineMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xd8d39b
    });


/* -------------------------
   CREATE ROAD
------------------------- */

function createRoad(point) {

    const x =
        snap(point.x);

    const z =
        snap(point.z);


    const roadWidth = 5;

    const roadLength = 12;


    const geometry =
        new THREE.BoxGeometry(
            roadWidth,
            0.18,
            roadLength
        );


    const road =
        new THREE.Mesh(
            geometry,
            roadMaterial
        );


    road.position.set(
        x,
        0.18,
        z
    );


    road.castShadow = true;
    road.receiveShadow = true;


    road.userData.type =
        "road";


    road.userData.cost =
        120;


    scene.add(road);

    city.roads.push(road);
    city.objects.push(road);


    city.money -= 120;


    updateStats();

    notify(
        "Road constructed  •  $120"
    );
}


/* -------------------------
   BUILDING
------------------------- */

function createBuilding(
    point,
    type
) {

    const cost = 500;

    if (city.money < cost) {

        notify(
            "Not enough money"
        );

        return;
    }


    const colors = {

        residential: 0xc8d4df,
        commercial: 0xd9c58f,
        industrial: 0x9caaa9

    };


    const height =
        type === "residential"
            ? 5 + Math.random() * 5
            : type === "commercial"
                ? 7 + Math.random() * 7
                : 4 + Math.random() * 3;


    const geometry =
        new THREE.BoxGeometry(
            5,
            height,
            5
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: colors[type]
        });


    const building =
        new THREE.Mesh(
            geometry,
            material
        );


    building.position.set(
        snap(point.x),
        height / 2,
        snap(point.z)
    );


    building.castShadow = true;
    building.receiveShadow = true;


    building.userData.type =
        type;


    scene.add(building);

    city.objects.push(
        building
    );


    city.money -= cost;

    city.buildings++;


    if (type === "residential") {

        city.population +=
            Math.floor(
                5 + Math.random() * 16
            );
    }


    updateStats();

    notify(
        type.charAt(0).toUpperCase() +
        type.slice(1) +
        " building constructed"
    );
}


/* -------------------------
   BULLDOZE
------------------------- */

function bulldoze(point) {

    const nearby =
        city.objects.filter(
            object => {

                const dx =
                    object.position.x -
                    point.x;

                const dz =
                    object.position.z -
                    point.z;

                return Math.sqrt(
                    dx * dx +
                    dz * dz
                ) < 5;
            }
        );


    if (nearby.length === 0) {

        notify(
            "Nothing to bulldoze"
        );

        return;
    }


    const object =
        nearby[0];


    scene.remove(object);


    const index =
        city.objects.indexOf(
            object
        );

    if (index !== -1) {

        city.objects.splice(
            index,
            1
        );
    }


    const roadIndex =
        city.roads.indexOf(
            object
        );

    if (roadIndex !== -1) {

        city.roads.splice(
            roadIndex,
            1
        );
    }


    if (
        object.userData.type ===
        "residential"
    ) {

        city.population =
            Math.max(
                0,
                city.population - 10
            );

    }


    if (
        object.userData.type !==
        "road"
    ) {

        city.buildings =
            Math.max(
                0,
                city.buildings - 1
            );
    }


    updateStats();

    notify(
        "Object demolished"
    );
}


/* -------------------------
   TOOL SYSTEM
------------------------- */

const toolNames = {

    select: [
        "SELECT TOOL",
        "Click objects to inspect them."
    ],

    road: [
        "ROAD TOOL",
        "Click the terrain to construct a road."
    ],

    residential: [
        "RESIDENTIAL ZONING",
        "Click the terrain to create housing."
    ],

    commercial: [
        "COMMERCIAL ZONING",
        "Click the terrain to create businesses."
    ],

    industrial: [
        "INDUSTRIAL ZONING",
        "Click the terrain to create industry."
    ],

    bulldoze: [
        "BULLDOZE",
        "Click an object to remove it."
    ]

};


document
    .querySelectorAll(".tool")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const tool =
                    this.dataset.tool;


                city.selectedTool =
                    tool;


                document
                    .querySelectorAll(".tool")
                    .forEach(
                        b => b.classList.remove(
                            "active"
                        )
                    );


                this.classList.add(
                    "active"
                );


                document
                    .getElementById(
                        "selectedTitle"
                    )
                    .textContent =
                    toolNames[tool][0];


                document
                    .getElementById(
                        "selectedDescription"
                    )
                    .textContent =
                    toolNames[tool][1];
            }
        );
    });


/* -------------------------
   WORLD CLICK
------------------------- */

renderer.domElement.addEventListener(
    "click",
    function(event) {

        const point =
            getTerrainPoint(event);


        if (!point) return;


        switch (
            city.selectedTool
        ) {

            case "road":

                if (
                    city.money >= 120
                ) {

                    createRoad(
                        point
                    );

                } else {

                    notify(
                        "Not enough money"
                    );
                }

                break;


            case "residential":

                createBuilding(
                    point,
                    "residential"
                );

                break;


            case "commercial":

                createBuilding(
                    point,
                    "commercial"
                );

                break;


            case "industrial":

                createBuilding(
                    point,
                    "industrial"
                );

                break;


            case "bulldoze":

                bulldoze(point);

                break;


            case "select":

                notify(
                    "Terrain selected"
                );

                break;
        }
    }
);


/* -------------------------
   UI
------------------------- */

function updateStats() {

    document.getElementById(
        "money"
    ).textContent =
        "$" +
        city.money.toLocaleString();


    document.getElementById(
        "population"
    ).textContent =
        city.population.toLocaleString();


    document.getElementById(
        "buildings"
    ).textContent =
        city.buildings.toLocaleString();
}


let notificationTimeout;


function notify(message) {

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
        notificationTimeout
    );


    notificationTimeout =
        setTimeout(
            function() {

                element.classList.remove(
                    "show"
                );

            },
            1800
        );
}


/* -------------------------
   RESIZE
------------------------- */

window.addEventListener(
    "resize",
    function() {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


/* -------------------------
   START
------------------------- */

updateCamera();

updateStats();


/* -------------------------
   RENDER LOOP
------------------------- */

function animate() {

    requestAnimationFrame(
        animate
    );


    updateCamera();


    renderer.render(
        scene,
        camera
    );
}


animate();
