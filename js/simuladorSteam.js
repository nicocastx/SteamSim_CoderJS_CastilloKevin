//Inicializacion de variables
const impuestaso = 1.69;

//Utilizacion de objetos de HTML
let bienvenida = document.getElementById("welcome");
let username = document.getElementById("username");
let containerJuegos = document.getElementById("containerJuegos");
let buscadorJuegos = document.getElementById("buscadorJuegos");
let carritoFormat = document.getElementById("carritoFormat");
let resetCarrito = document.getElementById("resetCarrito");
let confirmCompra = document.querySelector(`#comprarCarrito`);
let totalContainer = document.getElementById("totalContainer");

let carrito = [];
if (localStorage.getItem("carrito") != null) {
    carrito = JSON.parse(localStorage.getItem("carrito"));
}

//Solicitud de JSON local para los juegos
fetch("./src/json/juegos.json")
    .then(response => response.json())
    .then(juegos => {
        formatoJuego(juegos);
        haySesionIniciada(juegos);
        buscadorJuegos.addEventListener('input', () => {
            let busqueda = buscadorJuegos.value;
            listaBuscada = juegos.filter(juego => juego.nombre.toLowerCase().includes(busqueda.toLowerCase()));
            containerJuegos.innerHTML = "";
            formatoJuego(listaBuscada);
            haySesionIniciada(listaBuscada);
            listaBuscada.forEach(juego => {
                funcionAgregarBtn(juego)
                haySesionIniciada(listaBuscada);
            });
        });
        juegos.forEach(juego => {
            funcionAgregarBtn(juego);
            haySesionIniciada(juegos);
        });
    })

// Inicio

localStorage.getItem("carrito") != null ? leerCarrito() : null;

if (localStorage.getItem("usuario") == null) {
    username.innerHTML = `<div class="mb-3">
    <label for="usuario" class="form-label">Ingrese su nombre de usuario</label>
    <input type="text" class="form-control" id="usuario" aria-describedby="usernameHelp">
</div>
<button type="submit" class="btn btn-primary">Iniciar Sesion</button>
<h4>AVISO: no podra comprar hasta que inicie sesion</h4>`
} else {
    welcome.innerHTML = `<h2 class="userInput">Bienvenido, ${localStorage.getItem("usuario")} !</h2>
                            <button id="logout" class="btn btn-primary">No soy yo</button>
                            <p>AVISO: se le borrara todos los datos del carrito</p>`;
    cerrarSesion();
    Swal.fire('Session iniciada', `Bienvenido ${localStorage.getItem("usuario")}`, 'success');
}

// Total en blanco
if (localStorage.getItem("carrito") == null || localStorage.getItem("carrito") == []) {
    totalContainer.innerHTML = `<h3>Total a pagar:</h3>`
} else {
    actualizarTotal();
}

//Eventos

username.addEventListener('submit', (e) => {
    location.reload();
    e.preventDefault();
    let usuario = document.getElementById("usuario").value;
    localStorage.setItem("usuario", usuario);
    welcome.innerHTML = `<h2 class="userInput">Bienvenido, ${localStorage.getItem("usuario")} !</h2>
                            <button id="logout" class="btn btn-primary">No soy yo</button>
                            <p>AVISO: se le borrara todos los datos del carrito</p>`;
    cerrarSesion();
    Swal.fire('Session iniciada', `Bienvenido ${localStorage.getItem("usuario")}`, 'success');
})

//borrar un juego del carrito
resetCarrito.addEventListener('click', () => {
        limpiarCarrito();
    })
    -
    //confirmar compra de carrito
    confirmCompra.addEventListener('click', () => {
        if (localStorage.getItem("carrito") == null || carrito.length == 0) {
            Swal.fire('No hay productos en el carrito', '', 'warning')
        } else {
            Swal.fire({
                title: '¿Esta seguro de realizar la compra?',
                text: "No podrá volver atras!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si, realizar la compra!'
            }).then((result) => {
                confirmarCompra(result);
            })
        }
    });

//Funciones

