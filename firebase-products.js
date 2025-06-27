import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNSpayhzItGiJB4llF93ICW_jIgrvgPak",
  authDomain: "medicine-delivery-130aa.firebaseapp.com",
  databaseURL: "https://medicine-delivery-130aa-default-rtdb.firebaseio.com",
  projectId: "medicine-delivery-130aa",
  storageBucket: "medicine-delivery-130aa.appspot.com",
  messagingSenderId: "539898474363",
  appId: "1:539898474363:web:2debf03eb6a2f33e65d7de",
  measurementId: "G-H3RBF4GRNX"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Load all products
function loadAllProducts() {
  const productsRef = ref(database, 'products');
  const productsContainer = document.getElementById('products-container');

  onValue(productsRef, (snapshot) => {
    productsContainer.innerHTML = '';
    const allProducts = snapshot.val();

    if (allProducts) {
      Object.values(allProducts).forEach(product => {
        productsContainer.innerHTML += `
          <div class="col-md-4 mb-4">
            <div class="card h-100 product-card" data-id="${product.id}">
              <img src="${product.image}" class="card-img-top p-3" alt="${product.name}" style="height: 200px; object-fit: contain;">
              <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <div class="d-flex align-items-center mb-2">
                  <span class="h5 text-success me-2">₹${product.price.toFixed(2)}</span>
                  <span class="text-muted text-decoration-line-through">₹${product.mrp.toFixed(2)}</span>
                  <span class="badge bg-danger ms-2">${product.discount}</span>
                </div>
                <button class="btn btn-primary w-100 add-to-cart">Add to Cart</button>
              </div>
            </div>
          </div>
        `;
      });

      // Add event listeners to all buttons
      document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
      });
    } else {
      productsContainer.innerHTML = '<p class="text-center py-5">No medicines available at the moment.</p>';
    }
  });
}

// Add to cart function
async function addToCart(event) {
  const productCard = event.target.closest('.product-card');
  const productId = productCard.dataset.id;
  const productName = productCard.querySelector('.card-title').textContent;
  const productPrice = parseFloat(productCard.querySelector('.text-success').textContent.replace('₹', ''));

  const user = auth.currentUser;
  if (!user) {
    alert('Please login to add items to your cart');
    window.location.href = 'login.html';
    return;
  }

  const cartRef = ref(database, `users/${user.uid}/cart/${productId}`);
  
  try {
    await set(cartRef, {
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1,
      image: productCard.querySelector('img').src
    });
    
    // Visual feedback
    event.target.textContent = 'Added!';
    event.target.classList.remove('btn-primary');
    event.target.classList.add('btn-success');
    setTimeout(() => {
      event.target.textContent = 'Add to Cart';
      event.target.classList.remove('btn-success');
      event.target.classList.add('btn-primary');
    }, 1500);
  } catch (error) {
    alert('Failed to add to cart: ' + error.message);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check auth state
  auth.onAuthStateChanged(user => {
    if (!user && window.location.pathname !== '/login.html') {
      // window.location.href = 'login.html'; // Uncomment to force login
    }
  });
  
  loadAllProducts();
});