document.addEventListener("DOMContentLoaded", function () {

  // PARTICULAS NO PAINEL PRINCIPAL
  if (document.getElementById("particles-js")) {
    particlesJS("particles-js", {
      particles: {
        number: { value: 40, density: { enable: true, value_area: 800 } },
        color: { value: "#00ffe1" },
        shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
        opacity: { value: 0.3, random: false },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#00ffe1",
          opacity: 0.2,
          width: 1
        },
        move: { enable: true, speed: 1, direction: "none", out_mode: "bounce" }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          grab: { distance: 200, line_linked: { opacity: 0.2 } },
          repulse: { distance: 120, duration: 0.4 },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  }

});