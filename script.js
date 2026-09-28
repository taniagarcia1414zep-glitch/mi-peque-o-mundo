// ===============================
// CONEXIÓN CON SUPABASE
// ===============================

const SUPABASE_URL = "https://qhoeggiioqopusdqckeb.supabase.co";

const SUPABASE_KEY = "sb_publishable_TN1UE90hBplxxGQGabnbxQ_KefQCNkm";

const clienteSupabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
// ==========================================
// ABRIR LOS ÁLBUMES
// ==========================================

function abrirAlbum(etapa) {

    if (etapa === "embarazo") {
        window.location.href = "embarazo.html";
        return;
    }

    window.location.href =
        "album.html?etapa=" + encodeURIComponent(etapa);
}

// ==========================================
// SELECCIONAR FOTOGRAFÍA
// ==========================================

function seleccionarFotoEmbarazo() {

    const fecha = document.getElementById("fechaFoto");
    const descripcion = document.getElementById("descripcionFoto");

    // Comprobamos que haya una fecha
    if (!fecha.value) {
        alert("💕 Primero selecciona la fecha del recuerdo.");
        return;
    }

    // Comprobamos que haya un recuerdo
    if (!descripcion.value.trim()) {
        alert("💕 Escribe un pequeño recuerdo para esta fotografía.");
        return;
    }

    document.getElementById("inputFotoEmbarazo").click();
}


// ==========================================
// AGREGAR FOTOGRAFÍA AL ÁLBUM
// ==========================================
async function guardarFotoEnSupabase(archivo, fecha, descripcion) {

    // Comprobamos que el usuario tenga una sesión iniciada
    const {
        data: { user }
    } = await clienteSupabase.auth.getUser();

    if (!user) {
        alert("Debes iniciar sesión para guardar fotografías.");
        window.location.href = "login.html";
        return null;
    }

    // Creamos un nombre único para la fotografía
    const extension = archivo.name.split(".").pop();

    const nombreArchivo =
        `embarazo/${Date.now()}-${user.id}.${extension}`;

    // Subimos la fotografía al almacenamiento
    const { error: errorFoto } =
        await clienteSupabase.storage
            .from("fotos-album")
            .upload(nombreArchivo, archivo);

    if (errorFoto) {
        console.error(errorFoto);
        alert("No se pudo guardar la fotografía.");
        return null;
    }

    // Guardamos la información en la tabla recuerdos
    const { error: errorRecuerdo } =
        await clienteSupabase
            .from("recuerdos")
            .insert({
                etapa: "embarazo",
                fecha: fecha,
                descripcion: descripcion,
                foto_path: nombreArchivo
            });

    if (errorRecuerdo) {
        console.error(errorRecuerdo);
        alert("La foto se subió, pero no se pudo guardar el recuerdo.");
        return null;
    }

    return nombreArchivo;
}
const inputFotoEmbarazo =
    document.getElementById("inputFotoEmbarazo");


