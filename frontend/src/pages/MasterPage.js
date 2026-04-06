import React from "react";
import { useNavigate } from "react-router-dom";

export default function MasterPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="page-title">Master</h1>

      <div className="master-module-cards">

        {/* Customer Card */}
        <div
          className="master-module-card"
          onClick={() => navigate("/master/customers")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/master/customers")}
        >
          <h3>Customer</h3>
          <p>Read or Create customer data</p>
        </div>

        {/* Items Card */}
        <div
          className="master-module-card"
          onClick={() => navigate("/master/items")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/master/items")}
        >
          <h3>Items</h3>
          <p>Read or Create items data</p>
        </div>

      </div>
    </div>
  );
}
