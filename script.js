// Cache DOM elements
const profileAvatar = document.getElementById('profile-avatar');
const username = document.getElementById('username');
const profileDescription = document.getElementById('profile-description');
const projectCount = document.getElementById('project-count');
const followerCount = document.getElementById('follower-count');
const followingCount = document.getElementById('following-count');
const projectsGrid = document.getElementById('projects-grid');
const followersList = document.getElementById('followers-list');
const followingList = document.getElementById('following-list');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Play background music
        const backgroundMusic = document.getElementById('background-music');
        backgroundMusic.volume = 0.3; // Set volume to 30%
        backgroundMusic.play().catch(e => console.log('Auto-play prevented:', e));
        
        // Get creator profile
        const creator = await window.websim.getCreator();
        
        if (!creator) {
            throw new Error('Creator not found');
        }
        
        // Update profile information
        updateProfileInfo(creator);
        
        // Load projects (default tab)
        loadUserProjects(creator.username);
        
        // Add tab switching functionality
        setupTabs(creator.username);
        
        // Load about me information
        loadAboutMe(creator);
        
        // Set up profile avatar click handler
        setupProfileAvatarClick();
        
        // Set up follow button functionality
        setupFollowButton(creator.username);
        
    } catch (error) {
        console.error('Error initializing profile:', error);
        document.body.innerHTML = `
            <div class="container" style="padding: 50px 20px; text-align: center;">
                <h1>Error loading profile</h1>
                <p>${error.message || 'Something went wrong'}</p>
            </div>
        `;
    }
});

// Update profile information
async function updateProfileInfo(user) {
    // Set avatar image
    profileAvatar.src = user.avatar_url || `https://images.websim.com/avatar/${user.username}`;
    profileAvatar.alt = `${user.username}'s avatar`;
    
    // Set username
    username.textContent = `@${user.username}`;
    
    // Set description
    profileDescription.textContent = "don't click my profile photo..";
    
    try {
        // Get user stats
        const response = await fetch(`/api/v1/users/${user.username}/stats`);
        const data = await response.json();
        
        if (data && data.stats) {
            // Update total views display if available
            if (data.stats.total_views !== undefined) {
                document.getElementById('total-views').textContent = formatNumber(data.stats.total_views);
            }
        }
        
        // Get follower count
        const followersResponse = await fetch(`/api/v1/users/${user.username}/followers?count=true`);
        const followersData = await followersResponse.json();
        
        // Get following count
        const followingResponse = await fetch(`/api/v1/users/${user.username}/following?count=true`);
        const followingData = await followingResponse.json();
        
        // Update counts
        followerCount.textContent = followersData.followers.meta.count || 0;
        followingCount.textContent = followingData.following.meta.count || 0;
        
    } catch (error) {
        console.error('Error fetching user stats:', error);
    }
}

// Load about me information
function loadAboutMe(user) {
    const aboutText = document.getElementById('about-text');
    
    aboutText.innerHTML = "don't click my profile photo..";
}

// Load user projects
async function loadUserProjects(username) {
    projectsGrid.innerHTML = '<div class="loading">Loading projects...</div>';
    
    try {
        const response = await fetch(`/api/v1/users/${username}/projects?posted=true`);
        const data = await response.json();
        
        if (!data || !data.projects || !data.projects.data) {
            projectsGrid.innerHTML = '<p class="loading">No projects found</p>';
            return;
        }
        
        const projects = data.projects.data;
        projectCount.textContent = projects.length;
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p class="loading">No projects found</p>';
            return;
        }
        
        let projectsHTML = '';
        
        for (const item of projects) {
            const project = item.project;
            const site = item.site;
            
            // Skip if no site exists
            if (!site) continue;
            
            const title = project.title || 'Untitled Project';
            const description = project.description || 'No description available';
            const siteImageUrl = `https://images.websim.com/v1/site/${site.id}/600`;
            const projectUrl = `https://websim.com/p/${project.id}`;
            const siteUrl = `https://websim.com/c/${site.id}`;
            const views = project.stats?.views || 0;
            const likes = project.stats?.likes || 0;
            
            projectsHTML += `
                <div class="project-card">
                    <img src="${siteImageUrl}" alt="${title}" class="project-image">
                    <div class="project-details">
                        <a href="${siteUrl}" class="project-title">${title}</a>
                        <p class="project-description">${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
                        <div class="project-stats">
                            <div class="project-stat">
                                <span class="project-stat-icon">👁️</span>
                                <span>${formatNumber(views)}</span>
                            </div>
                            <div class="project-stat">
                                <span class="project-stat-icon">❤️</span>
                                <span>${formatNumber(likes)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        projectsGrid.innerHTML = projectsHTML;
        
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = '<p class="loading">Error loading projects</p>';
    }
}

// Load user followers
async function loadUserFollowers(username) {
    followersList.innerHTML = '<div class="loading">Loading followers...</div>';
    
    try {
        const response = await fetch(`/api/v1/users/${username}/followers`);
        const data = await response.json();
        
        if (!data || !data.followers || !data.followers.data) {
            followersList.innerHTML = '<p class="loading">No followers found</p>';
            return;
        }
        
        const followers = data.followers.data;
        
        if (followers.length === 0) {
            followersList.innerHTML = '<p class="loading">No followers found</p>';
            return;
        }
        
        let followersHTML = '';
        
        for (const item of followers) {
            const user = item.follow.user;
            if (!user) continue;
            
            const avatarUrl = user.avatar_url || `https://images.websim.com/avatar/${user.username}`;
            const userUrl = `https://websim.com/@${user.username}`;
            const description = user.description || '';
            
            followersHTML += `
                <div class="user-item">
                    <img src="${avatarUrl}" alt="${user.username}" class="user-avatar">
                    <div class="user-details">
                        <a href="${userUrl}" class="user-name">@${user.username}</a>
                        <p class="user-description">${description.substring(0, 60)}${description.length > 60 ? '...' : ''}</p>
                    </div>
                </div>
            `;
        }
        
        followersList.innerHTML = followersHTML;
        
    } catch (error) {
        console.error('Error loading followers:', error);
        followersList.innerHTML = '<p class="loading">Error loading followers</p>';
    }
}

