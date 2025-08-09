import { Link } from "react-router-dom";
import { useRef, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { Button } from "../../components/ui/button";
import { Heart, Search, ShoppingCart, ChevronLeft, ChevronRight, Home, Phone, Mail, Facebook, Instagram } from "lucide-react";
import { CartContext } from "../cart/CartContext"; 

export default function AdventureShop() {
  const [items, setItems] = useState([]);
  
  const scrollRef = useRef(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/items");
        const data = await response.json();
        console.log("Fetched items from API:", data);
        setItems(data.message || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);

  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: direction === "left" ? -880 : 880, behavior: "smooth" });
  };

  return (
    <div className="w-full font-sans">
      <header className="bg-black text-white px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Adventure Shop</div>
        <nav className="flex items-center gap-6">
          <Link to="#" className="hover:text-gray-300 transition">For Men</Link>
          <Link to="#" className="hover:text-gray-300 transition">For Women</Link>
          <Link to="#" className="hover:text-gray-300 transition">Inventory</Link>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-1 rounded-md text-grey w-48 bg-transparent border-b border-white focus:outline-none"
            />
            <Search className="absolute right-2 top-1.5 h-4 w-4 text-gray-400 " />
          </div>
          <Link to="/cart">
            <Button variant="ghost" className="text-white hover:text-gray-300 transition">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Banner */}
      <section className="relative h-[300px] w-full bg-gray-200 bg-center bg-cover" style={{ backgroundImage: "url('/your-banner.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-start px-10">
          <h1 className="text-white text-4xl font-bold max-w-xl leading-tight mb-4">
            Rain jackets<br /> for your adventures
          </h1>
          <div className="flex gap-4">
            <Button variant="outline" className="text-black border-none hover:bg-orange-300 hover:text-white rounded-none transition">For Women</Button>
            <Button variant="outline" className="text-black border-none hover:bg-orange-300 hover:text-white rounded-none transition">For Men</Button>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        {[1, 2].map((_, index) => (
          <div key={index} className="relative h-[250px] bg-gray-100 overflow-hidden rounded-none">
            <img src={`/placeholder${index + 1}.jpg`} alt="Highlight" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 pb-20">
              <h2 className="text-white text-xl font-bold mb-2">
                {index === 0
                  ? `"JET BOIL"\n camping stoves`
                  : `Extremely lightweight\n BIG AGNES tents`}
              </h2>
              <Button className="w-fit bg-white text-black hover:bg-orange-300 hover:text-white rounded-none transition">View Products</Button>
            </div>
          </div>
        ))}
      </section>
      {/* Recommended */}
      <section className="w-full px-4 md:px-12 py-8 space-y-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center">RECOMMENDED</h2>

        {/* Scroll Cards */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 snap-x snap-mandatory scroll-smooth"
          >
            {items.map((item, i) => (
              <div
                key={item._id || i}
                className="min-w-[220px] snap-start group border rounded-lg p-4 text-center space-y-2 shadow-sm hover:shadow-md transition hover:border-orange-300 relative hover:cursor-pointer"
              >
                <Link to={`/product/${item._id}`}>
                  <div className="h-36 bg-gray-100 mb-2 flex items-center justify-center relative overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">No Image</span>
                    )}
                  </div>
                </Link>
                <p className="text-xs text-gray-500 font-semibold uppercase hover:text-orange-300 transition">{item.brand}</p>
                <p className="text-sm font-medium hover:text-orange-300 transition">{item.name}</p>
                <p className="text-base font-semibold">€{item.price}</p>

                {/* Actions */}
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => addToCart(item)}>
                    <ShoppingCart className="h-4 w-4 mr-1" /> Add
                  </Button>
                  <Link to={`/product/${item._id}`}>
                    <Button variant="secondary" size="sm">
                      <Search className="h-4 w-4 mr-1" /> View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Buttons */}
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 shadow-md z-10 hover:bg-orange-300 transition"
            onClick={() => handleScroll("left")}
          >
            <ChevronLeft />
          </button>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 shadow-md z-10 hover:bg-orange-300 transition"
            onClick={() => handleScroll("right")}
          >
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative bg-yellow-400 h-[200px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <h3 className="text-black text-xl font-bold">GRYNAM ORE<br />DOVANŲ ČEKIS</h3>
              <Button className="bg-white text-black hover:bg-orange-400 hover:text-white transition">SELECT AMOUNT</Button>
            </div>
          </div>

          <div className="relative bg-cover bg-center h-[200px]" style={{ backgroundImage: "url('/discount.jpg')" }}>
            <div className="bg-black/40 h-full w-full flex flex-col justify-center items-center text-center p-4 space-y-2">
              <h3 className="text-orange-300 text-xl font-bold">SALE!</h3>
              <p className="text-white font-semibold">DISCOUNTS up to -40%</p>
              <Button className="bg-white text-black hover:bg-orange-400 hover:text-white transition">VIEW PRODUCTS</Button>
            </div>
          </div>

          <div className="relative bg-cover bg-center h-[200px]" style={{ backgroundImage: "url('/maintenance.jpg')" }}>
            <div className="bg-black/40 h-full w-full flex flex-col justify-center items-center text-center p-4 space-y-2">
              <h3 className="text-white font-semibold">Maintenance measures<br />for clothing and footwear</h3>
              <Button className="bg-white text-black hover:bg-orange-400 hover:text-white transition">VIEW PRODUCTS</Button>
            </div>
          </div>
        </div>
      </section>
      {/* Brand Logos */}
<div className="flex flex-wrap justify-center items-center gap-12 py-10 bg-white">
  <img src="/logo-opinel.png" alt="Opinel" className="h-12" />
  <img src="/logo-osprey.png" alt="Osprey" className="h-14" />
  <img src="/logo-patagonia.png" alt="Patagonia" className="h-14" />
  <img src="/logo-platypus.png" alt="Platypus" className="h-10" />
  <img src="/logo-primus.png" alt="Primus" className="h-10" />
  <img src="/logo-real.png" alt="Real Turmat" className="h-10" />
</div>

{/* Footer */}
<footer className="bg-black text-white px-6 md:px-20 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
  {/* Logo + Tagline */}
  <div className="space-y-3">
    <div className="text-yellow-400 text-2xl font-bold flex items-center gap-2">
      <span className="text-3xl">🟧</span>
      <span>grynam<br />ore</span>
    </div>
    <p className="text-sm text-white">Active leisure and tourism goods</p>
    <p className="text-sm font-semibold text-white">Stuff for new stories.</p>
  </div>

  {/* Information */}
  <div>
    <h4 className="font-bold mb-3">Information</h4>
    <ul className="space-y-2 text-sm text-white">
      <li><a href="#">Delivery and returns</a></li>
      <li><a href="#">Terms of use</a></li>
      <li><a href="#">Privacy Policy</a></li>
      <li><a href="#">My account</a></li>
    </ul>
  </div>

  {/* Contacts */}
  <div>
    <h4 className="font-bold mb-3">Contacts</h4>
    <ul className="space-y-2 text-sm text-white">
      <li className="flex items-center gap-2"><Home size={16} /> Bangu St. 7, Klaipėda</li>
      <li className="flex items-center gap-2"><Phone size={16} /> +37062965123</li>
      <li className="flex items-center gap-2"><Mail size={16} /> info@grynamore.lt</li>
      <li className="flex items-center gap-2"><Facebook size={16} /> pure love</li>
      <li className="flex items-center gap-2"><Instagram size={16} /> pureamorelt</li>
    </ul>
  </div>

  {/* Working Hours */}
  <div>
    <h4 className="font-bold mb-3">Working hours</h4>
    <ul className="space-y-2 text-sm text-white">
      <li>I – we are not working</li>
      <li>II–V 11:00 – 19:00</li>
      <li>VI 11:00 – 16:00</li>
      <li>VII – we are not working</li>
    </ul>
  </div>
</footer>

    </div>
  );
}