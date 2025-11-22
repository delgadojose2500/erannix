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

    // --- Sistema de Sonido (Web Audio API) ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const sounds = {
        jump: () => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        },
        score: () => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        },
        crash: () => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        },
        flip: () => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        }
    };

    // --- Lógica del Juego Flappy Gift ---
    const card = document.querySelector('.card');
    const cardBack = document.querySelector('.card-back');
    const playBtn = document.getElementById('play-btn');
    const backBtn = document.getElementById('back-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const continueBtn = document.getElementById('continue-btn');
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    // Voltear tarjeta
    playBtn.addEventListener('click', () => {
        card.classList.add('flipped');
        if (audioCtx.state === 'suspended') audioCtx.resume(); // Inicializar audio
    });

    backBtn.addEventListener('click', () => {
        card.classList.remove('flipped');
        stopGame();
        // Resetear vista de pista si estaba activa
        setTimeout(() => {
            cardBack.classList.remove('reveal-clue');
            resetBoosterCards();
        }, 500);
    });

    continueBtn.addEventListener('click', () => {
        cardBack.classList.remove('reveal-clue');
        resetBoosterCards();
        // Opcional: Reiniciar juego o continuar
        startGame();
    });

    // Variable para controlar si ya se ha seleccionado una carta
    let cardSelected = false;

    // Función para voltear cartas booster
    window.flipCard = function (cardElement) {
        // Si ya hay una carta seleccionada o esta ya está volteada, no hacer nada
        if (cardSelected || cardElement.classList.contains('flipped')) return;

        sounds.flip(); // Sonido de volteo
        cardSelected = true; // Marcar como seleccionado

        // Voltear la carta seleccionada
        cardElement.classList.add('flipped');

        // Deshabilitar visualmente las otras cartas (opcional, pero queda bien)
        const allCards = document.querySelectorAll('.booster-card');
        allCards.forEach(card => {
            if (card !== cardElement) {
                card.style.opacity = '0.5';
                card.style.cursor = 'default';
            }
        });

        // Mostrar botón de continuar después de un momento
        setTimeout(() => {
            continueBtn.style.opacity = '1';
            continueBtn.style.pointerEvents = 'auto';
        }, 800);
    };

    function resetBoosterCards() {
        cardSelected = false; // Resetear flag
        const boosterCards = document.querySelectorAll('.booster-card');
        boosterCards.forEach(card => {
            card.classList.remove('flipped');
            // Restaurar estilos
            card.style.opacity = '1';
            card.style.cursor = 'pointer';
        });
        continueBtn.style.opacity = '0';
        continueBtn.style.pointerEvents = 'none';

        // Resetear estilos forzados
        const gameLayer = document.getElementById('game-layer');
        const clueLayer = document.getElementById('clue-layer');
        if (gameLayer) {
            gameLayer.style.opacity = '';
            gameLayer.style.pointerEvents = '';
        }
        if (clueLayer) {
            clueLayer.style.opacity = '';
            clueLayer.style.zIndex = '';
            clueLayer.style.pointerEvents = '';
        }
    }

    // Variables del juego
    let bird = { x: 50, y: 150, width: 20, height: 20, velocity: 0, gravity: 0.5, jump: -8 };
    let pipes = [];
    let score = 0;
    let gameInterval;
    let isGameRunning = false;
    let frameCount = 0;
    let clueUnlocked = false; // Flag para saber si ya se mostró la pista en esta partida

    function startGame() {
        if (isGameRunning) return;
        isGameRunning = true;
        score = 0;
        scoreElement.textContent = score;
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        frameCount = 0;
        clueUnlocked = false; // Resetear flag
        startGameBtn.textContent = "Reiniciar";
        cardBack.classList.remove('reveal-clue'); // Asegurar que se ve el juego
        resetBoosterCards();

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    }

    function stopGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
        startGameBtn.textContent = "Empezar";
    }

    function revealClue() {
        console.log("revealClue called - Executing visual changes");
        stopGame();
        const cb = document.querySelector('.card-back');
        cb.classList.add('reveal-clue');

        // Forzar estilos por si el CSS falla
        const gameLayer = document.getElementById('game-layer');
        const clueLayer = document.getElementById('clue-layer');

        if (gameLayer) {
            gameLayer.style.opacity = '0';
            gameLayer.style.pointerEvents = 'none';
        }

        if (clueLayer) {
            clueLayer.style.opacity = '1';
            clueLayer.style.zIndex = '10';
            clueLayer.style.pointerEvents = 'auto';
            clueLayer.style.transform = 'scale(1)';
        }
    }

    startGameBtn.addEventListener('click', startGame);

    // Controles (Click y Touch)
    function jump() {
        if (!isGameRunning) return;
        bird.velocity = bird.jump;
        sounds.jump(); // Sonido de salto
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
                sounds.score(); // Sonido de punto
                console.log("Puntuación actual:", score);

                // DESBLOQUEAR PISTA AL LLEGAR A 1 (o 10)
                if (score === 10 && !clueUnlocked) {
                    console.log("¡Puntuación objetivo alcanzada! Revelando pista...");
                    clueUnlocked = true;
                    revealClue();
                    return; // Detener loop
                }
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
        sounds.crash(); // Sonido de choque
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