function confirmarCompra(result){
    if (result.value) {
    Swal.fire(
        'Compra realizada!',
        'Gracias por su compra',
        'success'
    )
    limpiarCarrito();
    }
};

function funcionAgregarBtn(juego){
document.getElementById(`btnprod${juego.id}`).addEventListener('click', (e) => {
    e.preventDefault();
    agregarCarrito(juego);
    actualizarTotal();
    });
}


function formatoJuego(lista) {
    lista.forEach(juego => {
        containerJuegos.innerHTML += `<div class="card" id="juego${juego.id}" style="width: 18rem;">
        <img src="${juego.imagen}" class="card-img-top" alt="imagen de un juego">
            <div class="card-body">
                <h5 class="card-title">${juego.nombre}</h5>
                <p class="card-text">Precio en total: USD$${juego.precio}</p>
                <button id="btnprod${juego.id}" class="btn btn-primary">Agregar al carrito</button>
            </div>
        </div>`
    });
}

function agregarCarrito(juego) {
    const existe = carrito.some((juegoEncarrito) => juegoEncarrito.id === juego.id);
    const JuegoAlCarrito = {
        ...juego,
        cantidad: 1
    };
    comprobarExistencia(existe, JuegoAlCarrito, juego);
}

function comprobarExistencia(existe, JuegoAlCarrito, juego) {
    if (existe) {
        agregarAlCarrito(juego);
    } else {
        carrito.push(JuegoAlCarrito);
        actualizarCarrito();
        Toastify({
            text: "Producto agregado al carrito",
            duration: 3000,
            newWindow: true,
            close: false,
            avatar: `./src/img/check.png`,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to left, #00b09b, #96c93d)",
            },
            onClick: function () {} // Callback after click
        }).showToast();
    }
};

function actualizarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
        leerCarrito();
};

function agregarAlCarrito(juego) {
    carrito.map((JuegoEnCarrito) => {
        if (JuegoEnCarrito.id === juego.id) {
            JuegoEnCarrito.cantidad++;
            actualizarCarrito();
            Toastify({
                text: "Nueva cantidad en el carrito 😄",
                duration: 3000,
                newWindow: true,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to left, #00b09b, #96c93d)",
                },
                onClick: function () {} // Callback after click
            }).showToast();
        }
    })
};

function actualizarTotal() {
    let total = 0;
    JSON.parse(localStorage.getItem("carrito")).forEach(juego => {
        total += juego.cantidad * juego.precio;
    });
    fetch("https://criptoya.com/api/dolar")
        .then(response => response.json())
        .then(dolar => {
            let totalPesos = total * dolar.blue;
            let totalImpuesto = totalPesos * impuestaso;
            totalContainer.innerHTML = `<h3>Total a pagar:</h3>`
            totalContainer.innerHTML += `<h4>Total en dolares: USD$${total.toFixed(2)}</h4>`
            totalContainer.innerHTML += `<h4>Total en pesos: ARG$${totalPesos.toFixed(2)}</h4>`
            totalContainer.innerHTML += `<h4>Total en pesos con impuesto: ARG$${totalImpuesto.toFixed(2)}</h4>`
        })

};

function leerCarrito() {
    carritoFormat.innerHTML = "";
    JSON.parse(localStorage.getItem("carrito")).forEach(juego => {
        carritoFormat.innerHTML += `<div id="carrito${juego.id}" class="itemCarrito row mb-4 d-flex justify-content-between align-items-center">
                                    <div class="col-md-2 col-lg-2 col-xl-2">
                                        <img src="${juego.imagen}"
                                            class="img-fluid rounded-3" alt="Juego${juego.id}">
                                    </div>
                                    <div class="col-md-3 col-lg-3 col-xl-3">
                                        <h6 class="text-muted">${juego.nombre}</h6>
                                    </div>
                                    <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                                        <h6 class="mb-0">USD$${juego.precio}</h6>
                                    </div>
                                    <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                                        <h6 class="mb-0">Cantidad: ${juego.cantidad}</h6>
                                    </div>
                                    <div class="col-md-1 col-lg-1 col-xl-1 offset-lg-1">
                                    <button id="btnmenos${juego.id}" class="text-muted"><i class="fas fa-minus"></i></button>
                                    <button id="btnmas${juego.id}" class="text-muted"><i class="fas fa-plus"></i></button>
                                    </div>
                                    <div class="col-md-1 col-lg-1 col-xl-1 text-end">
                                        <button id="btnborrar${juego.id}" class="text-muted"><i class="fas fa-times"></i></button>
                                    </div>
                                </div>`;
    })
    btnsmas()
    btnsborrar();
    btnsmenos();
}