// Load user following
async function loadUserFollowing(username) {
    followingList.innerHTML = '<div class="loading">Loading following...</div>';
    
    try {
        const response = await fetch(`/api/v1/users/${username}/following`);
        const data = await response.json();
        
        if (!data || !data.following || !data.following.data) {
            followingList.innerHTML = '<p class="loading">Not following anyone</p>';
            return;
        }
        
        const following = data.following.data;
        
        if (following.length === 0) {
            followingList.innerHTML = '<p class="loading">Not following anyone</p>';
            return;
        }
        
        let followingHTML = '';
        
        for (const item of following) {
            const user = item.follow.user;
            if (!user) continue;
            
            const avatarUrl = user.avatar_url || `https://images.websim.com/avatar/${user.username}`;
            const userUrl = `https://websim.com/@${user.username}`;
            const description = user.description || '';
            
            followingHTML += `
                <div class="user-item">
                    <img src="${avatarUrl}" alt="${user.username}" class="user-avatar">
                    <div class="user-details">
                        <a href="${userUrl}" class="user-name">@${user.username}</a>
                        <p class="user-description">${description.substring(0, 60)}${description.length > 60 ? '...' : ''}</p>
                    </div>
                </div>
            `;
        }
        
        followingList.innerHTML = followingHTML;
        
    } catch (error) {
        console.error('Error loading following:', error);
        followingList.innerHTML = '<p class="loading">Error loading following</p>';
    }
}

// Set up tab switching
function setupTabs(username) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get the tab name
            const tabName = button.dataset.tab;
            
            // Activate corresponding panel
            const panel = document.getElementById(`${tabName}-tab`);
            panel.classList.add('active');
            
            // Load content for the tab if needed
            if (tabName === 'followers' && followersList.innerHTML.includes('Loading')) {
                loadUserFollowers(username);
            } else if (tabName === 'following' && followingList.innerHTML.includes('Loading')) {
                loadUserFollowing(username);
            }
        });
    });
}

// Set up profile avatar click handler
function setupProfileAvatarClick() {
    profileAvatar.addEventListener('click', () => {
        // Pause background music when game starts
        const backgroundMusic = document.getElementById('background-music');
        backgroundMusic.pause();
        
        // Create fade element
        const fadeElement = document.createElement('div');
        fadeElement.className = 'fade-white';
        document.body.appendChild(fadeElement);
        
        // Add zoom effect to username
        username.classList.add('zoom-effect');
        
        // Add fade-in effect after zoom animation starts
        setTimeout(() => {
            fadeElement.classList.add('active');
        }, 1200);
        
        // Initialize 3D game after fade completes
        setTimeout(() => {
            initGame();
        }, 2000);
    });
}