if (inputFotoEmbarazo) {

    inputFotoEmbarazo.addEventListener("change", async function (evento) {

        const archivo = evento.target.files[0];

        if (!archivo) {
            return;
        }

        const fecha =
            document.getElementById("fechaFoto").value;

        const descripcion =
            document.getElementById("descripcionFoto").value.trim();
// Guardamos la fotografía y el recuerdo en Supabase
const fotoGuardada = await guardarFotoEnSupabase(
    archivo,
    fecha,
    descripcion
);

if (!fotoGuardada) {
    return;
}

        const lector = new FileReader();


        lector.onload = function (evento) {

            const galeria =
                document.getElementById("galeriaEmbarazo");

            const mensaje =
                document.getElementById("mensajeGaleria");


            if (mensaje) {
                mensaje.remove();
            }


            // Creamos la tarjeta completa del recuerdo

            const tarjeta =
                document.createElement("article");

            tarjeta.classList.add("recuerdo");


            // Fotografía

            const imagen =
                document.createElement("img");

            imagen.src = evento.target.result;
            imagen.alt = "Fotografía del recuerdo";


            // Información debajo de la fotografía

            const informacion =
                document.createElement("div");

            informacion.classList.add("informacion-recuerdo");


            // Fecha

            const fechaTexto =
                document.createElement("p");

            fechaTexto.classList.add("fecha-recuerdo");


            const partesFecha = fecha.split("-");

            const fechaFormateada =
                `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;

            fechaTexto.textContent =
                "📅 " + fechaFormateada;


            // Descripción

            const descripcionTexto =
                document.createElement("p");

            descripcionTexto.classList.add("texto-recuerdo");

            descripcionTexto.textContent =
                "💕 " + descripcion;


            // Unimos todo

            informacion.appendChild(fechaTexto);
            informacion.appendChild(descripcionTexto);

            tarjeta.appendChild(imagen);
            tarjeta.appendChild(informacion);

            galeria.appendChild(tarjeta);


            // Limpiamos los campos

            document.getElementById("fechaFoto").value = "";
            document.getElementById("descripcionFoto").value = "";

            inputFotoEmbarazo.value = "";

        };


        lector.readAsDataURL(archivo);

    });

}

// ==========================================
// INICIO DE SESIÓN
// ==========================================

const formLogin = document.getElementById("formLogin");

if (formLogin) {

    formLogin.addEventListener("submit", async function (evento) {

        evento.preventDefault();

        const correo =
            document.getElementById("correo").value.trim();

        const contrasena =
            document.getElementById("contrasena").value;

        const mensaje =
            document.getElementById("mensajeLogin");

        mensaje.textContent = "Iniciando sesión... 💕";

        const { data, error } =
            await clienteSupabase.auth.signInWithPassword({
                email: correo,
                password: contrasena
            });

        if (error) {
            console.error(error);

            mensaje.textContent =
                "Correo o contraseña incorrectos 💗";

            return;
        }

        mensaje.textContent = "¡Bienvenida! 🌸";

        window.location.href = "index.html";
    });

}

// ==========================================
// PROTEGER LAS PÁGINAS DEL ÁLBUM
// ==========================================

async function protegerPagina() {

    const paginaActual =
        window.location.pathname.split("/").pop();

    // El login debe poder abrirse sin tener sesión
    if (paginaActual === "login.html") {
        return;
    }

    const {
        data: { session }
    } = await clienteSupabase.auth.getSession();

    // Si no existe una sesión, regresar al login
    if (!session) {
        window.location.href = "login.html";
    }
}

if (!window.location.pathname.endsWith("login.html")) {
    protegerPagina();
}
// ==========================================
// CERRAR SESIÓN
// ==========================================

async function cerrarSesion() {

    const { error } = await clienteSupabase.auth.signOut();

    if (error) {
        alert("No se pudo cerrar la sesión.");
        console.error(error);
        return;
    }

    window.location.href = "login.html";
}
// ==========================================
// CARGAR RECUERDOS GUARDADOS
// ==========================================

async function cargarRecuerdosEmbarazo() {

    const galeria =
        document.getElementById("galeriaEmbarazo");

    // Si no estamos en embarazo.html, no hacemos nada
    if (!galeria) {
        return;
    }

    // Buscamos los recuerdos guardados
    const { data: recuerdos, error } =
        await clienteSupabase
            .from("recuerdos")
            .select("*")
            .eq("etapa", "embarazo")
            .order("fecha", { ascending: true });

    if (error) {
        console.error("Error al cargar recuerdos:", error);
        return;
    }

    console.log("Recuerdos encontrados:", recuerdos);
    // Quitamos el mensaje de galería vacía
const mensaje =
    document.getElementById("mensajeGaleria");

if (mensaje) {
    mensaje.remove();
}

// Mostramos cada recuerdo guardado
for (const recuerdo of recuerdos) {

    // Creamos una URL temporal para la fotografía privada
    const { data: urlFoto, error: errorUrl } =
        await clienteSupabase.storage
            .from("fotos-album")
            .createSignedUrl(recuerdo.foto_path, 3600);

    if (errorUrl) {
        console.error("Error al cargar fotografía:", errorUrl);
        continue;
    }

    // Tarjeta del recuerdo
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta-foto");

    // Fotografía
    const imagen = document.createElement("img");
    imagen.src = urlFoto.signedUrl;
    imagen.alt = "Recuerdo de esta etapa";

    // Información
    const informacion = document.createElement("div");
    informacion.classList.add("informacion-recuerdo");

    // Fecha
    const fechaTexto = document.createElement("p");
    fechaTexto.classList.add("fecha-recuerdo");

    const partesFecha = recuerdo.fecha.split("-");

    const fechaFormateada =
        `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;

    fechaTexto.textContent =
        "🗓️ " + fechaFormateada;

    // Descripción
    const descripcionTexto = document.createElement("p");
    descripcionTexto.classList.add("texto-recuerdo");
    descripcionTexto.textContent =
        "💕 " + recuerdo.descripcion;

    informacion.appendChild(fechaTexto);
    informacion.appendChild(descripcionTexto);
    // Botón para editar el recuerdo
const botonEditar = document.createElement("button");

botonEditar.textContent = "✏️ Editar";
botonEditar.classList.add("boton-editar");

botonEditar.onclick = function () {
    editarRecuerdo(recuerdo);
};

informacion.appendChild(botonEditar);
// Botón para eliminar el recuerdo
const botonEliminar = document.createElement("button");

botonEliminar.textContent = "🗑️ Eliminar";
botonEliminar.classList.add("boton-eliminar");

botonEliminar.onclick = function () {
    eliminarRecuerdo(
        recuerdo.id,
        recuerdo.foto_path
    );
};

informacion.appendChild(botonEliminar);
    tarjeta.appendChild(imagen);
    tarjeta.appendChild(informacion);

    galeria.appendChild(tarjeta);
}
}
cargarRecuerdosEmbarazo();


async function eliminarRecuerdo(id, fotoPath) {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar este recuerdo? 💗"
    );

    if (!confirmar) {
        return;
    }

    // Eliminar la fotografía de Storage
    const { error: errorFoto } =
        await clienteSupabase.storage
            .from("fotos-album")
            .remove([fotoPath]);

    if (errorFoto) {
        console.error(
            "Error al eliminar la fotografía:",
            errorFoto
        );

        alert("No se pudo eliminar la fotografía.");
        return;
    }

    // Eliminar el recuerdo de la base de datos
    const { error: errorRecuerdo } =
        await clienteSupabase
            .from("recuerdos")
            .delete()
            .eq("id", id);

    if (errorRecuerdo) {
        console.error(
            "Error al eliminar el recuerdo:",
            errorRecuerdo
        );

        alert("No se pudo eliminar el recuerdo.");
        return;
    }

    alert("Recuerdo eliminado correctamente 💗");

    window.location.reload();
}
async function editarRecuerdo(recuerdo) {

    const nuevaFecha = prompt(
        "Escribe la nueva fecha (AAAA-MM-DD):",
        recuerdo.fecha
    );

    if (nuevaFecha === null) {
        return;
    }

    const nuevaDescripcion = prompt(
        "Escribe el nuevo recuerdo:",
        recuerdo.descripcion
    );

    if (nuevaDescripcion === null) {
        return;
    }

    const { error } = await clienteSupabase
        .from("recuerdos")
        .update({
            fecha: nuevaFecha,
            descripcion: nuevaDescripcion
        })
        .eq("id", recuerdo.id);

    if (error) {
        console.error("Error al editar el recuerdo:", error);
        alert("No se pudo editar el recuerdo.");
        return;
    }

    alert("Recuerdo actualizado correctamente 💗");

    window.location.reload();
}async function editarRecuerdo(recuerdo) {

    const nuevaFecha = prompt(
        "Escribe la nueva fecha (AAAA-MM-DD):",
        recuerdo.fecha
    );

    if (nuevaFecha === null) {
        return;
    }

    const nuevaDescripcion = prompt(
        "Escribe el nuevo recuerdo:",
        recuerdo.descripcion
    );

    if (nuevaDescripcion === null) {
        return;
    }

    const { error } = await clienteSupabase
        .from("recuerdos")
        .update({
            fecha: nuevaFecha,
            descripcion: nuevaDescripcion
        })
        .eq("id", recuerdo.id);

    if (error) {
        console.error("Error al editar el recuerdo:", error);
        alert("No se pudo editar el recuerdo.");
        return;
    }

    alert("Recuerdo actualizado correctamente 💗");

    window.location.reload();
}


// ===============================
// ÁLBUM GENERAL POR ETAPAS
// ===============================

// Obtener la etapa desde la dirección de la página
function obtenerEtapaAlbum() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    return parametros.get("etapa");
}


