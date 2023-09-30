class Producto{
    constructor(id,nombre,precio,descripcion,img, alt,cantidad=1){
        this.id = id
        this.nombre = nombre
        this.precio = precio
        this.descripcion=descripcion
        this.img = img
        this.alt =alt
        this.cantidad =cantidad
    }
    aumentarCantidad(){
        this.cantidad++
    }
    disminuirCantidad(){
        if(this.cantidad>1)
        {
            this.cantidad--
        }
    }
    descripcionCarrito(){
        return`<div class="card" style="width: 18rem;">
                  <img src="${this.img}" class="card-img-top" alt="${this.alt}">
                  <div class="card-body">
                     <h5 class="card-title">Nombre:${this.nombre}</h5>
                     <p class="card-text">Descripcion:${this.descripcion}</p>
                     <p class="card-text">Precio:S/.${this.precio}</p>
                     
                     <p class="card-text">
                     Cantidad:
                     <button class="btn btn-secondary" id="disminuir-${this.id}"><i class="fa-solid fa-minus"></i></button>
                     ${this.cantidad}
                     <button class="btn btn-secondary" id="aumentar-${this.id}"><i class="fa-solid fa-plus"></i></button>
                     </p>
                     <button class="btn btn-danger" id="ep-${this.id}">
                      <i class="fa-solid fa-trash "></i>
                     </button>              
                   </div>   
               </div>`
    }
    descripcionProducto(){
        return `<div class="card" style="width: 18rem;">
        <img src="${this.img}" class="card-img-top" alt="${this.alt}">
        <div class="card-body">
          <h5 class="card-title">${this.nombre}</h5>
          <p class="card-text">${this.descripcion}</p>
          <p class="card-text">S/.${this.precio}</p>
          <button  class="btn btn-primary" id="ap-${this.id}">Añadir al carrito</button>
        </div>   
     </div>`;
    }
}
class ProductoController{
    constructor(){
        this.listaProductos=[]
    }
    eventoFiltro(){
        const precio_min = document.getElementById("precio_min");
        const precio_max = document.getElementById("precio_max");
        
        let valorMinimo = 0;
        let valorMaximo = Infinity;
        
        precio_min.addEventListener("change", () => {
            if (precio_min.value > 0) {
                valorMinimo = parseInt(precio_min.value);
            } else {
                valorMinimo = 0;
            }
            this.filtrarPrecio(valorMinimo, valorMaximo);
        });
    
        precio_max.addEventListener("change", () => {
            if (precio_max.value > 0) {
                valorMaximo = parseInt(precio_max.value);
            } else {
                valorMaximo = Infinity;
            }
            this.filtrarPrecio(valorMinimo, valorMaximo);
        });
    }
    filtrarPrecio(min,max)
    {

           const productosFiltrados = this.listaProductos.filter(producto => producto.precio >= min && producto.precio <= max);
           this.mostrarEnDOM(productosFiltrados);

    }