// Initialize 3D pixel game
function initGame() {
    // Hide main content
    document.querySelector('.page-layout').style.display = 'none';
    document.querySelector('.background-container').style.display = 'none';
    
    // Show game container
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.remove('hidden');
    
    // Play sad ambient music
    const sadMusic = document.getElementById('sad-music');
    sadMusic.volume = 0.4;
    sadMusic.loop = true;
    sadMusic.play();
    
    // Set up Three.js
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x666666, 0.05);
    scene.background = new THREE.Color(0x666666); // Match sky color to fog
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: false // Disable antialiasing for pixelated effect
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(0.3); // Lower pixel ratio for dithered effect
    
    // Create a pixelated texture
    const pixelSize = 4;
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 32;
    textureCanvas.height = 32;
    const ctx = textureCanvas.getContext('2d');
    
    // Draw pixelated pattern
    for (let x = 0; x < textureCanvas.width; x += pixelSize) {
        for (let y = 0; y < textureCanvas.height; y += pixelSize) {
            ctx.fillStyle = Math.random() > 0.5 ? '#ff6e4a' : '#7a1f00';
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    
    // Create a floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
    const floorTextureCanvas = document.createElement('canvas');
    floorTextureCanvas.width = 64;
    floorTextureCanvas.height = 64;
    const floorCtx = floorTextureCanvas.getContext('2d');
    
    // Draw pixelated grass pattern
    for (let x = 0; x < floorTextureCanvas.width; x += pixelSize) {
        for (let y = 0; y < floorTextureCanvas.height; y += pixelSize) {
            // Create variation of green colors for grass
            const greenValue = 100 + Math.floor(Math.random() * 100);
            floorCtx.fillStyle = `rgb(30, ${greenValue}, 40)`;
            floorCtx.fillRect(x, y, pixelSize, pixelSize);
            
            // Occasionally add darker patches or flowers
            if (Math.random() > 0.95) {
                const color = Math.random() > 0.5 ? '#cc44ff' : '#20401a';
                floorCtx.fillStyle = color;
                floorCtx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }
    
    const floorTexture = new THREE.CanvasTexture(floorTextureCanvas);
    floorTexture.magFilter = THREE.NearestFilter;
    floorTexture.minFilter = THREE.NearestFilter;
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    
    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    scene.add(floor);
    
    // Create cubes (keep as decoration)
    const cubes = [];
    for (let i = 0; i < 50; i++) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);
        
        cube.position.x = Math.random() * 40 - 20;
        cube.position.y = Math.random() * 10;
        cube.position.z = Math.random() * 40 - 20;
        
        cube.rotation.x = Math.random() * Math.PI;
        cube.rotation.y = Math.random() * Math.PI;
        
        scene.add(cube);
        cubes.push(cube);
    }
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // First person controls setup
    camera.position.y = 1.6; // Eye height
    
    // Movement variables
    const moveSpeed = 0.15;
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
        shift: false
    };
    
    // First person controls - keyboard input
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'w') keys.w = true;
        if (event.key.toLowerCase() === 'a') keys.a = true;
        if (event.key.toLowerCase() === 's') keys.s = true;
        if (event.key.toLowerCase() === 'd') keys.d = true;
        if (event.key === 'Shift') keys.shift = true;
        
        // E key for door interaction
        if (event.key.toLowerCase() === 'e' && nearDoor) {
            toggleDoors(house, !doorsOpen);
            doorsOpen = !doorsOpen;
            
            // Play or pause crying sound based on door state
            if (doorsOpen && !insideHouse) {
                babyAudioElement.play();
                insideHouse = true;
                
                // Increase sad music volume when entering house
                sadMusic.volume = 0.7;
            } else if (!doorsOpen && insideHouse) {
                babyAudioElement.pause();
                insideHouse = false;
                
                // Return sad music to normal volume when leaving house
                sadMusic.volume = 0.4;
            }
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (event.key.toLowerCase() === 'w') keys.w = false;
        if (event.key.toLowerCase() === 'a') keys.a = false;
        if (event.key.toLowerCase() === 's') keys.s = false;
        if (event.key.toLowerCase() === 'd') keys.d = false;
        if (event.key === 'Shift') keys.shift = false;
    });
    
    // Lock pointer for first-person view
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });
    
    // Mouse look variables
    let yaw = 0;
    let pitch = 0;
    const mouseSensitivity = 0.002;
    
    // First person controls - mouse look
    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === canvas) {
            yaw -= event.movementX * mouseSensitivity;
            pitch -= event.movementY * mouseSensitivity;
            
            // Clamp pitch to prevent over-rotation
            pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, pitch));
            
            // Update camera rotation
            camera.rotation.order = 'YXZ';
            camera.rotation.y = yaw;
            camera.rotation.x = pitch;
        }
    });
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '20px';
    instructions.style.left = '20px';
    instructions.style.color = 'white';
    instructions.style.fontFamily = 'Inter, sans-serif';
    instructions.style.padding = '10px';
    instructions.style.backgroundColor = 'rgba(0,0,0,0.5)';
    instructions.style.borderRadius = '5px';
    instructions.innerHTML = 'Click to start<br>WASD to move<br>Mouse to look<br>Shift to run<br>E to open doors';
    gameContainer.appendChild(instructions);
    
    // Add a house with doors and interior
    const house = createHouse();
    scene.add(house);
    
    // Add sound for crying baby
    const listener = new THREE.AudioListener();
    camera.add(listener);
    
    const cryingSound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    
    // Create audio object
    const babyAudioElement = document.createElement('audio');
    babyAudioElement.src = 'https://cdn.freesound.org/previews/367/367746_1622571-lq.mp3'; // Crying baby sound
    babyAudioElement.loop = true;
    babyAudioElement.volume = 0.5;
    
    // Variables for interaction
    let nearDoor = null;
    let doorsOpen = false;
    let insideHouse = false;
    
    // Key press for interaction
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'w') keys.w = true;
        if (event.key.toLowerCase() === 'a') keys.a = true;
        if (event.key.toLowerCase() === 's') keys.s = true;
        if (event.key.toLowerCase() === 'd') keys.d = true;
        if (event.key === 'Shift') keys.shift = true;
        
        // E key for door interaction
        if (event.key.toLowerCase() === 'e' && nearDoor) {
            toggleDoors(house, !doorsOpen);
            doorsOpen = !doorsOpen;
            
            // Play or pause crying sound based on door state
            if (doorsOpen && !insideHouse) {
                babyAudioElement.play();
                insideHouse = true;
                
                // Increase sad music volume when entering house
                sadMusic.volume = 0.7;
            } else if (!doorsOpen && insideHouse) {
                babyAudioElement.pause();
                insideHouse = false;
                
                // Return sad music to normal volume when leaving house
                sadMusic.volume = 0.4;
            }
        }
    });
    
    // Add eyes that chase the player
    const eyeCount = 8;
    const eyes = [];
    
    for (let i = 0; i < eyeCount; i++) {
        // Create eye group
        const eyeGroup = new THREE.Group();
        
        // Create eyeball
        const eyeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eyeball = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        // Create pupil
        const pupilGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil.position.z = 0.2;
        
        // Add pupil to eyeball
        eyeball.add(pupil);
        eyeGroup.add(eyeball);
        
        // Position eye randomly
        eyeGroup.position.set(
            Math.random() * 40 - 20,
            Math.random() * 3 + 1,
            Math.random() * 40 - 20
        );
        
        // Add to scene and tracking array
        scene.add(eyeGroup);
        eyes.push({
            group: eyeGroup,
            speed: 0.01 + Math.random() * 0.02,
            pupil: pupil,
            blinkTimer: Math.random() * 100
        });
    }
    
    // Add weird floating objects
    const weirdObjects = [];
    
    // Floating TV screens with static
    for (let i = 0; i < 5; i++) {
        const tvGeometry = new THREE.BoxGeometry(1.5, 1, 0.2);
        
        // Create static TV texture
        const tvCanvas = document.createElement('canvas');
        tvCanvas.width = 32;
        tvCanvas.height = 32;
        const tvCtx = tvCanvas.getContext('2d');
        
        // Draw static pattern
        for (let x = 0; x < tvCanvas.width; x += 2) {
            for (let y = 0; y < tvCanvas.height; y += 2) {
                const gray = Math.floor(Math.random() * 255);
                tvCtx.fillStyle = `rgb(${gray},${gray},${gray})`;
                tvCtx.fillRect(x, y, 2, 2);
            }
        }
        
        const tvTexture = new THREE.CanvasTexture(tvCanvas);
        tvTexture.magFilter = THREE.NearestFilter;
        tvTexture.minFilter = THREE.NearestFilter;
        
        const tvMaterials = [
            new THREE.MeshBasicMaterial({ color: 0x333333 }),
            new THREE.MeshBasicMaterial({ color: 0x333333 }),
            new THREE.MeshBasicMaterial({ color: 0x333333 }),
            new THREE.MeshBasicMaterial({ color: 0x333333 }),
            new THREE.MeshBasicMaterial({ map: tvTexture }),
            new THREE.MeshBasicMaterial({ color: 0x333333 })
        ];
        
        const tv = new THREE.Mesh(tvGeometry, tvMaterials);
        tv.position.set(
            Math.random() * 30 - 15,
            Math.random() * 5 + 2,
            Math.random() * 30 - 15
        );
        
        scene.add(tv);
        weirdObjects.push({
            obj: tv,
            textureCanvas: tvCanvas,
            textureContext: tvCtx,
            texture: tvTexture,
            rotationSpeed: Math.random() * 0.01,
            floatOffset: Math.random() * Math.PI * 2
        });
    }
    
    // Add giant mushrooms
    for (let i = 0; i < 12; i++) {
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2 + Math.random() * 3, 8);
        const stemMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        
        // Cap
        const capGeometry = new THREE.SphereGeometry(1.5 + Math.random(), 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMaterial = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff5555 : 0xff55ff });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = stem.geometry.parameters.height / 2;
        
        // Create mushroom group
        const mushroom = new THREE.Group();
        mushroom.add(stem);
        mushroom.add(cap);
        
        // Position
        mushroom.position.set(
            Math.random() * 60 - 30,
            0,
            Math.random() * 60 - 30
        );
        
        // Random scale
        const scale = 0.5 + Math.random() * 1.5;
        mushroom.scale.set(scale, scale, scale);
        
        scene.add(mushroom);
    }
    
    // Animation loop
    function animate() {
        const time = Date.now() * 0.001;
        requestAnimationFrame(animate);
        
        // Rotate cubes (decorative)
        cubes.forEach(cube => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        });
        
        // Update TV static
        weirdObjects.forEach(obj => {
            if (obj.textureContext) {
                // Redraw static
                for (let x = 0; x < obj.textureCanvas.width; x += 2) {
                    for (let y = 0; y < obj.textureCanvas.height; y += 2) {
                        if (Math.random() > 0.7) {
                            const gray = Math.floor(Math.random() * 255);
                            obj.textureContext.fillStyle = `rgb(${gray},${gray},${gray})`;
                            obj.textureContext.fillRect(x, y, 2, 2);
                        }
                    }
                }
                obj.texture.needsUpdate = true;
            }
            
            // Rotate and float objects
            obj.obj.rotation.y += obj.rotationSpeed;
            obj.obj.position.y += Math.sin(time + obj.floatOffset) * 0.01;
        });
        
        // Update house animations
        if (house.userData && typeof house.userData.update === 'function') {
            house.userData.update(time);
        }
        
        // Update eyes to chase player
        eyes.forEach(eye => {
            // Calculate direction to player
            const directionToPlayer = new THREE.Vector3();
            directionToPlayer.subVectors(camera.position, eye.group.position);
            directionToPlayer.y = 0; // Keep eyes at same height
            
            // Move eye towards player
            const normalizedDir = directionToPlayer.clone().normalize();
            eye.group.position.x += normalizedDir.x * eye.speed;
            eye.group.position.z += normalizedDir.z * eye.speed;
            
            // Make eye look at player
            eye.group.lookAt(camera.position);
            
            // Handle blinking
            eye.blinkTimer -= 1;
            if (eye.blinkTimer <= 0) {
                if (eye.blinkTimer > -10) {
                    // Close eye
                    eye.group.scale.y = Math.max(0.1, eye.group.scale.y - 0.1);
                } else {
                    // Open eye
                    eye.group.scale.y = Math.min(1, eye.group.scale.y + 0.1);
                    if (eye.group.scale.y >= 1) {
                        eye.blinkTimer = 50 + Math.random() * 150;
                    }
                }
            }
            
            // Move pupil to track player more closely
            eye.pupil.lookAt(camera.position);
        });
        
        // Check if player is near a door
        const doorPosition = new THREE.Vector3(0, 0, 15); // Position of the front door
        const distanceToDoor = doorPosition.distanceTo(camera.position);
        
        if (distanceToDoor < 5) {
            nearDoor = true;
            instructions.innerHTML = 'Click to start<br>WASD to move<br>Mouse to look<br>Shift to run<br><strong style="color: yellow">Press E to open door</strong>';
        } else {
            nearDoor = false;
            instructions.innerHTML = 'Click to start<br>WASD to move<br>Mouse to look<br>Shift to run<br>E to open doors';
        }
        
        // Check if player is inside house to adjust sound volume
        if (insideHouse) {
            const centerOfHouse = new THREE.Vector3(0, 0, 15);
            const distanceToCenter = centerOfHouse.distanceTo(camera.position);
            
            if (distanceToCenter < 10) {
                // Player is close to the baby, increase volume
                babyAudioElement.volume = Math.min(0.8, (10 - distanceToCenter) / 10 + 0.3);
            } else {
                babyAudioElement.volume = 0.3;
            }
        }
        
        // Handle movement
        if (document.pointerLockElement === canvas) {
            const moveSpeedFactor = keys.shift ? moveSpeed * 2 : moveSpeed;
            
            // Calculate movement direction relative to camera rotation
            const moveX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            const moveZ = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            
            if (moveX !== 0 || moveZ !== 0) {
                const angle = yaw;
                
                // Apply movement
                camera.position.x += Math.sin(angle) * moveZ * moveSpeedFactor;
                camera.position.z += Math.cos(angle) * moveZ * moveSpeedFactor;
                camera.position.x += Math.sin(angle + Math.PI/2) * moveX * moveSpeedFactor;
                camera.position.z += Math.cos(angle + Math.PI/2) * moveX * moveSpeedFactor;
            }
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Function to create the house
function createHouse() {
    const houseGroup = new THREE.Group();
    
    // House dimensions
    const width = 20;
    const height = 10;
    const depth = 20;
    
    // Create house walls with pixelated texture
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 32;
    wallCanvas.height = 32;
    const wallCtx = wallCanvas.getContext('2d');
    
    // Draw brick pattern
    for (let x = 0; x < wallCanvas.width; x += 4) {
        for (let y = 0; y < wallCanvas.height; y += 2) {
            // Offset every other row
            const offsetX = (y % 4 === 0) ? 0 : 2;
            
            // Brick color with some variation
            const r = 120 + Math.floor(Math.random() * 30);
            const g = 60 + Math.floor(Math.random() * 20);
            const b = 50 + Math.floor(Math.random() * 20);
            
            wallCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            wallCtx.fillRect(x + offsetX, y, 4, 2);
            
            // Mortar lines
            if (Math.random() > 0.8) {
                wallCtx.fillStyle = '#999999';
                wallCtx.fillRect(x + offsetX, y, 1, 1);
            }
        }
    }
    
    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.magFilter = THREE.NearestFilter;
    wallTexture.minFilter = THREE.NearestFilter;
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 2);
    
    const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });
    
    // Roof texture
    const roofCanvas = document.createElement('canvas');
    roofCanvas.width = 32;
    roofCanvas.height = 32;
    const roofCtx = roofCanvas.getContext('2d');
    
    // Draw roof tiles
    for (let x = 0; x < roofCanvas.width; x += 4) {
        for (let y = 0; y < roofCanvas.height; y += 4) {
            const darkness = Math.random() * 40;
            roofCtx.fillStyle = `rgb(${100-darkness}, ${50-darkness}, ${50-darkness})`;
            roofCtx.fillRect(x, y, 4, 4);
        }
    }
    
    const roofTexture = new THREE.CanvasTexture(roofCanvas);
    roofTexture.magFilter = THREE.NearestFilter;
    roofTexture.minFilter = THREE.NearestFilter;
    
    const roofMaterial = new THREE.MeshBasicMaterial({ map: roofTexture });
    
    // Create walls
    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 0.5),
        wallMaterial
    );
    backWall.position.set(0, height/2, -depth/2);
    houseGroup.add(backWall);
    
    // Front wall (with door opening)
    const frontWallLeft = new THREE.Mesh(
        new THREE.BoxGeometry(width/2 - 2, height, 0.5),
        wallMaterial
    );
    frontWallLeft.position.set(-width/4 - 1, height/2, depth/2);
    houseGroup.add(frontWallLeft);
    
    const frontWallRight = new THREE.Mesh(
        new THREE.BoxGeometry(width/2 - 2, height, 0.5),
        wallMaterial
    );
    frontWallRight.position.set(width/4 + 1, height/2, depth/2);
    houseGroup.add(frontWallRight);
    
    // Top part of front wall (above door)
    const frontWallTop = new THREE.Mesh(
        new THREE.BoxGeometry(4, height/2, 0.5),
        wallMaterial
    );
    frontWallTop.position.set(0, height * 0.75, depth/2);
    houseGroup.add(frontWallTop);
    
    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, height, depth),
        wallMaterial
    );
    leftWall.position.set(-width/2, height/2, 0);
    houseGroup.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, height, depth),
        wallMaterial
    );
    rightWall.position.set(width/2, height/2, 0);
    houseGroup.add(rightWall);
    
    // Roof
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(width * 0.7, height/2, 4),
        roofMaterial
    );
    roof.position.set(0, height + height/4, 0);
    roof.rotation.y = Math.PI / 4;
    houseGroup.add(roof);
    
    // Floor
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 32;
    floorCanvas.height = 32;
    const floorCtx = floorCanvas.getContext('2d');
    
    // Draw wood pattern
    for (let y = 0; y < floorCanvas.height; y += 4) {
        const woodColor = 180 + Math.floor(Math.random() * 30);
        floorCtx.fillStyle = `rgb(${woodColor}, ${woodColor - 60}, ${woodColor - 100})`;
        
        for (let x = 0; x < floorCanvas.width; x += 2) {
            if (Math.random() > 0.9) {
                // Wood grain
                floorCtx.fillStyle = `rgb(${woodColor - 20}, ${woodColor - 80}, ${woodColor - 120})`;
                floorCtx.fillRect(x, y, 2, 1);
                floorCtx.fillStyle = `rgb(${woodColor}, ${woodColor - 60}, ${woodColor - 100})`;
            } else {
                floorCtx.fillRect(x, y, 2, 4);
            }
        }
    }
    
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.magFilter = THREE.NearestFilter;
    floorTexture.minFilter = THREE.NearestFilter;
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(5, 5);
    
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(width, depth),
        new THREE.MeshBasicMaterial({ map: floorTexture })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.1;
    houseGroup.add(floor);
    
    // Create doors
    const doorCanvas = document.createElement('canvas');
    doorCanvas.width = 32;
    doorCanvas.height = 32;
    const doorCtx = doorCanvas.getContext('2d');
    
    // Draw door pattern
    doorCtx.fillStyle = '#8B4513';
    doorCtx.fillRect(0, 0, 32, 32);
    
    // Door panels
    doorCtx.fillStyle = '#6B3100';
    doorCtx.fillRect(4, 4, 24, 10);
    doorCtx.fillRect(4, 18, 24, 10);
    
    // Door handle
    doorCtx.fillStyle = '#FFD700';
    doorCtx.fillRect(22, 16, 4, 2);
    
    const doorTexture = new THREE.CanvasTexture(doorCanvas);
    doorTexture.magFilter = THREE.NearestFilter;
    doorTexture.minFilter = THREE.NearestFilter;
    
    const doorMaterial = new THREE.MeshBasicMaterial({ map: doorTexture });
    
    // Left door
    const leftDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, height * 0.8, 0.2),
        doorMaterial
    );
    leftDoor.position.set(-1, height * 0.4, depth/2);
    leftDoor.userData = { isDoor: true, isLeft: true };
    houseGroup.add(leftDoor);
    
    // Right door
    const rightDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, height * 0.8, 0.2),
        doorMaterial
    );
    rightDoor.position.set(1, height * 0.4, depth/2);
    rightDoor.userData = { isDoor: true, isLeft: false };
    houseGroup.add(rightDoor);
    
    // Add furniture inside
    
    // Sofa texture
    const sofaCanvas = document.createElement('canvas');
    sofaCanvas.width = 32;
    sofaCanvas.height = 32;
    const sofaCtx = sofaCanvas.getContext('2d');
    
    // Draw sofa fabric
    sofaCtx.fillStyle = '#663399'; // Purple color
    sofaCtx.fillRect(0, 0, 32, 32);
    
    // Add some fabric details
    for (let x = 0; x < sofaCanvas.width; x += 4) {
        for (let y = 0; y < sofaCanvas.height; y += 4) {
            if (Math.random() > 0.8) {
                sofaCtx.fillStyle = '#7a4eb5';
                sofaCtx.fillRect(x, y, 4, 4);
            }
        }
    }
    
    const sofaTexture = new THREE.CanvasTexture(sofaCanvas);
    sofaTexture.magFilter = THREE.NearestFilter;
    sofaTexture.minFilter = THREE.NearestFilter;
    
    // Create sofa base
    const sofa = new THREE.Group();
    
    // Sofa base
    const sofaBase = new THREE.Mesh(
        new THREE.BoxGeometry(10, 2, 4),
        new THREE.MeshBasicMaterial({ map: sofaTexture })
    );
    sofa.add(sofaBase);
    
    // Sofa back
    const sofaBack = new THREE.Mesh(
        new THREE.BoxGeometry(10, 4, 1),
        new THREE.MeshBasicMaterial({ map: sofaTexture })
    );
    sofaBack.position.set(0, 2, -1.5);
    sofa.add(sofaBack);
    
    // Sofa arms
    const sofaArmLeft = new THREE.Mesh(
        new THREE.BoxGeometry(1, 3, 4),
        new THREE.MeshBasicMaterial({ map: sofaTexture })
    );
    sofaArmLeft.position.set(-4.5, 1.5, 0);
    sofa.add(sofaArmLeft);
    
    const sofaArmRight = new THREE.Mesh(
        new THREE.BoxGeometry(1, 3, 4),
        new THREE.MeshBasicMaterial({ map: sofaTexture })
    );
    sofaArmRight.position.set(4.5, 1.5, 0);
    sofa.add(sofaArmRight);
    
    sofa.position.set(0, 1, -5);
    houseGroup.add(sofa);
    
    // Create TV with static
    const tvGroup = new THREE.Group();
    
    // TV stand
    const tvStand = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3, 2),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    tvGroup.add(tvStand);
    
    // TV Screen with static
    const tvScreenCanvas = document.createElement('canvas');
    tvScreenCanvas.width = 64;
    tvScreenCanvas.height = 64;
    const tvScreenCtx = tvScreenCanvas.getContext('2d');
    
    // Initial static pattern
    for (let x = 0; x < tvScreenCanvas.width; x += 2) {
        for (let y = 0; y < tvScreenCanvas.height; y += 2) {
            const gray = Math.floor(Math.random() * 255);
            tvScreenCtx.fillStyle = `rgb(${gray},${gray},${gray})`;
            tvScreenCtx.fillRect(x, y, 2, 2);
        }
    }
    
    const tvScreenTexture = new THREE.CanvasTexture(tvScreenCanvas);
    tvScreenTexture.magFilter = THREE.NearestFilter;
    tvScreenTexture.minFilter = THREE.NearestFilter;
    
    const tvScreen = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 0.2),
        new THREE.MeshBasicMaterial({ map: tvScreenTexture })
    );
    tvScreen.position.set(0, 3, 0);
    tvScreen.userData = { isTV: true, texture: tvScreenTexture, canvas: tvScreenCanvas, context: tvScreenCtx };
    tvGroup.add(tvScreen);
    
    tvGroup.position.set(0, 1.5, -depth/2 + 3);
    houseGroup.add(tvGroup);
    
    // Create a low-poly crying baby
    const babyGroup = new THREE.Group();
    
    // Baby head (low poly sphere)
    const babyHead = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.5, 0),
        new THREE.MeshBasicMaterial({ color: 0xffdbac })
    );
    babyHead.position.y = 0.5;
    babyGroup.add(babyHead);
    
    // Baby body (low poly)
    const babyBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 1, 5),
        new THREE.MeshBasicMaterial({ color: 0xff8fa2 }) // Pink onesie
    );
    babyBody.position.y = -0.2;
    babyGroup.add(babyBody);
    
    // Baby eyes (crying)
    const leftEye = new THREE.Mesh(
        new THREE.CircleGeometry(0.1, 8),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    leftEye.position.set(-0.2, 0.5, 0.4);
    babyGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(
        new THREE.CircleGeometry(0.1, 8),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    rightEye.position.set(0.2, 0.5, 0.4);
    babyGroup.add(rightEye);
    
    // Tears (animated in the animation loop)
    const leftTear = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 })
    );
    leftTear.position.set(-0.2, 0.3, 0.45);
    leftTear.userData = { speed: 0.01, resetY: 0.3 };
    babyGroup.add(leftTear);
    
    const rightTear = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 })
    );
    rightTear.position.set(0.2, 0.3, 0.45);
    rightTear.userData = { speed: 0.012, resetY: 0.3 };
    babyGroup.add(rightTear);
    
    // Mouth (crying expression)
    const mouth = new THREE.Mesh(
        new THREE.CircleGeometry(0.15, 8),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    mouth.position.set(0, 0.2, 0.4);
    babyGroup.add(mouth);
    
    // Position baby on the sofa
    babyGroup.position.set(0, 3, -5);
    babyGroup.scale.set(1.2, 1.2, 1.2);
    houseGroup.add(babyGroup);
    
    // Position the house
    houseGroup.position.set(0, -1, -45); // Changed Z position from -15 to -45 to move house 30 units further forward
    
    // Add update function to the house for animations
    houseGroup.userData = { 
        update: function(time) {
            // Animate TV static
            const tv = tvGroup.children[1];
            if (tv.userData.isTV) {
                // Update static pattern
                for (let x = 0; x < tv.userData.canvas.width; x += 2) {
                    for (let y = 0; y < tv.userData.canvas.height; y += 2) {
                        if (Math.random() > 0.7) {
                            const gray = Math.floor(Math.random() * 255);
                            tv.userData.context.fillStyle = `rgb(${gray},${gray},${gray})`;
                            tv.userData.context.fillRect(x, y, 2, 2);
                        }
                    }
                }
                tv.userData.texture.needsUpdate = true;
            }
            
            // Animate baby tears
            for (let i = 0; i < babyGroup.children.length; i++) {
                const child = babyGroup.children[i];
                if (child.userData.speed) {
                    child.position.y -= child.userData.speed;
                    
                    // Reset tear position when it gets too low
                    if (child.position.y < -0.2) {
                        child.position.y = child.userData.resetY;
                    }
                }
            }
            
            // Make baby body slightly bounce to simulate crying
            const body = babyGroup.children[1];
            body.position.y = -0.2 + Math.sin(time * 10) * 0.05;
            
            // Make baby head slightly shake
            const head = babyGroup.children[0];
            head.rotation.z = Math.sin(time * 15) * 0.1;
        }
    };
    
    return houseGroup;
}

