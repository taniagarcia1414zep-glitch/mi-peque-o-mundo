const CACHE_NAME = "mi-pequeno-mundo-v1";

const ARCHIVOS_APP = [
    "./",
    "./index.html",
    "./login.html",
    "./album.html",
    "./embarazo.html",
    "./estilos.css",
    "./script.js",
    "./manifest.json",
    "./icono-app.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ARCHIVOS_APP);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((nombres) => {
            return Promise.all(
                nombres
                    .filter((nombre) => nombre !== CACHE_NAME)
                    .map((nombre) => caches.delete(nombre))
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // No guardar en caché nada de Supabase.
    if (url.hostname.includes("supabase.co")) {
        return;
    }

    // Solo manejar archivos de nuestro propio sitio.
    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((respuesta) => {
                return respuesta;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});