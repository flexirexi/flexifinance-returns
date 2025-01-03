// JavaScript for Theme Toggle and Interactivity
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;
const menuButton = document.getElementById('menu-button');
const navLinks = document.querySelector('.nav-links');
const nav_header = document.getElementById("nav-header");
let lineChartPrice;
let barChartReturns;
let scrollTimeout;

// Menü öffnen/schließen
menuButton.addEventListener('click', () => {
    // Wenn das Menü geschlossen wird, setze die ursprünglichen Farben zurück
    if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open'); // Schließt das Menü

    } else {
        navLinks.classList.toggle('open'); // Schaltet die 'open'-Klasse ein/aus
    }

});

// Menü ausblenden, wenn außerhalb geklickt wird
document.addEventListener('click', (e) => {
    // Überprüfe, ob der Klick NICHT auf das Menü oder den Button war
    if (!navLinks.contains(e.target) && !menuButton.contains(e.target)) {
        navLinks.classList.remove('open'); // Schließt das Menü

    }
});

// Funktion zum Setzen der CSS-Variablen basierend auf dem aktuellen Theme
function applyTheme(theme) {
    const nav = document.querySelector('nav');
	const toggle = document.getElementById("theme-toggle");
    const aside = document.getElementsByClassName("dataset-summary");

    if (theme === 'light mode') {
        root.style.setProperty('--primary-text', 'var(--secondary-text)');
        root.style.setProperty('--primary-bg', 'var(--secondary-bg)');
		root.style.setProperty('--primary-title', 'var(--secondary-title');
        root.style.setProperty("--primary-acc", "var(--secondary-acc");
        root.style.setProperty('--gradient-color-1', '#f0f0f0');
        root.style.setProperty('--gradient-color-2', '#e0e0e0');
        root.style.setProperty('--gradient-color-3', '#d0d0d0');
        root.style.setProperty("--glass", "#00000011");
        root.style.setProperty("--glass2", "#00000006");
        root.style.setProperty("--glass-color", "#2e8f853e");
		nav.classList.remove('scrolled'); // Zurück zum Standardzustand
		toggle.innerText = "dark mode";
		// Navbar remains primary-bg in bright mode
        if (nav) nav.style.background = 'var(--primary-bg)';
        if (window.innerWidth < 768) {
            aside[0].style.background =  'linear-gradient(90deg, var(--dis-bg), var(--dis-bg), var(--dis-bg), var(--dis-bg))';
        } else {
            aside[0].style.background =  'linear-gradient(90deg, var(--glass), var(--glass), var(--glass), var(--glass2))';
        }
		
    } else {
        root.style.setProperty('--primary-text', '#dae6e5');
        root.style.setProperty('--primary-bg', '#2E3B4E');
		root.style.setProperty('--primary-title', '#2DC9BA');
        root.style.setProperty("--primary-acc", "#ffc44c");
        root.style.setProperty('--gradient-color-1', '#1B2838');
        root.style.setProperty('--gradient-color-2', '#2E3B4E');
        root.style.setProperty('--gradient-color-3', '#34495E');
        root.style.setProperty("--glass", "#00000000");
        root.style.setProperty("--glass2", "#00000000");
        root.style.setProperty("--glass-color", "#0b24225f");
		window.dispatchEvent(new Event("scroll"));
        toggle.innerText = "light mode";
		// Navbar becomes transparent in dark mode
        //if (nav) nav.style.backgroundColor = 'transparent';
		if (window.innerWidth < 768) {
            aside[0].style.background =  getComputedStyle(root).getPropertyValue('--primary-bg').trim();
        } else {
            aside[0].style.background =  "transparent";
        }
    }
}

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark mode' ? 'light mode' : 'dark mode';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme); // Aktualisiere die CSS-Variablen
    navLinks.classList.remove('open'); // Schließt das Menü

    //Aktualisiere die Farben der Charts
    updateChartColors(lineChartPrice);
    updateChartColors(barChartReturns);
});


