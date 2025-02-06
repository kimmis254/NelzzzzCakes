// Smooth scroll for gallery dropdown links
// Ensure smooth scroll even after page load
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash;
  if (hash) {
    const targetSection = document.querySelector(hash);
    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({behavior: 'smooth'});
      }, 100); // Delay ensures the section is ready for scrolling
    }
  }
});
// Toggle between Delivery and Pickup
document.querySelectorAll('input[name="deliveryMethod"]').forEach(option => {
  option.addEventListener('change', () => {
    const isDelivery = option.value === 'delivery';
    document.getElementById('deliveryAddress').style.display = isDelivery ? 'block' : 'none';
    document.getElementById('pickupLocation').style.display = isDelivery ? 'none' : 'block';
  });
});

// Retrieve Order Details from Session Storage
document.addEventListener('DOMContentLoaded', () => {
  const orderDetails = JSON.parse(sessionStorage.getItem('orderDetails'));
  if (orderDetails) {
    document.getElementById('orderSummary').innerHTML = `
            <strong>Order:</strong> ${orderDetails.cake}<br>
            <strong>Weight:</strong> ${orderDetails.weight} kg<br>
            <strong>Quantity:</strong> ${orderDetails.quantity}<br>
            <strong>Color:</strong> ${orderDetails.color}<br>
            <strong>Design:</strong> ${orderDetails.design}<br>
            <strong>Inscription:</strong> "${orderDetails.inscription}" in ${orderDetails.inscriptionColor}<br>
            <strong>Additional Instructions:</strong> ${orderDetails.instructions || "None"}<br>
            <strong>Total:</strong> $${orderDetails.totalPrice}
        `;
  }
});
// Listen for form submission
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission (page reload)

  // Collect order details
  const orderDetails = {
    designDescription: document.getElementById("design").value,
    designLink: document.getElementById("designLink").value,
  };

  // Handle file attachment (optional)
  const designFile = document.getElementById("designFile").files[0];
  if (designFile) {
    const reader = new FileReader();
    reader.onload = function (event) {
      orderDetails.designImage = event.target.result; // Convert file to base64
      saveAndRedirect(orderDetails);
    };
    reader.readAsDataURL(designFile);
  } else {
    saveAndRedirect(orderDetails);
  }
});

// Save order data and navigate to checkout
function saveAndRedirect(orderDetails) {
  sessionStorage.setItem("orderDetails", JSON.stringify(orderDetails));
  window.location.href = "checkout.html"; //
}

document.addEventListener("DOMContentLoaded", () => {
  const orderDetails = JSON.parse(sessionStorage.getItem("orderDetails"));
  const customerDetails = JSON.parse(sessionStorage.getItem("customerDetails"));

  if (orderDetails && customerDetails) {
    document.getElementById("orderSummary").innerHTML = `
            <p><strong>Design:</strong> ${orderDetails.designDescription}</p>
            ${orderDetails.designLink ? `<p><strong>Design Link:</strong> <a href="${orderDetails.designLink}" target="_blank">${orderDetails.designLink}</a></p>` : ''}
            <p><strong>Delivery Address:</strong> ${customerDetails.address}</p>
            <p><strong>Customer:</strong> ${customerDetails.name} (${customerDetails.email}, ${customerDetails.phone})</p>
        `;
  } else {
    document.getElementById("orderSummary").innerHTML = "<p>No order details found.</p>";
  }
});

// Payment Guidelines Display
document.querySelectorAll('input[name="paymentMethod"]').forEach(option => {
  option.addEventListener('change', function () {
    const guidelines = document.getElementById("paymentGuidelines");
    switch (this.value) {
      case "mpesa":
        guidelines.innerHTML = `
                    <h3>M-Pesa Payment Instructions</h3>
                    <p>Go to M-Pesa > Lipa na M-Pesa > Paybill:</p>
                    <p><strong>Paybill Number:</strong> 123456</p>
                    <p><strong>Account Number:</strong> Order ID or Your Name</p>
                    <p>Enter the amount and your M-Pesa PIN to confirm.</p>
                `;
        break;

      case "card":
        guidelines.innerHTML = `
                    <h3>Card Payment Instructions</h3>
                    <p>Enter your card details in the secure form that will appear after confirmation.</p>
                `;
        break;

      case "deposit":
        guidelines.innerHTML = `
                    <h3>Deposit Payment Instructions</h3>
                    <p>Pay a 50% deposit via M-Pesa or card. The remaining balance will be settled upon delivery.</p>
                `;
        break;

      case "cod":
        guidelines.innerHTML = `
                    <h3>Cash on Delivery (COD)</h3>
                    <p>Pay the full amount upon delivery.</p>
                `;
        break;

      default:
        guidelines.innerHTML = "<p>Select a payment method to view instructions.</p>";
    }
  });
});

