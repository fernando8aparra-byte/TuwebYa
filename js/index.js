// script.js
// Configuración de Firebase (reemplaza con tus credenciales reales)
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_DOMINIO.firebaseapp.com",
    databaseURL: "https://TU_DOMINIO.firebaseio.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_BUCKET.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// Lógica del Menú Hamburguesa
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');

hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('hidden');
});

// Lógica de Barra de Búsquedas
// Asumimos que busca en previews almacenados en Firebase bajo /previews
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase();
    searchResults.innerHTML = '';
    searchResults.classList.remove('hidden');

    db.ref('previews').once('value').then(snapshot => {
        const previews = snapshot.val();
        if (previews) {
            Object.values(previews).forEach(preview => {
                if (preview.title.toLowerCase().includes(query)) {
                    const resultDiv = document.createElement('div');
                    resultDiv.innerHTML = `<p>${preview.title}</p><img src="${preview.image}" alt="${preview.title}" style="max-width:100px;">`;
                    resultDiv.addEventListener('click', () => {
                        // Redirigir a preview detalle (lógica futura)
                        window.location.href = `#preview-${preview.id}`;
                    });
                    searchResults.appendChild(resultDiv);
                }
            });
        }
    }).catch(error => console.error('Error en búsqueda:', error));
});

// Lógica de Iniciar Sesión
const loginBtn = document.getElementById('login-btn');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitLogin = document.getElementById('submit-login');
const logoutBtn = document.getElementById('logout-btn');

loginBtn.addEventListener('click', () => {
    loginForm.classList.toggle('hidden');
});

submitLogin.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('Usuario logueado:', userCredential.user);
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            // Cargar datos admin si es admin (lógica futura)
        })
        .catch(error => console.error('Error en login:', error));
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('Sesión cerrada');
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }).catch(error => console.error('Error en logout:', error));
});

// Cargar Título Principal desde Firebase
db.ref('config/titulo_principal').once('value').then(snapshot => {
    const titulo = snapshot.val() || 'Sitio para Vender Páginas Web';
    document.getElementById('titulo-principal').textContent = titulo;
});

// Cargar Títulos de Secciones
['1', '2', '3'].forEach(num => {
    db.ref(`config/seccion${num}/titulo`).once('value').then(snapshot => {
        const titulo = snapshot.val() || `Sección ${num}`;
        document.getElementById(`titulo-seccion${num}`).textContent = titulo;
    });

    // Cargar Contenido Dinámico (textos, previews, etc.)
    db.ref(`config/seccion${num}/contenido`).once('value').then(snapshot => {
        const contenido = snapshot.val();
        if (contenido) {
            const contDiv = document.getElementById(`contenido-seccion${num}`);
            // Renderizar textos, imágenes, etc. (asumimos array de objetos {type: 'text'|'image', value: '', style: {font: '', position: ''}})
            contenido.forEach(item => {
                if (item.type === 'text') {
                    const p = document.createElement('p');
                    p.textContent = item.value;
                    p.style.fontFamily = item.style?.font || 'Arial';
                    p.style.position = item.style?.position || 'relative'; // Para movimiento libre (admin setea CSS)
                    contDiv.appendChild(p);
                } else if (item.type === 'image') {
                    const img = document.createElement('img');
                    img.src = item.value;
                    img.style.position = item.style?.position || 'relative';
                    contDiv.appendChild(img);
                }
                // Previews: si es preview, renderizar como cards
            });
        }
    });
});

// Cargar Atajos (máximo 6)
db.ref('config/atajos').once('value').then(snapshot => {
    const atajos = snapshot.val() || [];
    const ul = navMenu.querySelector('ul');
    atajos.slice(0, 6).forEach(atajo => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = atajo.url;
        a.textContent = atajo.nombre;
        li.appendChild(a);
        ul.appendChild(li);
    });
});

// Cargar Redes Sociales
const redes = ['instagram', 'facebook', 'youtube', 'x'];
const redesContainer = document.getElementById('redes-sociales');

redes.forEach(red => {
    db.ref(`config/redes/${red}`).once('value').then(snapshot => {
        const config = snapshot.val();
        if (config && config.on) {
            const a = document.createElement('a');
            a.href = config.link || `https://www.${red}.com/${config.usuario}`;
            a.textContent = red.charAt(0).toUpperCase() + red.slice(1);
            redesContainer.appendChild(a);
        }
    });
});

// Banner de Mantenimiento
db.ref('config/mantenimiento').once('value').then(snapshot => {
    const on = snapshot.val();
    if (on) {
        document.getElementById('mantenimiento-banner').classList.remove('hidden');
    }
});

// Banner Imagen
db.ref('config/banner/imagen').once('value').then(snapshot => {
    const imgUrl = snapshot.val();
    if (imgUrl) {
        document.getElementById('banner-img').src = imgUrl;
    }
});

// Nota: Para el admin, crearás un admin.html separado que use auth para verificar admin, y luego use db.ref().set() para actualizar estos paths en Firebase.
// Por ahora, el index está preparado para leer de estos paths.
// Previews: Almacena en /previews/{id: {title, image, description}} para búsqueda y render en secciones.