// Initialize charts (dummy data for line chart and histogram)
const initCharts = () => {
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const histogramCtx = document.getElementById('histogram').getContext('2d');

    let data1 = [1535000, 1560000, 1627040, 1677040, 1700598, 1717119, 1709968, 1735062, 
        1687013, 1695656, 1688617, 1699799, 1714772, 1688167, 1750106, 1766539, 
        1759744, 1776384, 1855738, 1860775, 1931543, 1901629, 1929410, 1983306];

    let data2 = [100, 101.63, 104.23, 107.44, 108.95, 110.95, 110.48, 112.1, 112.55, 
        113.13, 112.66, 113.41, 114.41, 112.63, 110.61, 111.65, 111.22, 
        112.27, 110.98, 111.28, 110.19, 108.49, 110.07, 113.15];

    let data3 = [, , 27040, , , -14674, , , -55000, , , , , , 92260, 
        , , , 99820, , 88900, , , ];


    let big = bigNumber(data1);
    let data1_cur = "";

    if (big==="3") {
        data1 = data1.map(value => value / 1000);
        data1_cur = "(in thousands)"
    } else if (big === "6") {
        data1 = data1.map(value => value / 1000000);
        data1_cur = "(in Mio.)"
    } else if (big === "9") {
        data1 = data1.map(value => value / 1000000000);
        data1_cur = "(in Bn.)"
    }

    scale_min = Math.min(Math.min(...data1)/data1[0], Math.min(...data2)/data2[0]);
    scale_max = Math.max(Math.max(...data1)/data1[0], Math.max(...data2)/data2[0]);
    
    const horizontalLinePlugin = {
        id: 'horizontalLine',
        beforeDraw: (chart, args, options) => {
            const { ctx, chartArea } = chart;
    
            if (!chart._active || !chart._active.length || !options.lines) return;
    
            // Iteriere über alle Linien, die gezeichnet werden sollen
            options.lines.forEach((line) => {
                const activePoint = chart._active.find(
                    (item) => item.datasetIndex === line.targetDatasetIndex
                )?.element;
    
                if (!activePoint) return;
    
                const y = activePoint.y;
    
                let startX = chartArea.left;
                let endX = chartArea.right;
    
                if (line.lineDirection === 'right') {
                    startX = activePoint.x; // Linie startet am Punkt und geht nach rechts
                } else if (line.lineDirection === 'left') {
                    endX = activePoint.x; // Linie startet links und endet am Punkt
                } else if (line.lineDirection === 'middle') {
                    startX = activePoint.x - 50; // Beispiel: 50px links vom Punkt
                    endX = activePoint.x + 50; // Beispiel: 50px rechts vom Punkt
                }
    
                // Zeichnen der Linie
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash(line.lineDash || []); // Strichmuster (falls angegeben)
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.lineWidth = line.lineWidth || 1;
                ctx.strokeStyle = line.color || 'rgba(0, 0, 0, 0.5)';
                ctx.stroke();
                ctx.restore();
            });
        },
    };
    Chart.register(horizontalLinePlugin);

    const verticalLinePlugin = {
        id: 'verticalLine',
        beforeDraw: (chart, args, options) => {
            const { ctx, chartArea } = chart;
    
            if (!chart._active || !chart._active.length) return;
    
            // Aktives Element abrufen
            const activePoint = chart._active[0].element;
    
            if (!activePoint) return;
    
            const x = activePoint.x; // X-Koordinate des aktiven Punktes
    
            // Zeichnen der vertikalen Linie
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, activePoint.y); // Startpunkt (oben)
            ctx.lineTo(x, chartArea.bottom); // Endpunkt (unten)
            ctx.lineWidth = options.lineWidth || 1; // Breite der Linie
            ctx.strokeStyle = options.color || 'rgba(0, 0, 0, 0.5)'; // Farbe der Linie
            ctx.stroke();
            ctx.restore();
        },
    };
    Chart.register(verticalLinePlugin);

    lineChartPrice = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['2023-01-31', '2023-02-28', '2023-03-31', '2023-04-30', '2023-05-31', '2023-06-30',  
                '2023-07-31', '2023-08-31', '2023-09-30', '2023-10-31', '2023-11-30', '2023-12-31',  
                '2024-01-31', '2024-02-29', '2024-03-31', '2024-04-30', '2024-05-31', '2024-06-30',  
                '2024-07-31', '2024-08-31', '2024-09-30', '2024-10-31', '2024-11-30', '2024-12-31'], // Datumswerte
            datasets: [
                // Zeitreihe 1: Monetäre Wertentwicklung
                {
                    label: 'Monetary Value ' + data1_cur,
                    data: data1, // Werte in Euro
                    borderColor: 'rgba(72, 201, 176, 1)', // Farbe der Linie
                    backgroundColor: 'rgba(72, 201, 176, 0.2)', // Fläche darunter
                    borderWidth: 1.4,
                    fill: true,
                    yAxisID: 'y', // Linke Skala
                    tension: 0, // Geschmeidige Kurve
                    pointRadius: 0,
                },
                // Zeitreihe 2: Indexierte Zeitreihe
                {
                    label: 'Indexed (100 Base)',
                    data: data2, // Indexierte Werte
                    borderColor: 'rgb(255, 196, 76)', // Primary Accent Color
                    borderWidth: 2,
                    backgroundColor: 'transparent',
                    fill: false, // Keine Fläche
                    yAxisID: 'y1', // Rechte Skala
                    tension: 0,
                    pointRadius: 0,
                },
                // Zeitreihe 3: Movements als Balken
                {
                    type: 'bar', // Balkendiagramm
                    label: 'Movements',
                    data: data3, // Beispielwerte
                    fill: false,
                    backgroundColor: data3.map(value => value >= 0 ? 'rgba(0, 200, 0, 1)' : 'rgba(200, 0, 0, 1)'),
                    borderWidth: 0, // Kein Rand
                    barThickness: 1, // Dünne Balken
                    yAxisID: 'y2',
                },]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index', // Interaktion für alle Datensätze
                intersect: false, // Keine direkten Schnitte erforderlich
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Date',
                    },
                    grid: {
                        drawOnChartArea: false,
                        drawTicks: false,
                        drawBorder: false,
                    },
                    ticks: {
                        color: 'rgba(148, 148, 148, 0.85)',
                        align: 'center', // Sorgt dafür, dass die Ticks genau auf die Gridlinien ausgerichtet sind
                        callback: function (value, index) {
                            return index % 3 === 0 ? this.getLabelForValue(value) : '';
                        },
                        autoSkip: false, // Deaktiviert automatisches Überspringen
                    },
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Monetary Value (in Mio.)',
                    },
                    grid: {
                        drawOnChartArea: true,
                        color: 'rgba(0, 0, 0, 0.65)',
                        lineWidth: 0.3,
                        drawTicks: false,
                        drawBorder: false,
                    },
                    ticks: {
                        color: 'rgba(148, 148, 148, 0.85)',
                    },
                    min: data1[0] * scale_min * 0.98,
                    max: data1[0] * scale_max * 1.09,
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Indexed Value (Base 100)',
                    },
                    grid: {
                        drawOnChartArea: false,
                        drawTicks: false,
                        drawBorder: false,
                    },
                    ticks: {
                        color: 'rgba(148, 148, 148, 0.85)',
                    },
                    min: data2[0] * scale_min * 0.98,
                    max: data2[0] * scale_max * 1.09,
                },
                y2: {
                    type: 'linear',
                    position: 'none',
                    min: -50000, // ±10% der Skala
                    max: 1000000,
                    grid: {

                        color: (ctx) => {
                            return ctx.tick.value === 0 ? 'rgba(0, 0, 0, 0.27)' : 'rgba(255, 255, 255, 0)'; // 0-Linie hervorheben
                        },
                        lineWidth: (ctx) => {
                            return ctx.tick.value === 0 ? 2 : 0.5; // 0-Linie dicker machen
                        },
                    },
                    ticks: {
                        display: false, // Keine Skalierungen
                    },
                    title: {
                        display: false, // Kein Achsentitel
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom', // Legende oben platzieren
                },
                verticalLine: {
                    color: 'rgba(0, 0, 0, 0.98)', // Farbe der Linie
                    lineWidth: 0.8, // Breite der Linie
                },
                horizontalLine: { 
                    lines: [ { 
                        targetDatasetIndex: 0, // Erste Linie für Dataset 0 
                        color: 'rgba(0, 154, 123, 0.91)', // Farbe der Linie 
                        lineWidth: 0.7, // Breite der Linie 
                        lineDirection: 'left', // Optionen: 'full', 'right', 'left', 'middle' 
                    }, { 
                        targetDatasetIndex: 1, // Zweite Linie für Dataset 1 
                        color: 'rgba(177, 139, 0, 0.95)', // Farbe der Linie 
                        lineWidth: 0.7, // Breite der Linie 
                        lineDirection: 'right', // Optionen: 'full', 'right', 'left', 'middle' 
                    },], 
                }, 
                tooltip: {
                    yAlign: "bottom",
                    caretPadding: 550, // Optional: Abstand zwischen Tooltip und Punkt
                    mode: 'index', // Synchronisierter Tooltip
                    intersect: false,
                    callbacks: {
                        // Tooltip-Werte anpassen
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                            }
                            return label;
                        },
                    },
                },
                
            },
        },
    });

    barChartReturns = new Chart(histogramCtx, {
        type: 'bar',
        data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
                label: 'Risk Distribution',
                data: [50, 30, 20],
                backgroundColor: ['#FFC44C', '#FFB84D', '#FF9F40'],
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
            },
        },
    });

    updateChartColors(lineChartPrice);
    updateChartColors(barChartReturns);
};