// Function to toggle doors
function toggleDoors(house, open) {
    house.children.forEach(child => {
        if (child.userData && child.userData.isDoor) {
            if (child.userData.isLeft) {
                // Left door rotates open to the left
                child.rotation.y = open ? -Math.PI / 2 : 0;
                if (open) {
                    child.position.x -= 1;
                    child.position.z -= 1;
                } else {
                    child.position.x += 1;
                    child.position.z += 1;
                }
            } else {
                // Right door rotates open to the right
                child.rotation.y = open ? Math.PI / 2 : 0;
                if (open) {
                    child.position.x += 1;
                    child.position.z -= 1;
                } else {
                    child.position.x -= 1;
                    child.position.z += 1;
                }
            }
        }
    });
}

// Setup follow button functionality
function setupFollowButton(username) {
    const followButton = document.getElementById('follow-button');
    let isFollowing = false;
    
    followButton.addEventListener('click', () => {
        isFollowing = !isFollowing;
        
        if (isFollowing) {
            followButton.textContent = 'Following';
            followButton.classList.add('following');
            
            // Create heart particles effect
            createHeartParticles(followButton);
            
            // Increment follower count
            const followerCountElement = document.getElementById('follower-count');
            const currentCount = parseInt(followerCountElement.textContent);
            followerCountElement.textContent = currentCount + 1;
        } else {
            followButton.textContent = 'Follow';
            followButton.classList.remove('following');
            
            // Decrement follower count
            const followerCountElement = document.getElementById('follower-count');
            const currentCount = parseInt(followerCountElement.textContent);
            followerCountElement.textContent = Math.max(0, currentCount - 1);
        }
    });
}

