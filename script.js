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
});
