import { ApprovedPlan, CreativeCheck, GovernanceRule, Violation } from "./types";

export const seedRules: GovernanceRule[] = [
  {
    id: "r1", name: "Approved geo targeting only",
    description: "Campaigns may only target cities from the approved media plan.",
    category: "setup", platforms: ["Amazon", "Flipkart", "BlinkIt", "Zepto", "Instamart"],
    campaignTypes: ["Sponsored Products", "Sponsored Brand", "DSP"],
    severity: "critical", enabled: true, actionOnViolation: "review",
    config: { allowedCities: "Mumbai, Delhi, Bangalore, Hyderabad, Pune, Chennai" },
  },
  {
    id: "r2", name: "Frequency cap ceiling",
    description: "Frequency cap must not exceed 5 impressions / user / day.",
    category: "setup", platforms: ["Amazon", "Flipkart"], campaignTypes: ["DSP"],
    severity: "warning", enabled: true, actionOnViolation: "flag",
    config: { maxFrequency: "5 per user per day" },
  },
  {
    id: "r3", name: "Tracking parameter required",
    description: "All campaign URLs must include utm_source, utm_medium, utm_campaign.",
    category: "setup", platforms: ["Amazon", "Flipkart", "BlinkIt", "Zepto", "Instamart"],
    campaignTypes: ["Sponsored Products", "Sponsored Brand"],
    severity: "critical", enabled: true, actionOnViolation: "auto_pause",
    config: { requiredParams: "utm_source, utm_medium, utm_campaign" },
  },
  {
    id: "r4", name: "Allowed placements",
    description: "Only approved placements may be used.",
    category: "setup", platforms: ["Amazon"], campaignTypes: ["Sponsored Brand"],
    severity: "warning", enabled: true, actionOnViolation: "review",
    config: { allowedPlacements: "Search Top, Category, Brand Shelf" },
  },
  {
    id: "r5", name: "Naming convention",
    description: "Campaign names must follow Brand_Platform_Objective_YYYYMM.",
    category: "setup", platforms: ["Amazon", "Flipkart", "BlinkIt"], campaignTypes: ["All"],
    severity: "info", enabled: true, actionOnViolation: "flag",
    config: { pattern: "^[A-Z]+_[A-Z]+_[A-Z]+_\\d{6}$" },
  },
  {
    id: "r6", name: "Approved creative version",
    description: "Only the latest approved asset version may be served.",
    category: "creative", platforms: ["Amazon", "Flipkart"], campaignTypes: ["All"],
    severity: "critical", enabled: true, actionOnViolation: "review",
    config: { requireVersion: "Latest approved" },
  },
  {
    id: "r7", name: "Allowed landing page domains",
    description: "Landing pages must point to approved brand domains.",
    category: "creative", platforms: ["Amazon", "Flipkart", "BlinkIt", "Zepto", "Instamart"],
    campaignTypes: ["All"], severity: "critical", enabled: true, actionOnViolation: "auto_pause",
    config: { allowedDomains: "brand.com, amazon.in/brand, flipkart.com/brand" },
  },
  {
    id: "r8", name: "Required CTA",
    description: "Creative CTA must match the approved CTA in the media plan.",
    category: "creative", platforms: ["Amazon", "Flipkart"], campaignTypes: ["Sponsored Brand"],
    severity: "warning", enabled: true, actionOnViolation: "flag",
    config: { requiredCTA: "Shop Now / Buy Now" },
  },
];

