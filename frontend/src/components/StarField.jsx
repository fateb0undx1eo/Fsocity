import { useEffect, useRef } from "react";

// Pure ambient drifting stars — no interaction, dark mode only
const COUNT = 140;
const BASE_SPEED = 0.22;

export default function StarField() {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        // Spawn
        const stars = Array.from({ length: COUNT }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = BASE_SPEED * (0.3 + Math.random() * 1.1);
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 1.4 + 0.3,
                baseOpacity: Math.random() * 0.5 + 0.15,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.022 + 0.005,
            };
        });

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach(s => {
                // Drift
                s.x += s.vx;
                s.y += s.vy;

                // Seamless edge wrap
                const pad = 10;
                if (s.x < -pad) s.x = canvas.width + pad;
                if (s.x > canvas.width + pad) s.x = -pad;
                if (s.y < -pad) s.y = canvas.height + pad;
                if (s.y > canvas.height + pad) s.y = -pad;

                // Twinkle
                s.twinklePhase += s.twinkleSpeed;
                const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase);
                const opacity = s.baseOpacity * twinkle;

                // Halo glow
                const haloR = s.size * 3.8;
                const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
                grad.addColorStop(0, `rgba(210,220,255,${opacity * 0.38})`);
                grad.addColorStop(1, `rgba(210,220,255,0)`);
                ctx.beginPath();
                ctx.arc(s.x, s.y, haloR, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // Bright core
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230,235,255,${Math.min(1, opacity * 2)})`;
                ctx.fill();
            });

            rafRef.current = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed", inset: 0,
                width: "100%", height: "100%",
                pointerEvents: "none",
                zIndex: 0,
            }}
        />
    );
}
