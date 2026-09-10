'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from './CartProvider';

interface ProductModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart, setSidebarOpen } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setInstructions('');
      // Default first variant if exists
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0].id);
      } else {
        setSelectedVariant(null);
      }

      // Pre-select required modifiers (first option)
      const initialMods: Record<string, string[]> = {};
      product.modifier_groups?.forEach((mgLink: any) => {
        const group = mgLink.modifier_group;
        if (group?.required && group.modifiers?.length > 0) {
          initialMods[group.id] = [group.modifiers[0].id];
        } else {
          initialMods[group.id] = [];
        }
      });
      setSelectedModifiers(initialMods);
    }
  }, [product]);

  const handleModifierToggle = (groupId: string, modifierId: string, maxSelect: number, isRadio: boolean) => {
    setSelectedModifiers((prev) => {
      const current = prev[groupId] || [];
      if (isRadio || maxSelect === 1) {
        return { ...prev, [groupId]: [modifierId] };
      }

      if (current.includes(modifierId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== modifierId) };
      }

      if (maxSelect && current.length >= maxSelect) {
        return prev;
      }

      return { ...prev, [groupId]: [...current, modifierId] };
    });
  };

  // Dynamic Price Calculation
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let basePrice = product.base_price_minor ? product.base_price_minor / 100 : 0;

    // Variant price override if present
    if (selectedVariant && product.variants) {
      const variant = product.variants.find((v: any) => v.id === selectedVariant);
      if (variant && variant.price_minor) {
        basePrice = variant.price_minor / 100;
      }
    }

    // Add modifier price deltas
    let modifierTotal = 0;
    if (product.modifier_groups) {
      product.modifier_groups.forEach((mgLink: any) => {
        const group = mgLink.modifier_group;
        const selectedIds = selectedModifiers[group?.id] || [];
        group?.modifiers?.forEach((m: any) => {
          if (selectedIds.includes(m.id)) {
            modifierTotal += (m.price_delta_minor || 0) / 100;
          }
        });
      });
    }

    return (basePrice + modifierTotal) * quantity;
  }, [product, selectedVariant, selectedModifiers, quantity]);

  const handleAddToCart = () => {
    if (!product) return;
    const allSelectedModifiers = Object.values(selectedModifiers).flat();
    addToCart(product.id, selectedVariant || undefined, quantity, allSelectedModifiers);
    onClose();
    // Automatically open the cart drawer to display added item
    setTimeout(() => {
      setSidebarOpen(true);
    }, 150);
  };

  if (!isOpen || !product) return null;

  const imageUrl = product.media?.[0]?.media_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Image Banner with Close Button */}
        <div className="relative aspect-[16/9] w-full bg-gray-100 flex-shrink-0">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/80 hover:bg-white text-gray-900 font-bold flex items-center justify-center shadow-lg transition"
            aria-label="Close modal"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-6 text-white">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F15B25] text-white text-xs font-black uppercase">
              {product.category?.name || 'Cheezious Special'}
            </span>
            <h2 className="text-2xl font-black mt-1 drop-shadow-md">{product.name}</h2>
          </div>
        </div>

        {/* Modal Body: Scrollable Options */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-gray-100">
          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || 'Deliciously prepared with authentic secret spices and rich ingredients.'}
            </p>
            <div className="mt-2 text-lg font-black text-gray-900">
              Base Price: {product.currency_code || 'PKR'} {product.base_price_minor ? (product.base_price_minor / 100).toLocaleString() : 0}
            </div>
          </div>

          {/* Variants (e.g. Sizes) */}
          {product.variants && product.variants.length > 0 && (
            <div className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-gray-900 text-base">Select Option</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-[#F15B25]">Required</span>
              </div>
              <div className="space-y-2">
                {product.variants.map((v: any) => (
                  <label
                    key={v.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedVariant === v.id
                        ? 'border-[#F15B25] bg-orange-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="product_variant"
                        checked={selectedVariant === v.id}
                        onChange={() => setSelectedVariant(v.id)}
                        className="h-4 w-4 text-[#F15B25] focus:ring-[#F15B25]"
                      />
                      <span className="font-bold text-gray-800 text-sm">{v.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      {product.currency_code} {(v.price_minor / 100).toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Modifier Groups (Sizes, Crusts, Add-ons) */}
          {product.modifier_groups && product.modifier_groups.map((mgLink: any) => {
            const group = mgLink.modifier_group;
            if (!group || !group.modifiers || group.modifiers.length === 0) return null;

            const selected = selectedModifiers[group.id] || [];
            const isSingleChoice = group.max_select === 1;

            return (
              <div key={group.id} className="pt-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-extrabold text-gray-900 text-base">{group.name}</h3>
                  {group.required ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-[#F15B25]">Required</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400">Optional (Up to {group.max_select})</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {isSingleChoice ? 'Choose 1 option' : `Select up to ${group.max_select} options`}
                </p>

                <div className="space-y-2">
                  {group.modifiers.map((mod: any) => {
                    const isChecked = selected.includes(mod.id);
                    const deltaPrice = mod.price_delta_minor ? mod.price_delta_minor / 100 : 0;

                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                          isChecked
                            ? 'border-[#F15B25] bg-orange-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={isSingleChoice ? 'radio' : 'checkbox'}
                            name={`group_${group.id}`}
                            checked={isChecked}
                            onChange={() =>
                              handleModifierToggle(group.id, mod.id, group.max_select, isSingleChoice)
                            }
                            className={`h-4 w-4 text-[#F15B25] focus:ring-[#F15B25] ${isSingleChoice ? '' : 'rounded'}`}
                          />
                          <span className="font-bold text-gray-800 text-sm">{mod.name}</span>
                        </div>
                        {deltaPrice > 0 ? (
                          <span className="font-bold text-[#F15B25] text-sm">
                            +{product.currency_code || 'PKR'} {deltaPrice.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400">Free</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special Instructions */}
          <div className="pt-5">
            <label className="block font-extrabold text-gray-900 text-sm mb-1.5">Special Instructions</label>
            <textarea
              rows={2}
              placeholder="E.g. No onions, extra spicy, well done..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#F15B25] focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-11 flex items-center justify-center font-black text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition"
            >
              -
            </button>
            <span className="w-10 text-center font-black text-gray-900 text-base">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-11 flex items-center justify-center font-black text-gray-700 hover:bg-gray-100 transition"
            >
              +
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-6 bg-[#F15B25] hover:bg-[#d94a18] text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-between text-base"
          >
            <span>Add to Cart</span>
            <span>PKR {totalPrice.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