// Seleccionar fotografía del álbum
function seleccionarFotoAlbum() {

    const inputFoto =
        document.getElementById("inputFotoAlbum");

    if (inputFoto) {
        inputFoto.click();
    }
}

// Subir fotografía del álbum general
async function subirFotoAlbum(archivo) {

    const etapa = obtenerEtapaAlbum();

    const fecha =
        document.getElementById("fechaFoto").value;

    const descripcion =
        document.getElementById("descripcionFoto").value.trim();

    if (!etapa) {
        alert("No se pudo identificar la etapa del álbum.");
        return;
    }

    if (!fecha) {
        alert("Selecciona una fecha 📅");
        return;
    }

    if (!descripcion) {
        alert("Escribe un recuerdo 💕");
        return;
    }

    if (!archivo) {
        alert("Selecciona una fotografía 📸");
        return;
    }

    // Crear un nombre único para la fotografía
    const nombreArchivo =
        etapa + "/" + Date.now() + "-" + archivo.name;

    // Subir fotografía a Storage
    const { error: errorFoto } =
        await clienteSupabase.storage
            .from("fotos-album")
            .upload(nombreArchivo, archivo);

    if (errorFoto) {
        console.error("Error al subir fotografía:", errorFoto);
        alert("No se pudo subir la fotografía.");
        return;
    }

    // Guardar el recuerdo en la base de datos
    const { error: errorRecuerdo } =
        await clienteSupabase
            .from("recuerdos")
            .insert({
                etapa: etapa,
                fecha: fecha,
                descripcion: descripcion,
                foto_path: nombreArchivo
            });

    if (errorRecuerdo) {
        console.error("Error al guardar recuerdo:", errorRecuerdo);
        alert("La fotografía subió, pero no se pudo guardar el recuerdo.");
        return;
    }

    alert("Recuerdo guardado correctamente 💗");

    window.location.reload();
}

