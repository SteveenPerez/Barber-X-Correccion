// Rol: navegación entre espacios según el rol y presentación de formularios de autenticación.
// Relación: delega las cargas de datos a los demás módulos y actualiza la sesión/interfaz compartida.
// Muestra el módulo administrativo elegido y dispara su carga correspondiente.
// Entradas: module: clave del módulo; null devuelve a la lista de personas.
// Salida: Ninguno; cambia paneles y carga datos bajo demanda.
// Uso: Al navegar entre secciones administrativas.
function setAdminModule(module) {
  const peoplePanel = document.querySelector("#people-panel");
  const modules = {
    inicio: document.querySelector("#admin-dashboard"),
    citas: document.querySelector("#admin-appointments"),
    servicios: document.querySelector("#admin-services"),
    reportes: document.querySelector("#admin-reports"),
    anexos: document.querySelector("#admin-annexes"),
    video: document.querySelector("#admin-video"),
    manual: document.querySelector("#admin-manual")
  };
  peoplePanel.hidden = Boolean(module);
  Object.entries(modules).forEach(([name, panel]) => { panel.hidden = module !== name; });
  document.querySelectorAll(".nav-item[data-type], .nav-item[data-module]").forEach(button => {
    const selected = module ? button.dataset.module === module : button.dataset.type === currentType;
    button.classList.toggle("active", selected);
    // Marca como actual solo el elemento de navegacion seleccionado.
    if (selected) button.setAttribute("aria-current", "page");
    // Retira aria-current de los elementos que no están activos.
    else button.removeAttribute("aria-current");
  });
  const titles = { inicio: "Inicio", citas: "Citas", servicios: "Servicios", reportes: "Reportes", anexos: "Anexos", video: "Video explicativo", manual: "Manual de usuario" };
  // Muestra el panel elegido o vuelve a Personas si no hay modulo.
  if (module) {
    document.querySelector("#breadcrumb-title").textContent = titles[module];
    // Carga el dashboard al abrir Inicio.
    if (module === "inicio") loadDashboard();
    // Carga la agenda al abrir Citas.
    if (module === "citas") loadAppointments(true);
    // Carga el catalogo al abrir Servicios.
    if (module === "servicios") loadAdminServices();
    // Carga indicadores e historial al abrir Reportes.
    if (module === "reportes") loadReports();
    // Carga el video al abrir esa seccion.
    if (module === "video") loadVideo(true);
    // Carga el manual al abrir esa seccion.
    if (module === "manual") loadManual(true);
  // Vuelve a Personas cuando no se eligio un modulo administrativo.
  } else {
    updateSection();
    loadPeople();
  }
}

// Oculta el acceso y presenta la interfaz que corresponde al rol autenticado.
// Entradas: user: identidad y rol devueltos por el controlador de sesión.
// Salida: Ninguno; activa el espacio y su carga inicial.
// Uso: Después de verificar o iniciar sesión/registro.
function showWorkspace(user) {
  signedInUser = user;
  loginScreen.hidden = true;
  document.querySelector("#admin-app").hidden = user.rol !== "admin";
  document.querySelector("#client-app").hidden = user.rol !== "cliente";
  document.querySelector("#barber-app").hidden = user.rol !== "barbero";
  // Inicializa saludo y dashboard del administrador.
  if (user.rol === "admin") {
    document.querySelector("#admin-name").textContent = `${user.nombre} ${user.apellido || ""}`.trim();
    document.querySelector("#dashboard-greeting").textContent = `¡Bienvenido, ${user.nombre}!`;
    setAdminModule("inicio");
  // Inicializa el saludo y la pestana de servicios del cliente.
  } else if (user.rol === "cliente") {
    document.querySelector("#client-greeting").textContent = `¡Hola, ${user.nombre}!`;
    setClientTab("services");
  // Inicializa el nombre y la agenda del barbero.
  } else if (user.rol === "barbero") {
    const nombre = `${user.nombre} ${user.apellido || ""}`.trim();
    document.querySelector("#barber-name").textContent = nombre;
    document.querySelector("#barber-greeting").textContent = `¡Bienvenido, ${user.nombre}!`;
    loadBarberDashboard();
  }
}

// Oculta áreas privadas y restablece el formulario de acceso.
// Entradas: message opcional: error que se presenta bajo el formulario.
// Salida: Ninguno; limpia la identidad local y enfoca el acceso.
// Uso: Al cerrar sesión o fallar la comprobación inicial.
function showLogin(message = "") {
  signedInUser = null;
  document.querySelector("#admin-app").hidden = true;
  document.querySelector("#client-app").hidden = true;
  document.querySelector("#barber-app").hidden = true;
  loginScreen.hidden = false;
  showLoginForm();
  document.querySelector("#login-error").textContent = message;
  loginForm.reset();
  loginForm.querySelector("[name='identificador']").focus();
}

// Cambia la pantalla de autenticación al registro de cliente.
// Entradas: Ninguna.
// Salida: Ninguno; muestra y enfoca el formulario de registro.
// Uso: Al pulsar el enlace para crear cuenta.
function showRegisterForm() {
  loginForm.hidden = true;
  registerForm.hidden = false;
  document.querySelector("#auth-title").textContent = "Crea tu cuenta";
  document.querySelector("#auth-subtitle").textContent = "Regístrate como cliente para conocer nuestros servicios.";
  document.querySelector("#auth-switch").innerHTML = "¿Ya tienes cuenta? <button type=\"button\" id=\"show-login\">Inicia sesión</button>";
  // Atiende el evento de clic en el control #show-login.
  document.querySelector("#show-login").addEventListener("click", showLoginForm);
  document.querySelector("#register-name").focus();
}

// Vuelve desde el registro al formulario de inicio de sesión.
// Entradas: Ninguna.
// Salida: Ninguno; muestra y enfoca el acceso.
// Uso: Al pulsar el enlace para entrar con una cuenta existente.
function showLoginForm() {
  registerForm.hidden = true;
  loginForm.hidden = false;
  document.querySelector("#auth-title").textContent = "Inicia sesión";
  document.querySelector("#auth-subtitle").textContent = "Ingresa para continuar a tu espacio.";
  document.querySelector("#auth-switch").innerHTML = "¿Aún no tienes cuenta? <button type=\"button\" id=\"show-register\">Regístrate aquí</button>";
  // Conecta los controles propios del espacio del barbero y su selector de periodo.
  // Atiende el evento de clic en el control #show-register.
  document.querySelector("#show-register").addEventListener("click", showRegisterForm);
  loginForm.querySelector("[name='identificador']").focus();
}

