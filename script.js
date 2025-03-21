document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('synthwave');
    const ctx = canvas.getContext('2d');

    // Add close button handlers
    document.getElementById('closePopup').addEventListener('click', () => {
        document.getElementById('winPopup').classList.remove('show');
    });

    document.getElementById('closeInstructions').addEventListener('click', () => {
        document.getElementById('instructionsPopup').classList.remove('show');
    });

    // Add instructions button handler
    document.getElementById('showInstructions').addEventListener('click', () => {
        document.getElementById('instructionsPopup').classList.add('show');
    });

    // Game UI elements
    const gameStats = document.querySelector('.game-stats');
    const timeDisplay = document.getElementById('timeDisplay');
    const stickersRemainingDisplay = document.getElementById('stickersRemaining');
    const playButton = document.getElementById('playButton');

    // Game state
    let gameActive = false;
    let gameStartTime = 0;
    let gameTimer = null;

    // Control panel elements
    const controls = {
        gravity: document.getElementById('gravity'),
        bounce: document.getElementById('bounce'),
        initialVelocity: document.getElementById('initialVelocity'),
        stickerSize: document.getElementById('stickerSize'),
        stickerCount: document.getElementById('stickerCount'),
        togglePanel: document.getElementById('togglePanel'),
        showPanel: document.getElementById('showPanel')
    };

    // Control panel visibility
    controls.showPanel.addEventListener('click', () => {
        document.querySelector('.control-panel').classList.add('visible');
        controls.showPanel.style.display = 'none';
    });

    controls.togglePanel.addEventListener('click', () => {
        document.querySelector('.control-panel').classList.remove('visible');
        controls.showPanel.style.display = 'block';
    });

    // Simulation parameters
    let params = {
        gravity: 0.2,
        bounce: 0.5,
        initialVelocity: 5,
        stickerSize: 150,
        stickerCount: 6
    };

    // Set initial bounce value
    controls.bounce.value = '0.5';
    controls.bounce.nextElementSibling.textContent = '0.5';

    // Game functions
    function startGame() {
        // Reset game state
        gameActive = true;
        gameStartTime = Date.now();
        gameStats.classList.add('visible');
        playButton.textContent = 'Restart Game';
        
        // Reset timer
        if (gameTimer) clearInterval(gameTimer);
        gameTimer = setInterval(updateTimer, 100);
        
        // Clear existing stickers and create new ones
        stickers = [];
        createStickers();
        
        // Update sticker count after creating stickers
        stickersRemaining = stickers.length;
        updateStickerCount();
    }

    function endGame() {
        gameActive = false;
        clearInterval(gameTimer);
        playButton.textContent = 'Play Again';
        gameStats.classList.remove('visible');
        document.getElementById('winPopup').classList.add('show');
    }

    function updateTimer() {
        if (!gameActive) return;
        
        const elapsed = Date.now() - gameStartTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function updateStickerCount() {
        stickersRemainingDisplay.textContent = stickers.length.toString();
        // Only end game if we're in an active game and stickers are clicked
        if (stickers.length === 0 && gameActive) {
            endGame();
        }
    }

    // Animation variables
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    let mouseTrail = [];
    const maxTrailLength = 20;

    // Particle system
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 15 + 5;  // Increased speed range
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1.0;
            this.size = Math.random() * 8 + 4;  // Increased size
            this.color = Math.random() > 0.5 ? 
                {r: 255, g: 0, b: 255} :  // Magenta
                {r: 0, g: 255, b: 255};   // Cyan
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.2; // Add gravity to particles
            this.vx *= 0.98; // Add air resistance
            this.vy *= 0.98;
            this.life -= 0.015; // Slower fade out
            this.size *= 0.97;
        }

        draw(ctx) {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );
            const alpha = this.life;
            gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`);
            gradient.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let particles = [];

    function createExplosion(x, y) {
        // Create more particles for a bigger explosion
        for (let i = 0; i < 40; i++) {
            particles.push(new Particle(x, y));
        }
    }

    // Click handling
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

        // Create explosion at click position (now always active)
        createExplosion(clickX, clickY);

        // Only check for sticker clicks if game is active
        if (gameActive) {
            // Check each sticker for click
            for (let i = stickers.length - 1; i >= 0; i--) {
                const sticker = stickers[i];
                const centerX = sticker.x + sticker.size/2;
                const centerY = sticker.y + sticker.size/2;
                const distance = Math.sqrt(
                    Math.pow(clickX - centerX, 2) + 
                    Math.pow(clickY - centerY, 2)
                );

                if (distance < sticker.size/2) {
                    stickers.splice(i, 1);
                    updateStickerCount();
                    // Create an additional explosion when hitting a sticker
                    createExplosion(centerX, centerY);
                    break;
                }
            }
        }
    });

    // Play button handler
    playButton.addEventListener('click', () => {
        // Always hide popup first
        const popup = document.getElementById('winPopup');
        popup.classList.remove('show');
        
        // Start a new game
        startGame();
    });

    // Update parameter displays
    function updateValueDisplay(input) {
        input.nextElementSibling.textContent = input.value;
    }

    // Add input listeners
    Object.entries(controls).forEach(([key, control]) => {
        if (control && control.type === 'range') {
            control.addEventListener('input', (e) => {
                params[key] = parseFloat(e.target.value);
                updateValueDisplay(e.target);
                if (!gameActive) {
                    createStickers();
                    updateStickerCount();
                }
            });
            updateValueDisplay(control);
        }
    });

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        
        // Add current position to trail
        mouseTrail.push({ x: e.clientX, y: e.clientY });
        if (mouseTrail.length > maxTrailLength) {
            mouseTrail.shift();
        }
    });

    // Sticker class for physics and rendering
    class Sticker {
        constructor(imagePath, size = params.stickerSize) {
            this.image = new Image();
            this.image.src = imagePath;
            this.size = size;
            this.reset();
        }

        reset() {
            this.x = Math.random() * (canvas.width - this.size);
            this.y = Math.random() * (canvas.height - this.size);
            this.vx = (Math.random() - 0.5) * params.initialVelocity * 2;
            this.vy = (Math.random() - 0.5) * params.initialVelocity * 2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.1;
            this.lastCollisionTime = 0;
        }

        update() {
            // Apply minimum velocity threshold
            const minVelocity = 0.1;
            if (Math.abs(this.vx) < minVelocity && Math.abs(this.vy) < minVelocity) {
                this.vx = Math.sign(this.vx) * minVelocity || minVelocity;
                this.vy = Math.sign(this.vy) * minVelocity || minVelocity;
            }

            // Update position
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;

            // Bounce off walls with a small random component
            if (this.x < 0 || this.x > canvas.width - this.size) {
                this.vx *= -params.bounce;
                this.vx += (Math.random() - 0.5) * 0.5; // Add small random impulse
                this.x = Math.max(0, Math.min(this.x, canvas.width - this.size));
            }
            if (this.y < 0 || this.y > canvas.height - this.size) {
                this.vy *= -params.bounce;
                this.vy += (Math.random() - 0.5) * 0.5; // Add small random impulse
                this.y = Math.max(0, Math.min(this.y, canvas.height - this.size));
            }

            // Add gravity
            this.vy += params.gravity;

            // Apply maximum velocity limit to prevent excessive speeds
            const maxVelocity = 15;
            const currentVelocity = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentVelocity > maxVelocity) {
                const scale = maxVelocity / currentVelocity;
                this.vx *= scale;
                this.vy *= scale;
            }
        }

        draw() {
            if (!this.image.complete) return;
            
            ctx.save();
            ctx.translate(this.x + this.size/2, this.y + this.size/2);
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }

        checkCollision(other) {
            const dx = (this.x + this.size/2) - (other.x + other.size/2);
            const dy = (this.y + this.size/2) - (other.y + other.size/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (this.size + other.size) / 2;
            
            if (distance < minDistance) {
                // Prevent continuous collisions
                const now = Date.now();
                if (now - this.lastCollisionTime < 100 || now - other.lastCollisionTime < 100) {
                    return;
                }
                this.lastCollisionTime = now;
                other.lastCollisionTime = now;

                // Calculate collision normal
                const nx = dx / distance;
                const ny = dy / distance;

                // Separate the stickers
                const overlap = minDistance - distance;
                const separationX = nx * overlap * 0.5;
                const separationY = ny * overlap * 0.5;

                this.x += separationX;
                this.y += separationY;
                other.x -= separationX;
                other.y -= separationY;

                // Calculate relative velocity
                const rvx = this.vx - other.vx;
                const rvy = this.vy - other.vy;

                // Calculate relative velocity in terms of the normal direction
                const velAlongNormal = rvx * nx + rvy * ny;

                // Do not resolve if objects are separating
                if (velAlongNormal > 0) {
                    return;
                }

                // Calculate restitution (bounce)
                const restitution = params.bounce;

                // Calculate impulse scalar
                const j = -(1 + restitution) * velAlongNormal;
                const impulseX = j * nx;
                const impulseY = j * ny;

                // Apply impulse
                this.vx += impulseX;
                this.vy += impulseY;
                other.vx -= impulseX;
                other.vy -= impulseY;

                // Add small random impulse to break symmetry
                const randomImpulse = 0.3;
                this.vx += (Math.random() - 0.5) * randomImpulse;
                this.vy += (Math.random() - 0.5) * randomImpulse;
                other.vx += (Math.random() - 0.5) * randomImpulse;
                other.vy += (Math.random() - 0.5) * randomImpulse;

                // Update rotation speeds
                this.rotationSpeed = (Math.random() - 0.5) * 0.2;
                other.rotationSpeed = (Math.random() - 0.5) * 0.2;
            }
        }
    }

    // Create stickers
    const stickerImages = [
        'images/stickers/party.png',
        'images/stickers/flamenca.png',
        'images/stickers/skater-1.png',
        'images/stickers/moto.png',
        'images/stickers/paracaidas.png',
        'images/stickers/thumbsup.png',
        'images/stickers/baby.png',
        'images/stickers/call-center.png',
        'images/stickers/skater-2.png',
        'images/stickers/bitcoin_worker.png',
        'images/stickers/torre_pisa.png',
        'images/stickers/running.png',
        'images/stickers/typing.png',
        'images/stickers/stonks.png',
        'images/stickers/selfie.png',
        'images/stickers/idontknow.png',
        'images/stickers/eating_tortilla2.png',
        'images/stickers/eating_tortilla.png',
        'images/stickers/sexy.png',
        'images/stickers/crying.png',
        'images/stickers/angry.png',
        'images/stickers/thumbsup_2.png',
        'images/stickers/muerto.png',
        'images/stickers/tragon.png'
    ];

    let stickers = [];

    function createStickers() {
        const count = Math.min(parseInt(params.stickerCount), stickerImages.length);
        stickers = stickerImages
            .slice(0, count)
            .map(path => new Sticker(path, params.stickerSize));
    }

    // Create initial stickers for preview
    createStickers();
    updateStickerCount();

    // Wave properties
    const waves = [];
    const numWaves = 5;
    const waveSpacing = 100;
    
    for (let i = 0; i < numWaves; i++) {
        waves.push({
            frequency: 0.02 + (Math.random() * 0.02),
            amplitude: 50 + (Math.random() * 30),
            speed: 0.15 + (Math.random() * 0.05),
            phase: Math.random() * Math.PI * 2
        });
    }

    // Animation function
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000022');
        gradient.addColorStop(0.5, '#220033');
        gradient.addColorStop(1, '#330033');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles = particles.filter(p => p.life > 0);
        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });

        // Draw mouse trail
        mouseTrail.forEach((point, index) => {
            const alpha = (index / maxTrailLength) * 0.5;
            const size = (index / maxTrailLength) * 10;
            
            const trailGradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, size
            );
            trailGradient.addColorStop(0, `rgba(0, 255, 255, ${alpha})`);
            trailGradient.addColorStop(0.5, `rgba(255, 0, 255, ${alpha * 0.5})`);
            trailGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = trailGradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Add stars
        for (let i = 0; i < 100; i++) {
            const x = (Math.sin(time * 0.1 + i) * 0.5 + 0.5) * canvas.width;
            const y = (Math.cos(time * 0.1 + i) * 0.5 + 0.5) * canvas.height * 0.7;
            const size = Math.random() * 2 + 1;
            const alpha = Math.sin(time * 2 + i) * 0.5 + 0.5;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw sun
        const sunX = canvas.width * 0.5 + mouseX * 50;
        const sunY = canvas.height * 0.3 + mouseY * 30;
        const sunRadius = 60 + Math.sin(time) * 5;

        const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
        sunGradient.addColorStop(0, '#ff2b2b');
        sunGradient.addColorStop(0.3, '#ff00ff');
        sunGradient.addColorStop(0.6, '#ff00ff33');
        sunGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw grid with waves
        const horizonY = canvas.height * 0.6;
        const gridPoints = [];
        const gridSize = 20;
        const cellSize = canvas.width / gridSize;

        // Calculate grid points with wave effect
        for (let z = 0; z < 20; z++) {
            const row = [];
            const progress = z / 19;
            const perspectiveScale = Math.pow(progress, 2);
            
            for (let x = 0; x <= gridSize; x++) {
                let xPos = x * cellSize - canvas.width / 2;
                xPos *= perspectiveScale;
                xPos += canvas.width / 2;

                let yOffset = 0;
                waves.forEach(wave => {
                    yOffset += Math.sin(
                        (x / gridSize) * Math.PI * 2 * wave.frequency + 
                        time * wave.speed + 
                        wave.phase + 
                        z * 0.2
                    ) * wave.amplitude * perspectiveScale;
                });

                const y = horizonY + (canvas.height - horizonY) * progress + yOffset;
                row.push({x: xPos, y: y});
            }
            gridPoints.push(row);
        }

        // Draw grid lines
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Vertical lines
        for (let x = 0; x <= gridSize; x++) {
            ctx.moveTo(gridPoints[0][x].x, gridPoints[0][x].y);
            for (let z = 1; z < gridPoints.length; z++) {
                ctx.lineTo(gridPoints[z][x].x, gridPoints[z][x].y);
            }
        }

        // Horizontal lines
        for (let z = 0; z < gridPoints.length; z++) {
            ctx.moveTo(gridPoints[z][0].x, gridPoints[z][0].y);
            for (let x = 1; x <= gridSize; x++) {
                ctx.lineTo(gridPoints[z][x].x, gridPoints[z][x].y);
            }
        }

        ctx.stroke();

        // Update and draw stickers
        for (let i = 0; i < stickers.length; i++) {
            stickers[i].update();
            // Check collisions with other stickers
            for (let j = i + 1; j < stickers.length; j++) {
                stickers[i].checkCollision(stickers[j]);
            }
            stickers[i].draw();
        }

        time += 0.032;
        requestAnimationFrame(animate);
    }

    animate();
}); 