const updateChartColors = (chart) => {
    const primaryColor = getComputedStyle(root).getPropertyValue('--primary-title').trim();
    const primaryColorAcc = getComputedStyle(root).getPropertyValue("--primary-acc").trim();
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    if (chartArea && chart.config.type === "line") {
        // Erstelle einen Farbverlauf von oben nach unten
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, `${primaryColor}29`); // Farbe oben (volle Deckkraft)
        gradient.addColorStop(1, `${primaryColor}00`); // Transparent unten (0% Deckkraft)

        // Wende den Farbverlauf als Hintergrundfarbe an
        chart.data.datasets[0].backgroundColor = gradient;
    }

    if (chart.data.datasets[0]) {
        chart.data.datasets[0].borderColor = primaryColor
    }

    if (chart.data.datasets[1]) {
        chart.data.datasets[1].borderColor = primaryColorAcc;
    }
    //chart.data.datasets[0].backgroundColor = bgColor;
    chart.update();
};

function bigNumber(data) {
    const average = data.reduce((sum, value) => sum + value, 0) / data.length;
    count = Math.floor(Math.abs(average)).toString().length;

    if (count < 4) {
        return "0";
    } else if (count < 7) {
        return "3";
    } else if (count < 10) {
        return "6";
    } else {
        return "9";
    }
}