// Detectar cuando se selecciona una fotografía
const inputFotoAlbum =
    document.getElementById("inputFotoAlbum");

if (inputFotoAlbum) {

    inputFotoAlbum.addEventListener(
        "change",
        function () {

            

            const archivo = this.files[0];

            if (archivo) {
                subirFotoAlbum(archivo);
            }
        }
    );
}

// ===============================
// MOSTRAR RECUERDOS DEL ÁLBUM
// ===============================

async function cargarRecuerdosAlbum() {


    const galeria =
        document.getElementById("galeriaAlbum");

    // Si no estamos en album.html, no hacemos nada
    if (!galeria) {
        return;
    }

    const etapa = obtenerEtapaAlbum();

    if (!etapa) {
        return;
    }

    const { data: recuerdos, error } =
        await clienteSupabase
            .from("recuerdos")
            .select("*")
            .eq("etapa", etapa)
            .order("fecha", { ascending: true });


    if (error) {
        console.error(
            "Error al cargar los recuerdos:",
            error
        );
        return;
    }

    galeria.innerHTML = "";

    for (const recuerdo of recuerdos) {

        const tarjeta =
            document.createElement("div");

        tarjeta.classList.add("tarjeta-foto");


        // Obtener la fotografía desde Supabase
        const { data: foto, error: errorUrl } =
    await clienteSupabase.storage
        .from("fotos-album")
        .createSignedUrl(
            recuerdo.foto_path,
            3600
        );

if (errorUrl) {
    console.error(
        "Error al obtener la fotografía:",
        errorUrl
    );
    continue;
}
        const imagen =
            document.createElement("img");

       imagen.src = foto.signedUrl;
        imagen.alt = recuerdo.descripcion;


        const informacion =
            document.createElement("div");

        informacion.classList.add(
            "informacion-foto"
        );


        const fecha =
            document.createElement("p");

        const partesFecha =
            recuerdo.fecha.split("-");

        fecha.textContent =
            "📅 " +
            partesFecha[2] + "/" +
            partesFecha[1] + "/" +
            partesFecha[0];


        const descripcion =
            document.createElement("p");

        descripcion.textContent =
            recuerdo.descripcion;


        informacion.appendChild(fecha);
        informacion.appendChild(descripcion);
// Botón para editar
const botonEditar = document.createElement("button");

botonEditar.textContent = "✏️ Editar";
botonEditar.classList.add("boton-editar");

botonEditar.onclick = function () {
    editarRecuerdo(recuerdo);
};

informacion.appendChild(botonEditar);


// Botón para eliminar
const botonEliminar = document.createElement("button");

botonEliminar.textContent = "🗑️ Eliminar";
botonEliminar.classList.add("boton-eliminar");

botonEliminar.onclick = function () {
    eliminarRecuerdo(
        recuerdo.id,
        recuerdo.foto_path
    );
};

informacion.appendChild(botonEliminar);
        tarjeta.appendChild(imagen);
        tarjeta.appendChild(informacion);

        galeria.appendChild(tarjeta);
    }
}


