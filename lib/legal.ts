/** Public operator details, read on the server at build time for the static site. */
export const LEGAL_VERSION = "2026-09-27";
export const LEGAL_REVISION_LABEL = "27 сентября 2026 года";

export const legalOperator = {
  name: process.env.PERSONAL_DATA_OPERATOR_NAME?.trim() || "",
  address: process.env.PERSONAL_DATA_OPERATOR_ADDRESS?.trim() || "",
  inn: process.env.PERSONAL_DATA_OPERATOR_INN?.trim() || "",
  email: process.env.PERSONAL_DATA_CONTACT_EMAIL?.trim() || "",
} as const;

export const legalProcessor = {
  name: process.env.PERSONAL_DATA_PROCESSOR_NAME?.trim() || "",
  address: process.env.PERSONAL_DATA_PROCESSOR_ADDRESS?.trim() || "",
} as const;

// A brand name alone does not identify the person receiving personal data.
// Infrastructure, RKN notification and actual data handling still need verification.
export const isLegalConfigured = Boolean(legalOperator.name && legalOperator.address);
