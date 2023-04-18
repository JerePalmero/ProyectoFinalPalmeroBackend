const cartId = document.getElementById('user_cart')?.getAttribute("cartid");

const botones = document.getElementsByName('addToCart')
botones.forEach(boton => {
    boton.addEventListener('click',async ()=>{
        await fetch(`/api/carts/${cartId}/products/${boton.id}`, {
            method: 'POST',
        }).then(result => {
            if(result.status == 410) return alert("No puedes agregar productos de tu autoría a tu carrito")
            if(result.status == 401) window.location.replace("/views/login")
            else alert("Producto Agregado"), document.location.reload()})
            .catch(error => console.log(error))
    })
})

const eliminar = document.getElementsByName('removeFromCart')
eliminar.forEach(boton => {
    boton.addEventListener('click',async ()=>{
        await fetch(`/api/carts/${cartId}/products/${boton.id}`, {
            method: 'DELETE',
        }).then(result => console.log(result), document.location.reload())
    })
})