    agregar(producto){
        if(producto instanceof Producto)
        {
            this.listaProductos.push(producto)
        } 
    }
    mostrartoastify(producto){
        Toastify({

            text: `¡${producto.nombre} añadido!`, 
            avatar: `${producto.img}`,
            duration: 2000,
            gravity:"bottom",
            position:"right",
            stopOnFocus: true,
            style:{
                background:"linear-gradient(to right, fuchsia, pink)",
            }  
            }).showToast();

    }

   
    mostrarEnDOM(productos = this.listaProductos) {
        const contenedorProductos = document.getElementById("contenedor_productos");
        contenedorProductos.innerHTML = "";
    
        const productosPerRow = 3;
    
        for (let i = 0; i < productos.length; i += productosPerRow) {
            const row = document.createElement("div");
            row.classList.add("row");
    
            for (let j = i; j < i + productosPerRow && j < productos.length; j++) {
                const col = document.createElement("div");
                col.classList.add("col-4");
                col.innerHTML = productos[j].descripcionProducto();
                row.appendChild(col);
            }
    
            contenedorProductos.appendChild(row);
        }
    
        productos.forEach(producto => {
            const btnAgregar = document.getElementById(`ap-${producto.id}`);
            btnAgregar.addEventListener("click", () => {
                carrito.agregar(producto);
                carrito.guardarEnStorage();
                carrito.mostrarEnDOM();
                console.log('evento disparado')
                this.mostrartoastify(producto);
            });
        });
    }
    

       
async preparar_contenedor_Productos(){
    try {
        const listaProductosJSON = await fetch("productos.json");
        const listaProductosJS = await listaProductosJSON.json();

        listaProductosJS.forEach(item => {
            const nuevoProducto = new Producto(item.id, item.nombre, item.precio, item.descripcion, item.img, item.alt, item.cantidad);
            this.agregar(nuevoProducto);
        });

        this.mostrarEnDOM();
    } catch (error) {
        console.error('Error al obtener o mostrar los productos:', error);
    }
    }
}
class Carrito{
    constructor(){
        this.listaCarrito = []
        this.localStorageKey="listaCarrito"
    }
    agregar(productoAgregar){
        // se identifica si esta o no el producto en el carrito
        let existe= this.listaCarrito.some(producto=>producto.id==productoAgregar.id)//devielve un valor booleano

        if(existe)
        {
            let producto = this.listaCarrito.find(producto=> producto.id==productoAgregar.id)
            producto.aumentarCantidad()
        }else{
            if(productoAgregar instanceof Producto)
            {
                this.listaCarrito.push(productoAgregar)
            }
        }
    }
    eliminar(producto_eliminar){
        let indice_eliminar = this.listaCarrito.findIndex(producto => producto.id == producto_eliminar.id)
        this.listaCarrito.splice(indice_eliminar,1)
      }
    //Se guarda en Storage
    guardarEnStorage(){
        let listaCarritoJSON= JSON.stringify(this.listaCarrito)
            localStorage.setItem(this.localStorageKey,listaCarritoJSON) 
    }
    recuperarStorage(){
        let listaCarritoJSON= localStorage.getItem(this.localStorageKey)
        let listaCarritoparse=JSON.parse(listaCarritoJSON)// se transforma a objeto
        let listaAux=[]
        listaCarritoparse.forEach(
            producto=>{
                let nuevoProducto = new Producto(producto.id,producto.nombre,producto.precio, producto.descripcion,producto.img,producto.alt, producto.cantidad)
                listaAux.push(nuevoProducto)
            }
        )
        this.listaCarrito = listaAux
    }
    filtrarPorPrecio(){
        let valorMax;
        this.listaProductos=this.listaProductos.filter(producto=>producto.precio<=valorMax)
    }
    mostrarEnDOM(){
         let contenedor_carrito=document.getElementById("contenedor_carrito")
        contenedor_carrito.innerHTML =""
        this.listaCarrito.forEach( producto=>{
            contenedor_carrito.innerHTML +=producto.descripcionCarrito()
        })
        this.eventoEliminar()
        this.eventoAumentar()
        this.eventoDisminuir()
        this.mostrarTotal()
    }
    eventoAumentar(){
        this.listaCarrito.forEach(producto=>{
            //obtener el id de los botones
            const btn_aumentar =document.getElementById(`aumentar-${producto.id}`)
            //darle el evento
            btn_aumentar.addEventListener("click",()=>{
                producto.aumentarCantidad()
                this.mostrarEnDOM()
            })
        })

    }
    eventoDisminuir(){
        this.listaCarrito.forEach(producto=>{
            //obtener el id de los botones
            const btn_disminuir =document.getElementById(`disminuir-${producto.id}`)
            //darle el evento
            btn_disminuir.addEventListener("click",()=>{
                producto.disminuirCantidad()
                this.mostrarEnDOM()
            })
        })

    }
    trapo(){
        this.listaCarrito=[]
    }
    eventoFinalizarCompra()
    {
        const finalizar_compra = document.getElementById("finalizar_compra");

        if (finalizar_compra) {
            finalizar_compra.addEventListener("click", () => {
                if(this.listaCarrito.length>0){
                // Calcular el importe consumido
                const importeConsumido = this.calcularTotal();
                // Mostrar mensaje con el importe consumido
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: `¡Compra realizada con éxito😁! Importe consumido: S/.${importeConsumido}`,
                    timer: 1500
                });
                // Limpiar el Storage
                localStorage.setItem(this.localStorageKey, "[]"); 
                // Limpiar el carrito
                this.trapo();
                // Renderizar
                this.mostrarEnDOM();
                }
                else{
                    Swal.fire({
                        position: 'center',
                        icon: 'warning',
                        title: `¡Aun no has añadido producto☹️`,
                        timer: 1500
                    });

                }
    

            });
        } else {
            console.error('No se encontró el elemento con id "finalizar_compra".');
        }
        
    }
    eventoEliminar(){
        this.listaCarrito.forEach(producto=>{
            //obtener el id de los botones
            const btn_eliminar =document.getElementById(`ep-${producto.id}`)
            //darle el evento
            btn_eliminar.addEventListener("click",()=>{
                //eliminar del carrito
                this.eliminar(producto)
                //actualizar storage
                this.guardarEnStorage()
                //mostrarEnDOM
                this.mostrarEnDOM()
            })
        })
    }
    calcularTotal(){
      return  this.listaCarrito.reduce((acumulador,producto)=>acumulador+producto.precio*producto.cantidad,0)
    }
    mostrarTotal()
    {
        const precio_total=document.getElementById("precio_total")
        precio_total.innerText=`Importe total: S/.${this.calcularTotal()}`
    }
}
const carrito = new Carrito()
const CP = new ProductoController()

//carrito.recuperarStorage()
carrito.mostrarEnDOM()
carrito.eventoFinalizarCompra()
//CP.cargarProductos()
//CP.mostrarEnDOM()
CP.preparar_contenedor_Productos()
CP.eventoFiltro()
//Funcion para crear el temporizador
function actualizarTemporizador(tiempoInicialEnMinutos) {
    let tiempoRestante = tiempoInicialEnMinutos * 60; // Convertir a segundos
  
    function actualizar() {
      const minutos = Math.floor(tiempoRestante / 60).toString().padStart(2, '0');
      const segundos = (tiempoRestante % 60).toString().padStart(2, '0');
  
      document.getElementById('tiempo_restante').innerText = `${minutos}:${segundos}`;
  
      if (tiempoRestante > 0) {
        tiempoRestante--;
      } else {
        clearInterval(temporizadorInterval);
        // Mostrar un mensaje usando SweetAlert2 cuando el tiempo llega a cero
        Swal.fire({
          icon: 'info',
          title: '¡Tiempo  de promocion agotado!',
          text: 'No ha adquirido ninguna prenda aùn.'
        });
      }
    }
  
    // Llamar a la función para actualizar inmediatamente
    actualizar();
  
    // Actualizar cada segundo
    const temporizadorInterval = setInterval(actualizar, 1000);
  }
  
  // Llamar a la función para iniciar el temporizador con 5 minutos
  actualizarTemporizador(5);
  
  
  
  






