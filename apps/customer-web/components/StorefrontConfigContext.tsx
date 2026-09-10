'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  status: string;
  phone: string | null;
  address_line: string;
  city: string;
  timezone: string;
  accepts_delivery: boolean;
  accepts_pickup: boolean;
  min_order_minor?: number | null;
  default_delivery_fee_minor?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface StorefrontSettings {
  restaurant_display_name?: string;
  support_phone?: string;
  support_email?: string;
  order_prefix?: string;
  theme_json?: {
    primary_color?: string;
    secondary_color?: string;
    brand_name?: string;
    tagline?: string;
    hotline?: string;
    logo_url?: string;
    footer_text?: string;
    copyright?: string;
    google_maps_api_key?: string;
    delivery_hours?: {
      open?: string;
      close?: string;
      is_accepting_orders?: boolean;
      closed_message?: string;
    };
    social_links?: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
    };
  };
}

export interface DeliveryHoursInfo {
  open: string;
  close: string;
  isAcceptingOrders: boolean;
  isOpen: boolean;
  timingDisplay: string;
  closedMessage: string;
}

export interface StorefrontConfig {
  tenant?: {
    id: string;
    name: string;
    default_currency: string;
  };
  settings?: StorefrontSettings;
  features?: Record<string, boolean>;
}

interface StorefrontContextType {
  config: StorefrontConfig;
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  isLoading: boolean;
  isDeliveryOpen: boolean;
  deliveryHoursInfo: DeliveryHoursInfo;
  refreshConfig: () => Promise<void>;
}

const DEFAULT_CONFIG: StorefrontConfig = {
  tenant: {
    id: 'default',
    name: 'Cheezious',
    default_currency: 'PKR',
  },
  settings: {
    restaurant_display_name: 'Cheezious',
    support_phone: '051 111 446 699',
    support_email: 'support@cheezious.com',
    order_prefix: 'CHZ',
    theme_json: {
      primary_color: '#F15B25',
      secondary_color: '#FFC107',
      brand_name: 'Cheezious',
      tagline: 'World of Flavors & Cheezy Treats',
      hotline: '051 111 446 699',
      logo_url: 'https://cheezious.com/cheezious.svg',
      footer_text: 'Cheezious is one of the fastest-growing food chains in Pakistan, delivering oven-fresh pizzas, crunchy bazinga burgers, and cheesy delights across twin cities and beyond.',
      copyright: '© 2026 Cheezious Pakistan. All Rights Reserved.',
      social_links: {
        facebook: 'https://facebook.com/cheezious',
        instagram: 'https://instagram.com/cheeziouspakistan',
        tiktok: 'https://tiktok.com/@cheezious_pk',
      },
    },
  },
  features: {},
};

function computeDeliveryHours(themeJson?: any): DeliveryHoursInfo {
  const dh = themeJson?.delivery_hours || {};
  const open = dh.open || '11:00';
  const close = dh.close || '03:00';
  const isAcceptingOrders = dh.is_accepting_orders !== false;
  const closedMessage =
    dh.closed_message ||
    `We are currently closed for online delivery. Delivery hours are ${open} to ${close}.`;

  const formatTime12h = (timeStr: string) => {
    const parts = timeStr.split(':');
    const h = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    if (isNaN(h)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = isNaN(m) ? '00' : String(m).padStart(2, '0');
    return `${displayH}:${displayM} ${period}`;
  };

  const timingDisplay = `${formatTime12h(open)} - ${formatTime12h(close)}`;

  if (!isAcceptingOrders) {
    return {
      open,
      close,
      isAcceptingOrders: false,
      isOpen: false,
      timingDisplay,
      closedMessage,
    };
  }

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const hourStr = parts.find((p) => p.type === 'hour')?.value || '12';
    const minStr = parts.find((p) => p.type === 'minute')?.value || '00';
    const currentMin = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);

    const openParts = open.split(':');
    const openH = parseInt(openParts[0] || '11', 10);
    const openM = parseInt(openParts[1] || '0', 10);

    const closeParts = close.split(':');
    const closeH = parseInt(closeParts[0] || '3', 10);
    const closeM = parseInt(closeParts[1] || '0', 10);

    const openMin = (isNaN(openH) ? 11 : openH) * 60 + (isNaN(openM) ? 0 : openM);
    const closeMin = (isNaN(closeH) ? 3 : closeH) * 60 + (isNaN(closeM) ? 0 : closeM);

    let isOpen = false;
    if (closeMin < openMin) {
      isOpen = currentMin >= openMin || currentMin < closeMin;
    } else {
      isOpen = currentMin >= openMin && currentMin < closeMin;
    }

    return {
      open,
      close,
      isAcceptingOrders: true,
      isOpen,
      timingDisplay,
      closedMessage,
    };
  } catch (err) {
    return {
      open,
      close,
      isAcceptingOrders: true,
      isOpen: true,
      timingDisplay,
      closedMessage,
    };
  }
}

const DEFAULT_DELIVERY_HOURS: DeliveryHoursInfo = {
  open: '11:00',
  close: '03:00',
  isAcceptingOrders: true,
  isOpen: true,
  timingDisplay: '11:00 AM - 03:00 AM',
  closedMessage: 'We are currently closed for online delivery.',
};

const StorefrontConfigContext = createContext<StorefrontContextType>({
  config: DEFAULT_CONFIG,
  branches: [],
  selectedBranch: null,
  setSelectedBranch: () => {},
  isLoading: false,
  isDeliveryOpen: true,
  deliveryHoursInfo: DEFAULT_DELIVERY_HOURS,
  refreshConfig: async () => {},
});

export function StorefrontConfigProvider({
  children,
  initialConfig,
  initialBranches,
}: {
  children: ReactNode;
  initialConfig?: StorefrontConfig;
  initialBranches?: Branch[];
}) {
  const [config, setConfig] = useState<StorefrontConfig>(initialConfig || DEFAULT_CONFIG);
  const [branches, setBranches] = useState<Branch[]>(initialBranches || []);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(
    (initialBranches && initialBranches.length > 0) ? (initialBranches[0] ?? null) : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const deliveryHoursInfo = computeDeliveryHours(config.settings?.theme_json);
  const isDeliveryOpen = deliveryHoursInfo.isOpen;

  const fetchLatest = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const [configRes, branchesRes] = await Promise.all([
        fetch(`${apiUrl}/v1/storefront/config`, { cache: 'no-store' }),
        fetch(`${apiUrl}/v1/branches`, { cache: 'no-store' }),
      ]);

      if (configRes.ok) {
        const cData = await configRes.json();
        if (cData && cData.settings) {
          setConfig(cData);
        }
      }

      if (branchesRes.ok) {
        const bData = await branchesRes.json();
        if (Array.isArray(bData) && bData.length > 0) {
          setBranches(bData);
          if (!selectedBranch) {
            setSelectedBranch(bData[0] ?? null);
          }
        }
      }
    } catch (e) {
      console.error('Failed to refresh storefront config:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If not provided from SSR, load on client mount
    if (!initialConfig || !initialBranches || initialBranches.length === 0) {
      fetchLatest();
    }
  }, []);

  return (
    <StorefrontConfigContext.Provider
      value={{
        config,
        branches,
        selectedBranch,
        setSelectedBranch,
        isLoading,
        isDeliveryOpen,
        deliveryHoursInfo,
        refreshConfig: fetchLatest,
      }}
    >
      {children}
    </StorefrontConfigContext.Provider>
  );
}

export function useStorefrontConfig() {
  return useContext(StorefrontConfigContext);
}