// Scroll-Event Listener für die Navigationsleiste
window.addEventListener('scroll', () => {
	const theme = localStorage.getItem('theme');
    
    //erst am ende des scrollens ausführen:
    clearTimeout(scrollTimeout); // Lösche vorherigen Timeout
    scrollTimeout = setTimeout(() => {
        //console.log("should end onload now ..");
        localStorage.removeItem("onload");
    }, 200); 
    const nav_header = document.getElementById("nav-header");
    
    if (localStorage.getItem("onload") == null) {
        //console.log("scroll event should work now");
        if (window.scrollY > 10) {
            nav_header.classList.remove("hidden");
        } else {
            nav_header.classList.add("hidden");
        }
        
        if (theme === "dark mode" ) {
            const nav = document.querySelector('nav');
            if (window.scrollY > 10) {
                //nav.classList.add('scrolled'); // Hintergrund und Blur hinzufügen
                nav.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                nav.style.backgroundColor = 'rgba(30, 40, 50, 0.9)';
                nav.style.backdropFilter = "blur(3px)";
                
            } else {
                //nav.classList.remove('scrolled'); // Zurück zum Standardzustand
                nav.style.boxShadow = "none";
                nav.style.backgroundColor = 'transparent';
                nav.style.backdropFilter = "none";
            }		
        }

    }
    navLinks.classList.remove('open'); // Schließt das Menü
});

