'use client';

import React, { useState } from 'react';
import { Button } from '@restaurant/ui';

interface ProductCustomizerProps {
  product: any; // We'll type this properly later, but it contains variants and modifier_groups
}

export function ProductCustomizer({ product }: ProductCustomizerProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants?.length > 0 ? product.variants[0].id : null
  );
  
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  
  const handleModifierToggle = (groupId: string, modifierId: string, maxSelections: number) => {
    setSelectedModifiers(prev => {
      const groupSelections = prev[groupId] || [];
      if (groupSelections.includes(modifierId)) {
        return { ...prev, [groupId]: groupSelections.filter(id => id !== modifierId) };
      }
      if (maxSelections && groupSelections.length >= maxSelections) {
        return prev; // Ignore if max reached
      }
      return { ...prev, [groupId]: [...groupSelections, modifierId] };
    });
  };

  const calculateTotal = () => {
    let total = product.base_price_minor;
    if (selectedVariant) {
      const v = product.variants?.find((x: any) => x.id === selectedVariant);
      if (v) total = v.price_minor;
    }
    
    product.modifier_groups?.forEach((g: any) => {
      const groupSelections = selectedModifiers[g.modifier_group.id] || [];
      groupSelections.forEach((modId) => {
        const mod = g.modifier_group.modifiers.find((m: any) => m.id === modId);
        if (mod) total += mod.price_delta_minor;
      });
    });
    
    return (total / 100).toFixed(2);
  };

  return (
    <div className="flex flex-col h-full bg-white relative pb-24">
      {product.variants?.length > 0 && (
        <section className="p-4 border-b">
          <h3 className="font-bold text-lg mb-3">Size & Options</h3>
          <div className="space-y-2">
            {product.variants.map((variant: any) => (
              <label key={variant.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="variant" 
                    checked={selectedVariant === variant.id}
                    onChange={() => setSelectedVariant(variant.id)}
                    className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300"
                  />
                  <span className="font-medium text-gray-900">{variant.name}</span>
                </div>
                <span className="text-gray-600">{product.currency_code} {(variant.price_minor / 100).toFixed(2)}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {product.modifier_groups?.map((g: any) => {
        const group = g.modifier_group;
        const selections = selectedModifiers[group.id] || [];
        const isRequired = group.min_selections > 0;
        
        return (
          <section key={group.id} className="p-4 border-b">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-lg">{group.name}</h3>
              {isRequired && <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-700">Required</span>}
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Choose up to {group.max_selections}
            </p>
            
            <div className="space-y-2">
              {group.modifiers.map((modifier: any) => (
                <label key={modifier.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={selections.includes(modifier.id)}
                      onChange={() => handleModifierToggle(group.id, modifier.id, group.max_selections)}
                      disabled={!selections.includes(modifier.id) && group.max_selections && selections.length >= group.max_selections}
                      className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                    <span className="font-medium text-gray-900">{modifier.name}</span>
                  </div>
                  {modifier.price_delta_minor > 0 && (
                    <span className="text-gray-600">+{product.currency_code} {(modifier.price_delta_minor / 100).toFixed(2)}</span>
                  )}
                </label>
              ))}
            </div>
          </section>
        );
      })}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-4 md:static md:mt-4 md:border-none">
        <div className="flex items-center justify-center bg-gray-100 rounded-lg px-4 gap-4">
          <button className="text-xl font-bold w-8">-</button>
          <span className="font-medium">1</span>
          <button className="text-xl font-bold w-8">+</button>
        </div>
        <Button variant="primary" className="flex-1 justify-between text-lg py-6 rounded-xl">
          <span>Add to Order</span>
          <span>{product.currency_code} {calculateTotal()}</span>
        </Button>
      </div>
    </div>
  );
}
