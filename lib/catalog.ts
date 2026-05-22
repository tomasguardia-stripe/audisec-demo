// Full product catalog for GlobalSuite Solutions / Audisec
// All amounts in cents (EUR or USD as noted)

export interface ProductDef {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PriceDef {
  productKey: string;
  unit_amount: number;
  currency: 'eur' | 'usd';
  recurring?: {
    interval: 'month' | 'year';
    interval_count?: number;
  };
  nickname?: string;
}

export interface CustomerDef {
  name: string;
  email: string;
  metadata: Record<string, string>;
  address: {
    country: string;
    city?: string;
    line1?: string;
    postal_code?: string;
  };
  preferred_locales: string[];
  tax_id?: { type: string; value: string };
  invoice_settings?: {
    custom_fields: { name: string; value: string }[];
  };
}

// ─── PRODUCTS ─────────────────────────────────────────────────

export const products: Record<string, ProductDef> = {
  // Base License — one product, multiple tier prices (Core/Enterprise/Plus)
  // This is the correct architecture for Good-Better-Best pricing in Stripe:
  // one product = what you sell, prices = tier levels.
  // Enables self-serve upgrades via Customer Portal.
  license: {
    name: 'GlobalSuite',
    description: 'Plataforma GRC — licencia base (Core, Enterprise, Plus)',
    metadata: { category: 'license' },
  },

  // Modules
  mod_risk: {
    name: 'Risk Management',
    description: 'Módulo de gestión de riesgos',
    metadata: { category: 'module' },
  },
  mod_compliance: {
    name: 'Compliance & Security Management',
    description: 'Módulo de cumplimiento y seguridad',
    metadata: { category: 'module' },
  },
  mod_privacy: {
    name: 'Privacy Management',
    description: 'Módulo de privacidad',
    metadata: { category: 'module' },
  },
  mod_continuity: {
    name: 'Business Continuity Management',
    description: 'Módulo de continuidad de negocio',
    metadata: { category: 'module' },
  },
  mod_audit: {
    name: 'Audit Management',
    description: 'Módulo de auditoría',
    metadata: { category: 'module' },
  },
  mod_vendor: {
    name: 'Vendor Management',
    description: 'Módulo de gestión de proveedores',
    metadata: { category: 'module' },
  },
  mod_esg: {
    name: 'ESG Management',
    description: 'Módulo de ESG',
    metadata: { category: 'module' },
  },
  mod_ens: {
    name: 'ENS Management',
    description: 'Módulo de Esquema Nacional de Seguridad',
    metadata: { category: 'module' },
  },
  mod_ia: {
    name: 'IA Governance',
    description: 'Módulo de gobernanza de IA',
    metadata: { category: 'module' },
  },

  // Frameworks
  fw_tier1: {
    name: 'Framework Tier 1 (Standard)',
    description: 'Marco normativo estándar (ej: ISO 27001)',
    metadata: { category: 'framework', tier: '1' },
  },
  fw_tier2: {
    name: 'Framework Tier 2 (Advanced)',
    description: 'Marco normativo avanzado (ej: GDPR)',
    metadata: { category: 'framework', tier: '2' },
  },

  // Multitenant — one product, tier prices (same pattern as base license)
  mt_license: {
    name: 'GlobalSuite Multitenant',
    description: 'Plataforma GRC multitenant para partners (Core, Enterprise, Plus)',
    metadata: { category: 'multitenant' },
  },
  mt_entity: {
    name: 'Add-On Entidad Multitenant',
    description: 'Entidad adicional multitenant (mensual)',
    metadata: { category: 'multitenant', type: 'addon' },
  },

  // Add-Ons
  addon_users: {
    name: 'Add-On 10 Usuarios',
    description: 'Paquete de 10 usuarios adicionales',
    metadata: { category: 'addon' },
  },
  addon_connector: {
    name: 'Add-On Conector Tier 1',
    description: 'Conector de integración estándar',
    metadata: { category: 'addon' },
  },
  addon_storage: {
    name: 'Add-On Almacenamiento 100GB',
    description: '100GB de almacenamiento adicional',
    metadata: { category: 'addon' },
  },

  // Services
  services: {
    name: 'Servicios Profesionales',
    description: 'Servicios de implantación, formación, consultoría',
    metadata: { category: 'services' },
  },

  // Multi-year ramp (Contract 3 specific)
  plus_ramp: {
    name: 'GlobalSuite Plus (Plurianual)',
    description: 'Licencia Plus con precios escalonados por año',
    metadata: { category: 'license', tier: 'plus', contract_type: 'multiyear' },
  },
};

// ─── PRICES ─────────────────────────────────────────────────

export const prices: Record<string, PriceDef> = {
  // Base License tiers - Annual EUR (all on same product)
  core_annual: {
    productKey: 'license',
    unit_amount: 430000, // 4,300 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Core - Anual EUR',
  },
  enterprise_annual: {
    productKey: 'license',
    unit_amount: 840000, // 8,400 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Enterprise - Anual EUR',
  },
  plus_annual: {
    productKey: 'license',
    unit_amount: 1680000, // 16,800 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Plus - Anual EUR',
  },

  // Modules - Annual EUR
  mod_risk_annual: {
    productKey: 'mod_risk',
    unit_amount: 420000, // 4,200 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Risk Management - Anual',
  },
  mod_compliance_annual: {
    productKey: 'mod_compliance',
    unit_amount: 110000, // 1,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Compliance & Security - Anual',
  },
  mod_privacy_annual: {
    productKey: 'mod_privacy',
    unit_amount: 110000, // 1,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Privacy Management - Anual',
  },
  mod_continuity_annual: {
    productKey: 'mod_continuity',
    unit_amount: 840000, // 8,400 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Business Continuity - Anual',
  },
  mod_audit_annual: {
    productKey: 'mod_audit',
    unit_amount: 1050000, // 10,500 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Audit Management - Anual',
  },
  mod_vendor_annual: {
    productKey: 'mod_vendor',
    unit_amount: 320000, // 3,200 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Vendor Management - Anual',
  },
  mod_esg_annual: {
    productKey: 'mod_esg',
    unit_amount: 110000, // 1,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'ESG Management - Anual',
  },
  mod_ens_annual: {
    productKey: 'mod_ens',
    unit_amount: 110000, // 1,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'ENS Management - Anual',
  },
  mod_ia_annual: {
    productKey: 'mod_ia',
    unit_amount: 110000, // 1,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'IA Governance - Anual',
  },

  // Frameworks - Annual EUR
  fw_tier1_annual: {
    productKey: 'fw_tier1',
    unit_amount: 110000, // 1,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Framework Tier 1 - Anual',
  },
  fw_tier2_annual: {
    productKey: 'fw_tier2',
    unit_amount: 210000, // 2,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Framework Tier 2 - Anual',
  },

  // Multitenant tier prices - Monthly EUR (all on same product)
  mt_core_monthly_eur: {
    productKey: 'mt_license',
    unit_amount: 134750, // 1,347.50 EUR (14,700/12 * 1.10)
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Multitenant Core - Mensual EUR',
  },
  mt_enterprise_monthly_eur: {
    productKey: 'mt_license',
    unit_amount: 265833, // 2,658.33 EUR (29,000/12 * 1.10)
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Multitenant Enterprise - Mensual EUR',
  },
  mt_plus_monthly_eur: {
    productKey: 'mt_license',
    unit_amount: 403333, // 4,033.33 EUR (44,000/12 * 1.10)
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Multitenant Plus - Mensual EUR',
  },
  mt_entity_monthly_eur: {
    productKey: 'mt_entity',
    unit_amount: 28417, // 284.17 EUR (3,100/12 * 1.10)
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Entidad Multitenant - Mensual EUR',
  },

  // Multitenant tier prices - Monthly USD (all on same product)
  mt_core_monthly_usd: {
    productKey: 'mt_license',
    unit_amount: 134750, // 1,347.50 USD
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Multitenant Core - Mensual USD',
  },
  mt_enterprise_monthly_usd: {
    productKey: 'mt_license',
    unit_amount: 265833, // 2,658.33 USD
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Multitenant Enterprise - Mensual USD',
  },
  mt_plus_monthly_usd: {
    productKey: 'mt_license',
    unit_amount: 403333, // 4,033.33 USD
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Multitenant Plus - Mensual USD',
  },
  mt_entity_monthly_usd: {
    productKey: 'mt_entity',
    unit_amount: 28417, // 284.17 USD
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Entidad Multitenant - Mensual USD',
  },

  // Add-Ons - Annual EUR
  addon_users_annual: {
    productKey: 'addon_users',
    unit_amount: 210000, // 2,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Add-On 10 Usuarios - Anual',
  },
  addon_connector_annual: {
    productKey: 'addon_connector',
    unit_amount: 110000, // 1,100 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Add-On Conector - Anual',
  },
  addon_storage_annual: {
    productKey: 'addon_storage',
    unit_amount: 50000, // 500 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Add-On Almacenamiento 100GB - Anual',
  },

  // Multi-year ramp prices (Contract 3) - Annual EUR
  plus_year1: {
    productKey: 'plus_ramp',
    unit_amount: 2500000, // 25,000 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Plus Plurianual - Año 1',
  },
  plus_year2: {
    productKey: 'plus_ramp',
    unit_amount: 3200000, // 32,000 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Plus Plurianual - Año 2',
  },
  plus_year3: {
    productKey: 'plus_ramp',
    unit_amount: 3800000, // 38,000 EUR
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Plus Plurianual - Año 3',
  },

  // Services - One-time prices (for Checkout Sessions and invoice items)
  svc_implantacion: {
    productKey: 'services',
    unit_amount: 500000, // 5,000 EUR
    currency: 'eur',
    nickname: 'Implantación y configuración',
  },
  svc_formacion: {
    productKey: 'services',
    unit_amount: 200000, // 2,000 EUR
    currency: 'eur',
    nickname: 'Formación equipo compliance',
  },
};

// ─── CUSTOMERS ────────────────────────────────────────────────

export const customers: Record<string, CustomerDef> = {
  contract1: {
    name: 'Banco Regulado Español S.A.',
    email: 'compliance@bancoregulado.example.com',
    metadata: {
      crm_code: 'CRM-ES-001',
      segment: 'enterprise',
      country: 'ES',
      plan: 'enterprise',
      partner_type: 'direct',
    },
    address: {
      country: 'ES',
      city: 'Madrid',
      line1: 'Paseo de la Castellana 100',
      postal_code: '28046',
    },
    preferred_locales: ['es'],
    tax_id: { type: 'es_cif', value: 'A12345678' },
    invoice_settings: {
      custom_fields: [
        { name: 'N. Contrato', value: 'GS-2026-ENT-001' },
        { name: 'Centro de coste', value: 'CC-COMPLIANCE-01' },
        { name: 'PO Number', value: 'PO-2026-0042' },
      ],
    },
  },
  contract2: {
    name: 'PartnerTech LATAM S.A. de C.V.',
    email: 'billing@partnertech-latam.example.com',
    metadata: {
      crm_code: 'CRM-MX-002',
      segment: 'partner',
      country: 'MX',
      plan: 'multitenant_enterprise',
      partner_type: 'multitenant',
    },
    address: {
      country: 'MX',
      city: 'Ciudad de México',
      line1: 'Av. Reforma 222',
      postal_code: '06600',
    },
    preferred_locales: ['es'],
    invoice_settings: {
      custom_fields: [
        { name: 'N. Contrato', value: 'GS-2026-MT-002' },
        { name: 'Partner ID', value: 'PTR-LATAM-005' },
      ],
    },
  },
  contract3: {
    name: 'EuroCompliance GmbH',
    email: 'procurement@eurocompliance.example.com',
    metadata: {
      crm_code: 'CRM-DE-003',
      segment: 'enterprise',
      country: 'DE',
      plan: 'plus_multiyear',
      partner_type: 'direct',
    },
    address: {
      country: 'DE',
      city: 'Frankfurt',
      line1: 'Mainzer Landstraße 50',
      postal_code: '60325',
    },
    preferred_locales: ['en'],
    tax_id: { type: 'eu_vat', value: 'DE123456789' },
    invoice_settings: {
      custom_fields: [
        { name: 'Contract Ref', value: 'GS-2026-PLU-003' },
        { name: 'PO Number', value: 'PO-EC-2026-119' },
      ],
    },
  },
  contract4: {
    name: 'AuditPartners Iberia S.L.',
    email: 'facturacion@auditpartners.example.com',
    metadata: {
      crm_code: 'CRM-ES-004',
      segment: 'partner',
      country: 'ES',
      plan: 'enterprise',
      partner_type: 'indirect',
      end_client_name: 'Hospital Universitario Central',
      end_client_cif: 'Q2800001J',
      end_client_country: 'ES',
      end_client_sector: 'healthcare',
    },
    address: {
      country: 'ES',
      city: 'Barcelona',
      line1: 'Av. Diagonal 450',
      postal_code: '08006',
    },
    preferred_locales: ['es'],
    tax_id: { type: 'es_cif', value: 'B87654321' },
    invoice_settings: {
      custom_fields: [
        { name: 'N. Contrato', value: 'GS-2026-PTR-004' },
        { name: 'Cliente final', value: 'Hospital Universitario Central' },
        { name: 'CIF cliente final', value: 'Q2800001J' },
        { name: 'PO Number', value: 'PO-AP-2026-033' },
      ],
    },
  },
};

// ─── TAX RATES ────────────────────────────────────────────────

export const taxRates = {
  iva_21: {
    display_name: 'IVA',
    percentage: 21,
    inclusive: false,
    country: 'ES',
    description: 'IVA España 21%',
  },
  reverse_charge: {
    display_name: 'VAT Reverse Charge',
    percentage: 0,
    inclusive: false,
    country: 'DE',
    description: 'EU B2B - Inversión del sujeto pasivo',
  },
  exempt: {
    display_name: 'Tax Exempt',
    percentage: 0,
    inclusive: false,
    country: 'MX',
    description: 'LATAM - Exento / No aplica',
  },
};

// ─── COUPONS ──────────────────────────────────────────────────

export const coupons = {
  first_year_15: {
    name: '15% primer año',
    percent_off: 15,
    duration: 'repeating' as const,
    duration_in_months: 12,
  },
  loyalty_10: {
    name: '10% fidelidad',
    percent_off: 10,
    duration: 'forever' as const,
  },
  flat_500: {
    name: 'Descuento 500 EUR',
    amount_off: 50000, // 500 EUR in cents
    currency: 'eur',
    duration: 'once' as const,
  },
};
