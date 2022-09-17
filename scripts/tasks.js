// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
const jwt = localStorage.getItem("jwt");

if (!jwt) {
  // usamos el replace para no guardar en el historial la url anterior
  location.replace("/");
}

/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener("load", function () {
  /* ---------------- variables globales y llamado a funciones ---------------- */
  obtenerNombreUsuario();
  consultarTareas();

  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */
  const btnCerrarSesion = document.getElementById("closeApp");

  btnCerrarSesion.addEventListener("click", function () {
    localStorage.removeItem("jwt");
    location.replace("/");
  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  function obtenerNombreUsuario() {
    const apiURL = "https://ctd-todo-api.herokuapp.com/v1/users/getMe";

    const configuraciones = {
      headers: {
        method: "GET",
        "Content-Type": "application/json",
        authorization: jwt,
      },
    };

    fetch(apiURL, configuraciones)
      .then((respuesta) => respuesta.json())
      .then((respuesta) => {
        const userName = document.getElementById("user-name");
        const { firstName, lastName } = respuesta;
        userName.innerText = `${firstName} ${lastName}`;
      });
  }

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
    const apiURL = "https://ctd-todo-api.herokuapp.com/v1/tasks";

    const configuraciones = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: jwt,
      },
    };

    fetch(apiURL, configuraciones)
      .then((respuesta) => respuesta.json())
      .then((respuesta) => {
        renderizarTareas(respuesta);
      });
  }

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  const formCrearTarea = document.forms[0];
  formCrearTarea.addEventListener("submit", function (event) {
    event.preventDefault();

    const nuevaTarea = document.getElementById("nuevaTarea");

    const tarea = {
      description: nuevaTarea.value,
    };

    const apiURL = "https://ctd-todo-api.herokuapp.com/v1/tasks";

    const configuraciones = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: jwt,
      },
      body: JSON.stringify(tarea),
    };

    fetch(apiURL, configuraciones).then(() => {
      consultarTareas();
      nuevaTarea.value = "";
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(tareas) {
    const tareasPendientes = document.querySelector(".tareas-pendientes");
    tareasPendientes.innerHTML = "";
    const tareasTerminadas = document.querySelector(".tareas-terminadas");
    tareasTerminadas.innerHTML = "";

    const cantPendientes = document.getElementById("cantidad-pendientes");
    const cantFinalizadas = document.getElementById("cantidad-finalizadas");

    let contadorPendientes = 0;
    let contadorFinalizadas = 0;

    tareas.forEach((tarea) => {
      const itemTareas = document.createElement("li");
      itemTareas.classList.add("tarea");

      const itemDescripcion = document.createElement("div");
      itemDescripcion.classList.add("descripcion");

      const itemNombre = document.createElement("div");
      itemNombre.classList.add("nombre");
      itemNombre.innerText = tarea.description;

      const itemTimestamp = document.createElement("div");
      itemTimestamp.classList.add("timestamp");
      itemTimestamp.innerText = new Date(tarea.createdAt).toLocaleDateString(
        "es-ar",
        { weekday: "long", year: "numeric", month: "short", day: "numeric" }
      );

      if (tarea.completed) {
        const hecha = document.createElement("div");
        hecha.classList.add("hecha");

        const iconoHecha = document.createElement("i");
        iconoHecha.classList.add("fa-regular");
        iconoHecha.classList.add("fa-circle-check");
        hecha.appendChild(iconoHecha);

        const cambioEstado = document.createElement("div");
        cambioEstado.classList.add("cambios-estados");

        const botonPendiente = document.createElement("button");
        botonPendiente.classList.add("change");
        botonPendiente.classList.add("completa");
        botonPendiente.addEventListener("click", () =>
          botonesCambioEstado(tarea.id, false)
        );
        const iconoPendiente = document.createElement("i");
        iconoPendiente.classList.add("fa-solid");
        iconoPendiente.classList.add("fa-rotate-left");

        botonPendiente.appendChild(iconoPendiente);

        const botonBorrar = document.createElement("button");
        botonBorrar.classList.add("borrar");
        botonBorrar.addEventListener("click", () => botonBorrarTarea(tarea.id));

        const iconoBorrar = document.createElement("i");
        iconoBorrar.classList.add("fa-regular");
        iconoBorrar.classList.add("fa-trash-can");

        botonBorrar.appendChild(iconoBorrar);

        itemDescripcion.appendChild(itemNombre);

        cambioEstado.appendChild(botonPendiente);
        cambioEstado.appendChild(botonBorrar);

        itemTareas.appendChild(hecha);
        itemTareas.appendChild(itemDescripcion);
        itemTareas.appendChild(cambioEstado);
        itemTareas.setAttribute("data-aos", "fade-up");

        tareasTerminadas.appendChild(itemTareas);
        contadorFinalizadas++;
      } else {
        const botonCompletado = document.createElement("button");
        botonCompletado.addEventListener("click", () =>
          botonesCambioEstado(tarea.id, true)
        );
        botonCompletado.classList.add("change");

        const icono = document.createElement("i");
        icono.classList.add("fa-regular");
        icono.classList.add("fa-circle");

        botonCompletado.appendChild(icono);

        itemDescripcion.appendChild(itemNombre);
        itemDescripcion.appendChild(itemTimestamp);

        itemTareas.appendChild(botonCompletado);
        itemTareas.appendChild(itemDescripcion);
        itemTareas.setAttribute("data-aos", "fade-down");

        tareasPendientes.appendChild(itemTareas);
        contadorPendientes++;
      }
    });

    cantPendientes.innerText = contadorPendientes;
    cantFinalizadas.innerText = contadorFinalizadas;
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  function botonesCambioEstado(id, completed) {
    const apiURL = `https://ctd-todo-api.herokuapp.com/v1/tasks/${id}`;

    const configuraciones = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: jwt,
      },
      body: JSON.stringify({
        completed,
      }),
    };

    fetch(apiURL, configuraciones).then(() => consultarTareas());
  }

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea(id) {
    const apiURL = `https://ctd-todo-api.herokuapp.com/v1/tasks/${id}`;

    const configuraciones = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: jwt,
      },
    };

    fetch(apiURL, configuraciones).then(() => consultarTareas());
  }
});
