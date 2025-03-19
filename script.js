document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('synthwave');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = canvas.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = 1 - (e.clientY / window.innerHeight);
    });

    // Grid properties
    const gridSpacing = 50;
    const horizonY = canvas.height * 0.5;
    const perspectiveScale = 4;

    // Animation function
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#ff00ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.beginPath();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;

        // Vertical lines
        for (let x = -gridSpacing * 10; x < canvas.width + gridSpacing * 10; x += gridSpacing) {
            const offsetX = (x + time * 50 + mouseX * 100) % (canvas.width + gridSpacing * 20) - gridSpacing * 10;
            
            ctx.moveTo(offsetX, canvas.height);
            for (let y = canvas.height; y > horizonY; y -= 1) {
                const perspective = (y - horizonY) / (canvas.height - horizonY);
                const xPos = offsetX + (canvas.width * 0.5 - offsetX) * (1 - perspective) * perspectiveScale;
                ctx.lineTo(xPos, y);
            }
        }

        // Horizontal lines
        for (let z = 0; z < 20; z++) {
            const perspective = z / 20;
            const y = horizonY + (canvas.height - horizonY) * perspective;
            const xStart = canvas.width * 0.5 - canvas.width * perspective * perspectiveScale;
            const xEnd = canvas.width * 0.5 + canvas.width * perspective * perspectiveScale;
            
            ctx.moveTo(xStart, y);
            ctx.lineTo(xEnd, y);
        }

        ctx.stroke();

        // Sun
        const sunRadius = 50 + Math.sin(time * 2) * 10;
        const sunX = canvas.width * 0.5 + mouseX * 100;
        const sunY = horizonY - 50 + mouseY * 50;

        const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
        sunGradient.addColorStop(0, '#ff00ff');
        sunGradient.addColorStop(0.5, '#ff00ff55');
        sunGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        time += 0.01;
        requestAnimationFrame(animate);
    }

    animate();
}); 