// Cargar automáticamente los recuerdos
cargarRecuerdosAlbum();
// ===============================
// CAMBIAR INFORMACIÓN SEGÚN ETAPA
// ===============================

function configurarAlbum() {

    const etapa = obtenerEtapaAlbum();

    const titulo =
        document.getElementById("tituloEtapa");

    const icono =
        document.getElementById("iconoEtapa");

    const frase =
        document.getElementById("fraseEtapa");

    if (!titulo || !icono || !frase) {
        return;
    }

    if (etapa === "nacimiento") {

        icono.textContent = "🍼";
        titulo.textContent = "Mi nacimiento";

        frase.textContent =
            "El día en que por fin pudimos conocerte y tenerte entre nuestros brazos.";

    } else if (etapa === "1-mes") {

        icono.textContent = "🌙";
        titulo.textContent = "Mi primer mes";

        frase.textContent =
            "Un mes llenando nuestros días de amor, ternura y momentos inolvidables.";

    }
    else if (etapa === "2-meses") {

    icono.textContent = "🌸";
    titulo.textContent = "Mis 2 meses";

    frase.textContent =
        "Dos meses creciendo, descubriendo el mundo y llenándonos de amor.";

} else if (etapa === "3-meses") {

    icono.textContent = "🧸";
    titulo.textContent = "Mis 3 meses";

    frase.textContent =
        "Tres meses de sonrisas, ternura y recuerdos que queremos guardar para siempre.";

} else if (etapa === "4-meses") {

    icono.textContent = "🌷";
    titulo.textContent = "Mis 4 meses";

    frase.textContent =
        "Cuatro meses viendo cómo creces y descubres cada día algo nuevo.";

} else if (etapa === "5-meses") {

    icono.textContent = "💕";
    titulo.textContent = "Mis 5 meses";

    frase.textContent =
        "Cinco meses de aventuras, sonrisas y momentos inolvidables.";

} else if (etapa === "6-meses") {

    icono.textContent = "🎀";
    titulo.textContent = "Mis 6 meses";

    frase.textContent =
        "Medio año de amor, crecimiento y recuerdos maravillosos a tu lado.";

}
}

configurarAlbum();