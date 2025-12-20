import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Filters from "./components/Filters";
import ProductGrid from "./components/ProductGrid";
import { adaptProduct } from "./utils/adapter";

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const adapted = data.map(adaptProduct);
        setProducts(adapted);
      });
  }, []);

  function mapCategory(cat) {
    switch (cat) {
      case "tomatoes":
        return "Томат";
      case "peppers":
        return "Перец";
      case "cucumbers":
        return "Огурец";
      default:
        return "";
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? p.type === mapCategory(category) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Header />
      <Filters
        onSearch={(value) => setSearch(value)}
        onCategory={(value) => setCategory(value)}
      />

      <ProductGrid products={filteredProducts} />
    </div>
  );
}