export const seedPlans: ApprovedPlan[] = [
  {
    id: "p1", campaign: "BISCUIT_AMZN_AWARENESS_202607", platform: "Amazon",
    objective: "Awareness", audience: "Snack Buyers 25-45",
    geo: ["Mumbai", "Delhi", "Bangalore"], frequencyCap: "5/day",
    placements: ["Search Top", "Category"], trackingParams: "utm_source=amazon&utm_medium=cpc&utm_campaign=awareness",
    dailyBudget: 12000, startDate: "2026-06-01", endDate: "2026-07-31",
    approvedBy: "M. Sharma", status: "approved",
  },
  {
    id: "p2", campaign: "BISCUIT_FLPK_CONSIDERATION_202607", platform: "Flipkart",
    objective: "Consideration", audience: "Repeat shoppers",
    geo: ["Mumbai", "Pune", "Hyderabad"], frequencyCap: "4/day",
    placements: ["Brand Shelf", "Home Carousel"], trackingParams: "utm_source=flipkart&utm_medium=cpc&utm_campaign=consider",
    dailyBudget: 9500, startDate: "2026-06-15", endDate: "2026-07-31",
    approvedBy: "R. Iyer", status: "approved",
  },
  {
    id: "p3", campaign: "CREATINE_BLNK_CONVERSION_202607", platform: "BlinkIt",
    objective: "Conversion", audience: "Fitness 18-35",
    geo: ["Bangalore", "Hyderabad", "Mumbai"], frequencyCap: "6/day",
    placements: ["Category", "Search Top"], trackingParams: "utm_source=blinkit&utm_medium=cpc&utm_campaign=convert",
    dailyBudget: 8000, startDate: "2026-06-10", endDate: "2026-07-15",
    approvedBy: "S. Kapoor", status: "approved",
  },
  {
    id: "p4", campaign: "COOKIES_ZEPTO_CONVERSION_202607", platform: "Zepto",
    objective: "Conversion", audience: "Q-Commerce repeat",
    geo: ["Mumbai", "Delhi"], frequencyCap: "5/day",
    placements: ["Category"], trackingParams: "utm_source=zepto&utm_medium=cpc&utm_campaign=convert",
    dailyBudget: 6000, startDate: "2026-06-20", endDate: "2026-07-20",
    approvedBy: "M. Sharma", status: "approved",
  },
];

export const seedViolations: Violation[] = [
  {
    id: "v1", campaign: "BISCUIT_AMZN_AWARENESS_202607", platform: "Amazon",
    rule: "Approved geo targeting only", field: "Geo",
    approved: "Mumbai, Delhi, Bangalore", live: "Mumbai, Delhi, Bangalore, Kolkata, Ahmedabad",
    severity: "critical", status: "open", detectedAt: "2026-06-29 09:14",
  },
  {
    id: "v2", campaign: "BISCUIT_FLPK_CONSIDERATION_202607", platform: "Flipkart",
    rule: "Tracking parameter required", field: "Tracking params",
    approved: "utm_source, utm_medium, utm_campaign", live: "utm_source, utm_medium (missing utm_campaign)",
    severity: "critical", status: "open", detectedAt: "2026-06-30 04:02",
  },
  {
    id: "v3", campaign: "CREATINE_BLNK_CONVERSION_202607", platform: "BlinkIt",
    rule: "Frequency cap ceiling", field: "Frequency cap",
    approved: "6/day", live: "9/day", severity: "warning", status: "open",
    detectedAt: "2026-06-30 03:45",
  },
  {
    id: "v4", campaign: "COOKIES_ZEPTO_CONVERSION_202607", platform: "Zepto",
    rule: "Allowed placements", field: "Placements",
    approved: "Category", live: "Category, Home Carousel",
    severity: "warning", status: "pause_requested", detectedAt: "2026-06-29 18:21",
  },
  {
    id: "v5", campaign: "biscuit_amzn_summer", platform: "Amazon",
    rule: "Naming convention", field: "Campaign name",
    approved: "BRAND_PLATFORM_OBJECTIVE_YYYYMM", live: "biscuit_amzn_summer",
    severity: "info", status: "open", detectedAt: "2026-06-28 11:00",
  },
  {
    id: "v6", campaign: "BISCUIT_AMZN_AWARENESS_202607", platform: "Amazon",
    rule: "Approved creative version", field: "Asset version",
    approved: "v3.2 (approved 2026-06-15)", live: "v2.1",
    severity: "critical", status: "fix_requested", detectedAt: "2026-06-27 14:30",
  },
  {
    id: "v7", campaign: "BISCUIT_FLPK_CONSIDERATION_202607", platform: "Flipkart",
    rule: "Allowed landing page domains", field: "Landing page",
    approved: "flipkart.com/brand", live: "flipkart.com/promo-2024-old",
    severity: "critical", status: "waived", detectedAt: "2026-06-26 10:15",
    note: "Temporary landing page approved by brand team for 7 days.",
  },
  {
    id: "v8", campaign: "CREATINE_BLNK_CONVERSION_202607", platform: "BlinkIt",
    rule: "Required CTA", field: "CTA",
    approved: "Shop Now", live: "Learn More",
    severity: "warning", status: "open", detectedAt: "2026-06-30 01:10",
  },
  {
    id: "v9", campaign: "COOKIES_ZEPTO_CONVERSION_202607", platform: "Zepto",
    rule: "Approved geo targeting only", field: "Geo",
    approved: "Mumbai, Delhi", live: "Mumbai, Delhi, Jaipur",
    severity: "critical", status: "open", detectedAt: "2026-06-29 22:00",
  },
  {
    id: "v10", campaign: "BISCUIT_AMZN_AWARENESS_202607", platform: "Amazon",
    rule: "Objective mismatch", field: "Objective",
    approved: "Awareness", live: "Conversion",
    severity: "warning", status: "open", detectedAt: "2026-06-28 08:00",
  },
];

