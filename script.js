document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('synthwave');
    const ctx = canvas.getContext('2d');

    // Control panel elements
    const controls = {
        gravity: document.getElementById('gravity'),
        bounce: document.getElementById('bounce'),
        initialVelocity: document.getElementById('initialVelocity'),
        stickerSize: document.getElementById('stickerSize'),
        stickerCount: document.getElementById('stickerCount'),
        restart: document.getElementById('restart'),
        togglePanel: document.getElementById('togglePanel'),
        showPanel: document.getElementById('showPanel')
    };

    // Simulation parameters
    let params = {
        gravity: 0.2,
        bounce: 0.8,
        initialVelocity: 5,
        stickerSize: 80,
        stickerCount: 6
    };

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
            });
            updateValueDisplay(control);
        }
    });

    // Toggle control panel visibility
    function toggleControlPanel(show) {
        const panel = document.querySelector('.control-panel');
        const showButton = controls.showPanel;
        
        if (show === undefined) {
            show = panel.classList.contains('hidden');
        }
        
        if (show) {
            panel.classList.remove('hidden');
            showButton.classList.remove('visible');
        } else {
            panel.classList.add('hidden');
            showButton.classList.add('visible');
        }
    }

    controls.togglePanel.addEventListener('click', () => toggleControlPanel(false));
    controls.showPanel.addEventListener('click', () => toggleControlPanel(true));

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
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
        }

        update() {
            // Update position
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;

            // Bounce off walls
            if (this.x < 0 || this.x > canvas.width - this.size) {
                this.vx *= -params.bounce;
                this.x = Math.max(0, Math.min(this.x, canvas.width - this.size));
            }
            if (this.y < 0 || this.y > canvas.height - this.size) {
                this.vy *= -params.bounce;
                this.y = Math.max(0, Math.min(this.y, canvas.height - this.size));
            }

            // Add gravity
            this.vy += params.gravity;
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
            
            if (distance < this.size/2 + other.size/2) {
                // Collision detected - calculate new velocities
                const angle = Math.atan2(dy, dx);
                const speed1 = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const speed2 = Math.sqrt(other.vx * other.vx + other.vy * other.vy);
                
                const direction1 = Math.atan2(this.vy, this.vx);
                const direction2 = Math.atan2(other.vy, other.vx);
                
                const newVx1 = speed2 * Math.cos(direction2 - angle) * Math.cos(angle);
                const newVy1 = speed2 * Math.cos(direction2 - angle) * Math.sin(angle);
                const newVx2 = speed1 * Math.cos(direction1 - angle) * Math.cos(angle);
                const newVy2 = speed1 * Math.cos(direction1 - angle) * Math.sin(angle);
                
                this.vx = newVx1 * params.bounce;
                this.vy = newVy1 * params.bounce;
                other.vx = newVx2 * params.bounce;
                other.vy = newVy2 * params.bounce;
                
                // Add some rotation on collision
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

    createStickers();

    // Restart simulation
    controls.restart.addEventListener('click', () => {
        createStickers();
    });

    // Wave properties
    const waves = [];
    const numWaves = 5;
    const waveSpacing = 100;
    
    for (let i = 0; i < numWaves; i++) {
        waves.push({
            frequency: 0.02 + (Math.random() * 0.02),
            amplitude: 50 + (Math.random() * 30),
            speed: 0.05 + (Math.random() * 0.03),
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

        time += 0.016;
        requestAnimationFrame(animate);
    }

    animate();
}); 