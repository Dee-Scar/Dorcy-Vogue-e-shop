"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [added, setAdded] = useState(false);

  // Reset local state when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "M");
      setSelectedColor(product.colors[0] || "");
      setAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative border border-[#1C1512]/5 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-[#FAF7F2] rounded-full text-[#1C1512] transition-colors cursor-pointer z-25"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left: Product Image */}
          <div className="bg-[#FAF7F2] relative aspect-[4/5] md:aspect-auto md:h-full min-h-[300px] md:min-h-[500px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Right: Product Details */}
          <div className="p-8 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[600px]">
            <div>
              {/* Category */}
              <span className="font-sans text-xs font-bold text-[#B78A62] uppercase tracking-wider">
                {product.category}
              </span>

              {/* Title & Price */}
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C1512] tracking-wide mt-1.5 mb-2">
                {product.name}
              </h2>
              <p className="font-sans text-xl font-bold text-[#1C1512]">
                {product.formattedPrice}
              </p>

              <hr className="my-6 border-[#1C1512]/5" />

              {/* Description */}
              <p className="font-sans text-sm text-[#8C8682] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div className="mb-6 space-y-2.5">
                  <span className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Select Color: <span className="font-bold">{selectedColor}</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 border text-xs font-semibold rounded-md font-sans transition-all duration-200 cursor-pointer ${
                          selectedColor === color
                            ? "border-[#B78A62] bg-[#B78A62] text-white"
                            : "border-[#1C1512]/10 hover:border-[#1C1512] text-[#1C1512]"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div className="mb-6 space-y-2.5">
                  <span className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Select Size: <span className="font-bold">{selectedSize}</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 border rounded-lg flex items-center justify-center font-sans text-sm font-bold transition-all duration-200 cursor-pointer ${
                          selectedSize === size
                            ? "border-[#B78A62] bg-[#B78A62] text-white"
                            : "border-[#1C1512]/10 hover:border-[#1C1512] text-[#1C1512]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Bullet points */}
              {product.details.length > 0 && (
                <div className="mb-6 space-y-2">
                  <span className="block font-sans text-xs font-semibold text-[#1C1512] uppercase tracking-wider">
                    Highlights:
                  </span>
                  <ul className="list-disc pl-5 font-sans text-xs text-[#8C8682] space-y-1">
                    {product.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full py-4 flex items-center justify-center space-x-2 font-sans text-sm font-semibold rounded-lg shadow-md transition-all duration-300 cursor-pointer ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-[#B78A62] text-white hover:bg-[#9E734D]"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