function btnsborrar() {
    carrito.forEach(juego => {
        document.getElementById(`btnborrar${juego.id}`).addEventListener('click', () => {
            carrito = carrito.filter(juegoCarrito => juegoCarrito.id != juego.id);
            document.getElementById(`carrito${juego.id}`).remove();
            localStorage.setItem("carrito", JSON.stringify(carrito));
            actualizarTotal();
            Toastify({
                text: "Se borro el producto del carrito 😔",
                duration: 3000,
                newWindow: true,
                close: false,
                avatar: ``,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #ed213a, #93291e)",
                },
                onClick: function () {} // Callback after click
            }).showToast();
        })
    })
}


function btnsmas() {
    carrito.forEach(juego => {
        document.getElementById(`btnmas${juego.id}`).addEventListener('click', () => {
            carrito = aumentarcarrito(carrito, juego);
            actualizarCarrito();
            actualizarTotal();
            Toastify({
                text: "Aumentada cantidad en carrito 👆",
                duration: 3000,
                newWindow: true,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to left, #00b09b, #96c93d)",
                },
                onClick: function () {} // Callback after click
            }).showToast();
        })
    })
}

function aumentarcarrito(carrito, juego){
    carrito.map(juegoCarrito => {
        if (juegoCarrito.id === juego.id) {
            juegoCarrito.cantidad++;
            return juegoCarrito;
        }
    })
    return carrito;
}

function btnsmenos() {
    carrito.forEach(juego => {
        document.getElementById(`btnmenos${juego.id}`).addEventListener('click', () => {
            carrito = descontarcarrito(carrito, juego);
            actualizarCarrito();
            actualizarTotal();
        })
    })
}

function descontarcarrito(carrito, juego){
    carrito.map(juegoCarrito => {
        if (juegoCarrito.id === juego.id) {
            descontarJuegoCantidad(juegoCarrito);
            return juegoCarrito;
        }
    })
    return carrito;
}

function descontarJuegoCantidad(juegoCarrito){
    if( juegoCarrito.cantidad > 1){
        juegoCarrito.cantidad--;
        Toastify({
            text: "Producto descontado 👇",
            duration: 3000,
            newWindow: true,
            close: false,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to right, #ed213a, #93291e)",
            },
            onClick: function () {} // Callback after click
        }).showToast();
        } else{
            Toastify({
                text: "Ya no se puede descontar, use la X para borrar",
                duration: 3000,
                newWindow: true,
                close: false,
                avatar: `./src/img/error.png`,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #ed213a, #93291e)",
                },
                onClick: function () {} // Callback after click
            }).showToast();
        }
}

function cerrarSesion() {
    let logout = document.querySelector(`#logout`);
    logout.addEventListener("click", () => {
        localStorage.removeItem("usuario");
        limpiarCarrito();
        location.reload();
    })
}

function limpiarCarrito() {
    carrito.length = 0;
    localStorage.removeItem("carrito", JSON.stringify(carrito));
    carritoFormat.innerHTML = "";
    totalContainer.innerHTML = `<h3>Total a pagar:</h3>`
};

// function haySesionIniciada(juegos) {
//     if (localStorage.getItem("usuario") == null || localStorage.getItem("usuario") == "") {
//         juegos.forEach(juego => {
//             document.getElementById(`btnprod${juego.id}`).disabled = true;
//         })
//     }
// };

function haySesionIniciada(juegos) {
    if (localStorage.getItem("usuario") == null || localStorage.getItem("usuario") == "") {
        juegos.forEach(juego => {
            document.getElementById(`btnprod${juego.id}`).disabled = true;
        })
    }
};