"use client";

import React from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

import Image from "next/image";
import { useRouter } from "next/navigation";

export interface Product {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  image: string;
  images: string[];
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  details: string[];
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening product details when clicking the button
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0] || "M", // Default to first size (usually S or M)
    });
  };

  const handleNavigate = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      onClick={handleNavigate}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-[#1C1512]/5 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden aspect-[4/5] w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority={false}
        />
        {/* Hover overlay icons */}
        <div className="absolute inset-0 bg-[#1C1512]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="p-3 bg-white text-[#1C1512] rounded-full shadow-lg hover:bg-[#B78A62] hover:text-white transition-colors duration-300"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-serif text-lg text-[#1C1512] font-semibold tracking-wide hover:text-[#B78A62] transition-colors cursor-pointer mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="font-sans text-base font-bold text-[#B78A62] mb-4">
          {product.formattedPrice}
        </p>

        {/* Add To Cart Button */}
        <button
          onClick={handleAddToCart}
          className="mt-auto w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#B78A62] text-white font-sans text-sm font-semibold rounded-lg shadow-sm hover:bg-[#9E734D] transition-all duration-300 group-hover:shadow-md cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </motion.div>
  );
};
