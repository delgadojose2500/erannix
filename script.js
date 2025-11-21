document.addEventListener('DOMContentLoaded', () => {
    const timerElement = document.getElementById('timer');
    const imageElement = document.getElementById('status-image');
    const labelElement = document.querySelector('.label');

    // Configuración: Fecha y hora objetivo (Año, Mes (0-11), Día, Hora, Minuto, Segundo)
    // Nota: Los meses en JavaScript van de 0 (Enero) a 11 (Diciembre)
    // Ejemplo: Para el 31 de Diciembre de 2025 a las 23:59:59
    const targetDate = new Date(2026, 0, 6, 0, 0, 0).getTime();

    // Rutas de las imágenes
    const activeImage = 'active.png';
    const finishedImage = 'finished.png';

    function updateDisplay(distance) {
        // Cálculos de tiempo para días, horas, minutos y segundos
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Formateo con ceros a la izquierda
        const d = days > 0 ? `${days} días ` : '';
        const h = hours.toString().padStart(2, '0');
        const m = minutes.toString().padStart(2, '0');
        const s = seconds.toString().padStart(2, '0');

        timerElement.textContent = `${d}${h}:${m}:${s}`;
    }

    function finishCountdown() {
        timerElement.textContent = "00:00:00";
        labelElement.textContent = "¡Regalo Desbloqueado!";

        // Cambiar imagen con una pequeña animación de opacidad
        imageElement.style.opacity = 0;

        setTimeout(() => {
            imageElement.src = finishedImage;
            imageElement.onload = () => {
                imageElement.style.opacity = 1;
            };
            // En caso de que la imagen ya esté en caché y cargue instantáneamente
            if (imageElement.complete) {
                imageElement.style.opacity = 1;
            }
        }, 200);

        // Efecto visual extra en el texto
        timerElement.style.color = "#d32f2f"; // Rojo más oscuro para fondo claro
        timerElement.style.textShadow = "0 0 30px rgba(211, 47, 47, 0.4)";
    }

    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance > 0) {
            updateDisplay(distance);
        } else {
            clearInterval(countdownInterval);
            finishCountdown();
        }
    }, 1000);

    // Inicializar display
    const now = new Date().getTime();
    const distance = targetDate - now;
    if (distance > 0) {
        updateDisplay(distance);
    } else {
        finishCountdown();
    }

    // --- Lógica del Juego Flappy Gift ---
    const card = document.querySelector('.card');
    const playBtn = document.getElementById('play-btn');
    const backBtn = document.getElementById('back-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    // Voltear tarjeta
    playBtn.addEventListener('click', () => {
        card.classList.add('flipped');
    });

    backBtn.addEventListener('click', () => {
        card.classList.remove('flipped');
        stopGame();
    });

    // Variables del juego
    let bird = { x: 50, y: 150, width: 20, height: 20, velocity: 0, gravity: 0.5, jump: -8 };
    let pipes = [];
    let score = 0;
    let gameInterval;
    let isGameRunning = false;
    let frameCount = 0;

    function startGame() {
        if (isGameRunning) return;
        isGameRunning = true;
        score = 0;
        scoreElement.textContent = score;
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        frameCount = 0;
        startGameBtn.textContent = "Reiniciar";

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    }

    function stopGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
        startGameBtn.textContent = "Empezar";
    }

    startGameBtn.addEventListener('click', startGame);

    // Controles (Click y Touch)
    function jump() {
        if (!isGameRunning) return;
        bird.velocity = bird.jump;
    }

    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        jump();
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Evitar scroll
        jump();
    }, { passive: false });

    function gameLoop() {
        // Actualizar pájaro
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Límites del techo y suelo
        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            gameOver();
            return;
        }

        // Generar tuberías
        if (frameCount % 100 === 0) {
            const gap = 120;
            const minHeight = 50;
            const maxHeight = canvas.height - gap - minHeight;
            const height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

            pipes.push({
                x: canvas.width,
                y: 0,
                width: 40,
                height: height,
                passed: false
            });

            pipes.push({
                x: canvas.width,
                y: height + gap,
                width: 40,
                height: canvas.height - height - gap,
                passed: false
            });
        }

        // Mover tuberías
        for (let i = 0; i < pipes.length; i++) {
            pipes[i].x -= 2;

            // Colisión
            if (
                bird.x < pipes[i].x + pipes[i].width &&
                bird.x + bird.width > pipes[i].x &&
                bird.y < pipes[i].y + pipes[i].height &&
                bird.y + bird.height > pipes[i].y
            ) {
                gameOver();
                return;
            }

            // Puntuación
            if (pipes[i].x + pipes[i].width < bird.x && !pipes[i].passed && i % 2 === 0) {
                score++;
                scoreElement.textContent = score;
                pipes[i].passed = true;
            }
        }

        // Eliminar tuberías viejas
        if (pipes.length > 0 && pipes[0].x < -40) {
            pipes.shift();
            pipes.shift();
        }

        frameCount++;
        draw();
    }

    function draw() {
        // Limpiar canvas completamente antes de dibujar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fondo (opcional, si quieres que tenga un color específico, si no transparente)
        // ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pájaro (Regalo)
        ctx.fillStyle = '#d32f2f'; // Rojo regalo
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

        // Lazo del regalo (Cruz amarilla simple)
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(bird.x + bird.width / 2 - 2, bird.y, 4, bird.height); // Vertical
        ctx.fillRect(bird.x, bird.y + bird.height / 2 - 2, bird.width, 4); // Horizontal

        // Tuberías (Bloques verdes sólidos y limpios)
        ctx.fillStyle = '#2e7d32'; // Verde oscuro
        for (let i = 0; i < pipes.length; i++) {
            // Dibujar tubería como un bloque sólido sin bordes extraños
            ctx.fillRect(pipes[i].x, pipes[i].y, pipes[i].width, pipes[i].height);

            // Opcional: Un borde superior/inferior simple para darle volumen (estilo Mario)
            ctx.fillStyle = '#1b5e20'; // Verde más oscuro para el borde
            if (pipes[i].y === 0) { // Tubería superior
                ctx.fillRect(pipes[i].x - 2, pipes[i].height - 20, pipes[i].width + 4, 20);
            } else { // Tubería inferior
                ctx.fillRect(pipes[i].x - 2, pipes[i].y, pipes[i].width + 4, 20);
            }
            ctx.fillStyle = '#2e7d32'; // Restaurar color para la siguiente iteración
        }
    }

    function gameOver() {
        stopGame();
        // Dibujar texto Game Over
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        startGameBtn.textContent = "Reintentar";
    }
});
