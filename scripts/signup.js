window.addEventListener("load", function () {
  const formSignup = document.forms[0];
  /* ---------------------- obtenemos variables globales ---------------------- */

  /* -------------------------------------------------------------------------- */
  /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
  /* -------------------------------------------------------------------------- */

  formSignup.addEventListener("submit", function (event) {
    event.preventDefault();

    const inputNombre = document.getElementById("inputNombre");
    const inputApellido = document.getElementById("inputApellido");
    const inputEmail = document.getElementById("inputEmail");
    const inputPassword = document.getElementById("inputPassword");
    const inputPasswordRepetida = document.getElementById(
      "inputPasswordRepetida"
    );

    console.log(inputPassword, inputPasswordRepetida);

    if (inputPassword.value !== inputPasswordRepetida.value) {
      console.log("Las contraseñas no coinciden");
      return;
    }

    const usuario = {
      firstName: inputNombre.value,
      lastName: inputApellido.value,
      email: inputEmail.value,
      password: inputPassword,
    };

    realizarRegister(usuario);
  });

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 2: Realizar el signup [POST]                    */
  /* -------------------------------------------------------------------------- */
  function realizarRegister(user) {
    const apiURL = "https://ctd-todo-api.herokuapp.com/v1/users";

    const configuraciones = {
      method: "POST",
      headers: {
        "Content-Type": "application/json", //Le digo que le voy a enviar datos JSON
      },
      body: JSON.stringify(user),
    };

    fetch(apiURL, configuraciones)
      .then((respuesta) => respuesta.json())
      .then((respuesta) => {
        if (respuesta.jwt) {
          //si la respuesta tiene una propiedad que es jwt
          localStorage.setItem("jwt", respuesta.jwt); //lo guardamos en localStorage
          location.replace("/mis-tareas.html"); //Redirigimos al usuario a la página de mis tareas
        }
      });
  }
});