function disableScroll() {
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll'); // Für den gesamten Dokumentbereich
}

// Funktion, um Scrollen zu aktivieren
function enableScroll() {
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll'); // Für den gesamten Dokumentbereich
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    const aside = document.querySelector('.dataset-summary');
    const showAsideButton = document.getElementById('show-aside');
    const closeAsideButton = document.getElementById('close-aside');
    const slideView = document.getElementById("slideView");
    const actionButton = document.querySelector('.action-button');
    const actionLink = document.getElementById("action-link");
    const handleContainer = document.getElementById('handle-container');
    let initialBottom = 0;
    let isSwiping = false;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let startY = 0;
    let currentY = 0;


    localStorage.setItem("onload", true);

    // Aside: Öffnen
    showAsideButton.addEventListener('click', function(event) {
        event.preventDefault();
        navLinks.classList.remove('open');
        aside.classList.add('active');
        document.body.style.overflow = "hidden";
    });

    // Aside: Schließen
    closeAsideButton.addEventListener('click', () => {
        aside.classList.remove('active');
        document.body.style.overflow = "";
    });

    // Aside: Touchstart-Event
    aside.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
        currentX = 0;
        aside.style.transition = "none"; // Transition während des Swipens deaktivieren
    });

    // Aside: Touchmove-Event
    aside.addEventListener("touchmove", (e) => {
        if (!isSwiping) return;

        if (window.innerWidth < 768) {
            currentX = e.touches[0].clientX - startX;
        }
        if (currentX < 0) currentX = 0; // Verhindert Bewegung nach links
        aside.style.transform = `translateX(${currentX}px)`;
    });

    // Aside: Touchend-Event
    aside.addEventListener("touchend", () => {
        isSwiping = false;

        // Wenn genug geswiped wurde, schließe das Aside
        if (currentX > 100) {
            aside.style.transform = ""; // Rücksetzen von transform
            aside.classList.remove("active");
            //document.body.style.overflow = "";
        } else {
            // Zurück zur Ausgangsposition
            aside.style.transition = "transform 0.3s ease-in-out"; // Transition wieder aktivieren
            aside.style.transform = "translateX(0)";
            //document.body.style.overflow = "hidden";
        }
    });


    // SlideView: Funktion zum Öffnen des Slide-Views
    function openSlideView() {
        slideView.style.bottom = "0"; // Schiebt das Slide-View in den sichtbaren Bereich
        if (window.innerWidth < 768) {
            actionButton.style.display = "none";
        } else {
            actionButton.style.top = "50px";
            actionLink.className="fas fa-chevron-down"
        }
    }

    // SlideView: Funktion zum Schließen des Slide-Views
    function closeSlideView() {
        enableScroll();
        actionButton.style.display = "flex";
        actionButton.style.top = "unset";
        slideView.style.bottom = "-100%"; // Schiebt das Slide-View aus dem Bildschirm
        actionLink.classList = "fas fa-plus";
    }

    // SlideView: Event für Swipen nach unten
    handleContainer.addEventListener("touchstart", (e) => {
        startY = e.touches[0].clientY;
        isSwiping = true;
        const computedStyle = window.getComputedStyle(slideView);
        initialBottom = parseInt(computedStyle.bottom, 10); // Aktuelle Position speichern
        slideView.style.transition = "none"; // Deaktiviere die Transition während der Bewegung
    });
    
    handleContainer.addEventListener("touchmove", (e) => {
        if (!isSwiping) return;
    
        currentY = e.touches[0].clientY - startY;
    
        // Berechne die neue Position
        const newBottom = Math.max(-window.innerHeight, initialBottom - currentY);
        slideView.style.bottom = `${newBottom}px`;
    });
    
    handleContainer.addEventListener("touchend", () => {
        isSwiping = false;
        slideView.style.transition = "bottom 0.3s ease-in-out"; // Transition wieder aktivieren
    
        // Entscheide basierend auf der Endposition
        if (currentY > 100) {
            closeSlideView();
        } else {
            slideView.style.bottom = "0"; // Zurück zur Originalposition
        }
    });

    // SlideView: Beispiel für das Öffnen des Slide-Views
    actionButton.addEventListener('click', () => {
        //Checke, ob die slideview gerade ausgeklappt ist
        if (slideView.style.bottom === "0px") {
            closeSlideView();
            enableScroll();
        } else {
            disableScroll();
            openSlideView();
        }
    });

    //SlideView Drag mit der Maus:
    handleContainer.addEventListener('mousedown', (e) => {
        startY = e.clientY; // Initiale Y-Position
        isDragging = true;
        document.body.style.userSelect = "none"; // Deaktiviert Textauswahl
        slideView.style.transition = "none"; // Transition während des Ziehens deaktivieren
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentY = e.clientY - startY; // Differenz berechnen

        if (currentY > 0) { // Erlaubt nur Bewegung nach unten
            slideView.style.bottom = `-${currentY}px`;
        }
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = ""; // Textauswahl wieder aktivieren
        slideView.style.transition = "bottom 0.3s ease-in-out"; // Transition wieder aktivieren

        // Schließen, wenn genug nach unten gezogen wurde
        if (currentY > window.innerHeight * 0.3) {
            slideView.style.bottom = "-100%"; // Komplett ausblenden
            closeSlideView();
        } else {
            slideView.style.bottom = "0"; // Zurück zur Originalposition
        }
    });

    // Überwache Fenstergröße und entferne "active", wenn Desktop-Modus aktiv wird
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) { // Passe die Breite an deine Media Query an
            aside.classList.remove('active');
            document.body.style.overflow = "";
            if(localStorage.getItem("theme")==="light mode") {
                aside.style.background =  'linear-gradient(90deg, var(--glass), var(--glass), var(--glass), var(--glass2))';
            } else {
                aside.style.background = "transparent";
            }
        } else {
            if(localStorage.getItem("theme")==="light mode") {
                aside.style.background =  'linear-gradient(90deg, var(--dis-bg), var(--dis-bg), var(--dis-bg), var(--dis-bg))';
            } else {
                aside.style.background = getComputedStyle(root).getPropertyValue('--primary-bg').trim();
            }
        }
    });

    // Schließen bei Klick außerhalb des Aside
    document.addEventListener('click', (event) => {
        if (!aside.contains(event.target) && !showAsideButton.contains(event.target) && !slideView.contains(event.target)) {
            aside.classList.remove('active');
            document.body.style.overflow = "";
        }
    });
    
    // Load saved theme from local storage
    if (savedTheme) {
        root.setAttribute('data-theme', savedTheme);
        applyTheme(savedTheme);
    } else {
        root.setAttribute('data-theme', 'dark mode'); // Default theme
        localStorage.setItem("theme", "dark mode");
        console.log("no current theme - set to dark mode");
        applyTheme('dark mode');
    }

    //localStorage.setItem("theme", "dark mode");
    // Initialize charts after DOM content is loaded
    initCharts();
    
    //beim Neuladen der Seite: nav-header grundsätzlich verbergen(in css), dann scroll-event auslösen
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, 10);
});