// Create heart particles effect when following
function createHeartParticles(button) {
    const particleCount = 10;
    const colors = ['#ff6e4a', '#ff3333', '#ff8d70', '#ffbfaa'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.innerHTML = '❤️';
        particle.style.position = 'absolute';
        particle.style.fontSize = (10 + Math.random() * 10) + 'px';
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.zIndex = '1000';
        particle.style.userSelect = 'none';
        particle.style.pointerEvents = 'none';
        
        // Start position (centered on button)
        const buttonRect = button.getBoundingClientRect();
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        document.body.appendChild(particle);
        
        // Animation
        const angle = Math.random() * Math.PI * 2;
        const velocity = 1 + Math.random() * 3;
        const startTime = Date.now();
        const duration = 1000 + Math.random() * 1000;
        
        const animation = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                particle.remove();
                return;
            }
            
            const currentX = startX + Math.cos(angle) * velocity * elapsed * 0.1;
            const currentY = startY + Math.sin(angle) * velocity * elapsed * 0.1 - (progress * 40);
            const scale = 1 - progress;
            const opacity = 1 - progress;
            
            particle.style.transform = `translate(-50%, -50%) scale(${scale})`;
            particle.style.left = currentX + 'px';
            particle.style.top = currentY + 'px';
            particle.style.opacity = opacity;
            
            requestAnimationFrame(animation);
        };
        
        requestAnimationFrame(animation);
    }
}

// Helper function to format numbers (e.g. 1000 -> 1K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
