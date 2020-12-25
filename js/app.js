// variables
'use strict'

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];

// buttons DOM
let buttonsDOM = [];


// getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch("js/products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// diplay products
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach((product) => {
            result += `
            <!-- single products-->
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" alt="product-image" class="product-img">
                    <button class="bag-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end single product-->
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        // Method 1
        //const buttons = Array.prototype.slice.call(document.querySelectorAll(".bag-btn"));

        // Method 2
        //const buttons = Array.from(document.querySelectorAll(".bag-btn"));

        // ES6 approach
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
            let id = button.dataset.id;
            let inCart = cart.find((item) => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", (event) => {
                event.target.innerText = "In Cart";
                button.disabled = true;
                // get product from products
                let cartItem = {...Storage.getProducts(id), qty: 1 };
                // add product to cart

                // Method 1: first process in array data set multiple time
                //cart.push(cartItem);

                // Method 2: second process in array data set multiple time
                cart = [...cart, cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart items

                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            });
        });
    }
    setCartValues(cart) {
        let tempTotalAmount = 0;
        let itemsTotalQty = 0;
        cart.map((item) => {
            tempTotalAmount += item.price * item.qty;
            itemsTotalQty += item.qty;
        });
        cartTotal.innerText = parseFloat(tempTotalAmount.toFixed(2));
        cartItems.innerText = parseInt(itemsTotalQty);
    }
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<img src="${item.image}" alt="cart-product-image">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id = ${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id = ${item.id}></i>
                        <p class="item-amount">${item.qty}</p>
                        <i class="fas fa-chevron-down" data-id = ${item.id}></i>
                    </div>`;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    populateCart(cart) {
        cart.forEach((item) => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic() {
        // clear cart button
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        // cart functionality
    }
    clearCart() {
        let cartItems = cart.map((item) => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart">add to bag</i>`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    };
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    // setup application
    ui.setupAPP();
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
})