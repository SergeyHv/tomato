import React, { useEffect, useState } from "react";
import Filters from "./components/Filters";

export default function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        console.log("Raw data from backend:", data);
        setProducts(data);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Томатный Рай — новый фронтенд</h1>
      <p>Тестовая загрузка данных из backend:</p>

      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}

