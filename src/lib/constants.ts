export const ORDER_STATUS = {
  PENDING: "PENDING",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatusType, string> = {
  PENDING: "Pendiente",
  PAYMENT_RECEIVED: "Pago recibido",
  CONFIRMED: "Confirmado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatusType, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAYMENT_RECEIVED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PREPARING: "bg-emerald-100 text-emerald-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  EXPIRED: "bg-red-50 text-red-600",
};

export const VALID_STATUS_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  PENDING: ["PAYMENT_RECEIVED", "CANCELLED", "EXPIRED"],
  PAYMENT_RECEIVED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export const DELIVERY_METHODS = {
  SHIPPING: "SHIPPING",
  PICKUP: "PICKUP",
} as const;

export type DeliveryMethodType = (typeof DELIVERY_METHODS)[keyof typeof DELIVERY_METHODS];

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethodType, string> = {
  SHIPPING: "Envío a domicilio",
  PICKUP: "Retiro en punto de entrega",
};

export const PRODUCT_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type ProductStatusType = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const PRODUCT_STATUS_LABELS: Record<ProductStatusType, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  ARCHIVED: "Archivado",
};

export const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

export const RESERVATION_EXPIRY_HOURS = 48;

export const ITEMS_PER_PAGE = 12;

export const COMMON_SHOE_SIZES = [
  "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46",
];

export const COMMON_CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const SITE_SETTINGS_KEYS = {
  BANK_NAME: "bank_name",
  BANK_HOLDER: "bank_holder",
  BANK_CBU: "bank_cbu",
  BANK_ALIAS: "bank_alias",
  BANK_ACCOUNT_TYPE: "bank_account_type",
  BANK_INSTRUCTIONS: "bank_instructions",
  COMPANY_NAME: "company_name",
  COMPANY_EMAIL: "company_email",
  COMPANY_PHONE: "company_phone",
  COMPANY_ADDRESS: "company_address",
  COMPANY_CUIT: "company_cuit",
  INSTAGRAM_URL: "instagram_url",
  TIKTOK_URL: "tiktok_url",
  WHATSAPP_NUMBER: "whatsapp_number",
  EMAIL_SENDER_NAME: "email_sender_name",
  EMAIL_SENDER_ADDRESS: "email_sender_address",
} as const;
