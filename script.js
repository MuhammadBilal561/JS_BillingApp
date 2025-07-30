let grandTotal = 0;

function addProducts() {
  const productName = document.getElementById("productName").value.trim();
  const productPrice = parseFloat(
    document.getElementById("productPrice").value
  );
  const productQuantity = parseInt(
    document.getElementById("productQuantity").value
  );

  if (productName === "" || isNaN(productPrice) || isNaN(productQuantity)) {
    alert("Please fill all fields correctly.");
    return;
  }

  const total = productPrice * productQuantity;
  grandTotal += total;

  const tableFill = document.getElementById("resultBody");
  const row = document.createElement("tr");

  row.innerHTML = `
        <td>${productName}</td>
        <td>${productPrice.toFixed(2)}</td>
        <td>${productQuantity}</td>
        <td>${total.toFixed(2)}</td>
    `;

  tableFill.appendChild(row);

  document.getElementById("GrandTotal").textContent = `${grandTotal.toFixed(
    2
  )} PKR`;

  // Clear input fields
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productQuantity").value = "";
}
