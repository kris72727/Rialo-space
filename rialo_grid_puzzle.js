// --- RIALO GRID FLOW: COMMUNITY EDITION ---
// Uses the Rialo logo color palette and is ready for 3D model loading.

// 1. SCENE & CAMERA SETUP
const W = window.innerWidth;
const H = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// Set background to the light beige/cream color from the Rialo logo aesthetic
scene.background = new THREE.Color(0xf5f0e3); 
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);

// Camera Position: High-angle, isometric view common in puzzle games
camera.position.set(10, 15, 10); 
camera.lookAt(0, 0, 0);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.8)); // Soft overall light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 2. CONSTANTS AND COLORS
const GRID_SIZE = 9; // 9x9 grid
const BLOCK_UNIT = 1.0;
const GRID_HALF = GRID_SIZE * BLOCK_UNIT / 2;

// Rialo Colors
const PLACED_COLOR = 0x000000; // Solid Black (Rialo logo color)
const GHOST_COLOR = 0x333333; // Dark Gray (for the piece currently being held)

// 3. GRID AND PIECE MANAGEMENT

// The Game Board (The Grid Plane)
const gridGeometry = new THREE.PlaneGeometry(GRID_SIZE * BLOCK_UNIT, GRID_SIZE * BLOCK_UNIT);
// Set the grid to a slightly darker shade of the background color
const gridMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
const gameGrid = new THREE.Mesh(gridGeometry, gridMaterial);
gameGrid.rotation.x = Math.PI / 2;
gameGrid.position.y = 0;
scene.add(gameGrid);

// ** CRITICAL FUNCTION: PLACEHOLDER FOR RIALO 3D MODEL **
// 
// You must import the GLTFLoader library and have a 3D model file (e.g., 'rialo_piece.glb')
// to make this function work with the real piece shape.
//
function createRialoPiece() {
    // --- TEMPORARY CUBE PIECE (DELETE LATER) ---
    // This is a temporary placeholder until you load the real Rialo model.
    const geometry = new THREE.BoxGeometry(BLOCK_UNIT, BLOCK_UNIT, BLOCK_UNIT);
    const material = new THREE.MeshPhongMaterial({ color: GHOST_COLOR });
    const block = new THREE.Mesh(geometry, material);
    block.castShadow = true;
    block.receiveShadow = true;
    return block;
    // --- END TEMPORARY CUBE PIECE ---
    
    /* // Example of how you would load the real model:
    // (Requires <script src="https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>)
    const loader = new THREE.GLTFLoader();
    loader.load( 'rialo_piece.glb', function ( gltf ) {
        // Assume your piece is the first mesh in the loaded scene
        const piece = gltf.scene.children[0];
        piece.material = new THREE.MeshPhongMaterial({ color: GHOST_COLOR });
        currentPiece = piece;
        scene.add( currentPiece );
    });
    return null; // Returns null initially as loading is async
    */
}

// 4. INTERACTION VARIABLES
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const interactableObjects = [gameGrid];
let currentPiece = createRialoPiece();
currentPiece.position.set(0, 5, 0); 
scene.add(currentPiece);

// 5. INPUT HANDLER
function onMouseMove(event) {
    mouse.x = (event.clientX / W) * 2 - 1;
    mouse.y = -(event.clientY / H) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, true);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const point = intersect.point;

        // Snap the position to the center of the nearest grid cell
        let x = Math.floor(point.x / BLOCK_UNIT) * BLOCK_UNIT + BLOCK_UNIT / 2;
        let z = Math.floor(point.z / BLOCK_UNIT) * BLOCK_UNIT + BLOCK_UNIT / 2;
        
        // Ensure the piece stays within the grid
        const maxOffset = GRID_HALF - BLOCK_UNIT / 2;
        x = Math.min(maxOffset, Math.max(-maxOffset, x));
        z = Math.min(maxOffset, Math.max(-maxOffset, z));
        
        // Position the ghost piece
        if (currentPiece) {
            currentPiece.position.set(x, BLOCK_UNIT / 2, z); 
        }
    }
}

function onMouseClick() {
    if (currentPiece) {
        // Change the material to the official black Rialo color
        currentPiece.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({ color: PLACED_COLOR }); 
            }
        });

        // The piece is now permanent
        interactableObjects.push(currentPiece);
        
        // Spawn the next piece
        currentPiece = createRialoPiece();
        // Check if the piece was synchronously created before setting position
        if (currentPiece) {
            currentPiece.position.set(0, 5, 0);
            scene.add(currentPiece);
        }
        
        // A full game would add complex logic here to check for cleared rows/columns
    }
}

// 6. CAMERA CONTROL (Simple Orbit)
let cameraOrbitAngle = 0;
const cameraOrbitSpeed = 0.0005;

function updateCamera() {
    // Slowly orbit the camera for a dynamic look
    cameraOrbitAngle += cameraOrbitSpeed;
    const radius = 18; 
    camera.position.x = Math.cos(cameraOrbitAngle) * radius;
    camera.position.z = Math.sin(cameraOrbitAngle) * radius;
    camera.lookAt(0, 0, 0);
}

// 7. RENDER LOOP
function animate() {
    requestAnimationFrame(animate);
    updateCamera();
    renderer.render(scene, camera);
}

// Event Listeners
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onMouseClick, false);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

animate();