export const seedCreatives: CreativeCheck[] = [
  {
    id: "c1", publisher: "Amazon", sku: "BISC-001", productName: "Cream Biscuits 250g",
    approvedAssetVersion: "v3.2", servedAssetVersion: "v3.2",
    approvedLandingPage: "amazon.in/brand/bisc-001", servedLandingPage: "amazon.in/brand/bisc-001",
    approvedCTA: "Shop Now", servedCTA: "Shop Now",
    status: "ok", mismatchTypes: [],
  },
  {
    id: "c2", publisher: "Amazon", sku: "BISC-002", productName: "Choco Cookies 200g",
    approvedAssetVersion: "v3.2", servedAssetVersion: "v2.1",
    approvedLandingPage: "amazon.in/brand/bisc-002", servedLandingPage: "amazon.in/brand/bisc-002",
    approvedCTA: "Shop Now", servedCTA: "Shop Now",
    status: "mismatch", mismatchTypes: ["asset"],
  },
  {
    id: "c3", publisher: "Flipkart", sku: "BISC-002", productName: "Choco Cookies 200g",
    approvedAssetVersion: "v3.2", servedAssetVersion: "v3.2",
    approvedLandingPage: "flipkart.com/brand/cookies", servedLandingPage: "flipkart.com/promo-2024-old",
    approvedCTA: "Buy Now", servedCTA: "Buy Now",
    status: "mismatch", mismatchTypes: ["landing_page"],
  },
  {
    id: "c4", publisher: "Flipkart", sku: "CRTN-010", productName: "Creatine 250g",
    approvedAssetVersion: "v1.4", servedAssetVersion: "v1.2",
    approvedLandingPage: "flipkart.com/brand/creatine", servedLandingPage: "flipkart.com/brand/creatine",
    approvedCTA: "Shop Now", servedCTA: "Learn More",
    status: "mismatch", mismatchTypes: ["asset", "cta"],
  },
  {
    id: "c5", publisher: "BlinkIt", sku: "CRTN-010", productName: "Creatine 250g",
    approvedAssetVersion: "v1.4", servedAssetVersion: "—",
    approvedLandingPage: "blinkit.com/brand/creatine", servedLandingPage: "—",
    approvedCTA: "Shop Now", servedCTA: "—",
    status: "missing", mismatchTypes: ["asset", "landing_page", "cta"],
  },
  {
    id: "c6", publisher: "Zepto", sku: "BISC-001", productName: "Cream Biscuits 250g",
    approvedAssetVersion: "v3.2", servedAssetVersion: "v3.2",
    approvedLandingPage: "zepto.com/brand/biscuits", servedLandingPage: "zepto.com/brand/biscuits",
    approvedCTA: "Buy Now", servedCTA: "Order Now",
    status: "mismatch", mismatchTypes: ["cta"],
  },
  {
    id: "c7", publisher: "Instamart", sku: "BISC-002", productName: "Choco Cookies 200g",
    approvedAssetVersion: "v3.2", servedAssetVersion: "v3.2",
    approvedLandingPage: "instamart.com/brand/cookies", servedLandingPage: "instamart.com/brand/cookies",
    approvedCTA: "Shop Now", servedCTA: "Shop Now",
    status: "ok", mismatchTypes: [],
  },
];
