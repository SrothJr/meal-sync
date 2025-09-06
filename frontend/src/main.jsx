import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Load Stripe publishable key
const stripePromise = loadStripe(
  "pk_test_51S40lZ5bAtEhjt4ahio75eoc542RhDJ9F9jD6JEnKIrhWUcMi2Zj4WVHdeev3HxsOTxNxryix6G8m1WKPYXlDDa800KohsF8ql"
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </BrowserRouter>
  </StrictMode>
);