// Confirm Payment Button
document.getElementById("confirmPayment").addEventListener("click", () => {
  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (selectedPayment === "mpesa") {
    simulateMpesaPrompt();
  } else {
    alert(`Payment method selected: ${selectedPayment}. Proceeding with the order...`);
    window.location.href = "thankyou.html";
  }
});

// Simulated M-Pesa Prompt
function simulateMpesaPrompt() {
  const phoneNumber = prompt("Enter your M-Pesa phone number:");
  if (phoneNumber) {
    alert(`M-Pesa payment prompt sent to ${phoneNumber}. Please confirm the payment.`);
    window.location.href = "thankyou.html";
  } else {
    alert("Payment canceled.");
  }
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back(); // Navigate to the previous page
  } else {
    window.location.href = "index.html"; // Fallback: Go to homepage
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const orderType = document.getElementById('orderType');
  const cakeForm = document.getElementById('cakeForm');
  const cupcakeForm = document.getElementById('cupcakeForm');

  orderType.addEventListener('change', function () {
    // Hide both forms initially
    cakeForm.classList.add('hidden');
    cupcakeForm.classList.add('hidden');

    // Show the selected form with fade-in effect
    if (this.value === 'cake') {
      cakeForm.classList.remove('hidden');
      cakeForm.classList.add('show');
    } else if (this.value === 'cupcake') {
      cupcakeForm.classList.remove('hidden');
      cupcakeForm.classList.add('show');
    }
  });

  // Handle Cake Form Submission
  cakeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Cake order placed successfully!');
  });

  // Handle Cupcake Form Submission
  cupcakeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Cupcake order placed successfully!');
  });
});
  document.getElementById("cakeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const orderData = {
  order_type: "cake",
  cake_flavor: document.getElementById("cake").value,
  weight: document.getElementById("weight").value,
  quantity: document.getElementById("quantity").value,
  price: calculatePrice(),
  color: document.getElementById("color").value,
  inscription_color: document.getElementById("inscriptionColor").value,
  instructions: document.getElementById("instructions").value
};

  fetch("http://127.0.0.1:8000/api/orders/", {
  method: "POST",
  headers: {
  "Content-Type": "application/json"
},
  body: JSON.stringify(orderData)
})
  .then(response => response.json())
  .then(data => {
  console.log("Order Placed:", data);
  window.location.href = "checkout.html";
})
  .catch(error => console.error("Error:", error));
});

  function calculatePrice() {
  const weight = document.getElementById("weight").value;
  return weight * 2500;
}
document.addEventListener("DOMContentLoaded", function() {
    fetch("http://127.0.0.1:8000/api/orders/")
      .then(response => response.json())
      .then(data => {
        const lastOrder = data[data.length - 1];
        document.getElementById("orderSummary").innerHTML = `
          <h3>Order Summary</h3>
          <p>Type: ${lastOrder.order_type}</p>
          <p>Flavor: ${lastOrder.cake_flavor || lastOrder.cupcake_flavor}</p>
          <p>Weight: ${lastOrder.weight || "N/A"}</p>
          <p>Quantity: ${lastOrder.quantity}</p>
          <p>Price: Ksh ${lastOrder.price}</p>
          <p>Color: ${lastOrder.color}</p>
          <p>Inscription Color: ${lastOrder.inscription_color}</p>
          <p>Instructions: ${lastOrder.instructions}</p>
        `;
      })
      .catch(error => console.error("Error:", error));
  });


