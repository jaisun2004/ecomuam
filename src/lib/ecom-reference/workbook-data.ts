// Auto-extracted from QC_Checks_and_sample_data_Campaign_Creation_1.xlsx
// Do not hand-edit: re-extract from the workbook to update.

export interface RefProduct { name: string; code: string; platform: string }
export interface RefCity { platform: string; platformCity: string; geoCity: string }
export interface RefHistorical { platform: string; name: string; budgetType: string; budgetValue: number; cities: string; productIds: string; targeting: string }
export interface RefSampleRow { subCategory: string; brandName: string; platform: string; campaignName: string; endDate: string; budgetType: string; budgetValue: string; cities: string; productIds: string; targetingDetails: string; currency: string }

export const PRODUCT_LIST: RefProduct[] = [
  {
    "name": "La Shield Fisico Matte Sunscreen Gel (SPF 50+ PA+++)",
    "code": "544531",
    "platform": "Blinkit"
  },
  {
    "name": "Harvest Gold_Brown Bread_400g",
    "code": "636465",
    "platform": "Blinkit"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "628502",
    "platform": "Blinkit"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "537082",
    "platform": "Blinkit"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "724867",
    "platform": "Blinkit"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "681510",
    "platform": "Blinkit"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "531826",
    "platform": "Blinkit"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "671680",
    "platform": "Blinkit"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "544396",
    "platform": "Blinkit"
  },
  {
    "name": "Test Customer_Atta",
    "code": "692063",
    "platform": "Blinkit"
  },
  {
    "name": "Test Customer_Atta",
    "code": "691794",
    "platform": "Blinkit"
  },
  {
    "name": "Test Customer_Atta",
    "code": "333324",
    "platform": "Blinkit"
  },
  {
    "name": "Harvest Gold_Bread",
    "code": "a406d37d-6078-4644-a3da-06ed405cbb46",
    "platform": "Zepto_app"
  },
  {
    "name": "Harvest Gold_Bread",
    "code": "5206d918-f6f8-4021-938c-7fb5aae87000",
    "platform": "Zepto_app"
  },
  {
    "name": "Harvest Gold_Bread",
    "code": "58bd25ce-8f73-4031-96ed-7a1278834d2b",
    "platform": "Zepto_app"
  },
  {
    "name": "HarvestGold-Bread_Bread",
    "code": "2605ed52-9552-49e3-9356-a712a04ec063",
    "platform": "Zepto_app"
  },
  {
    "name": "Test Customer_Atta",
    "code": "6df88314-e3fb-4ed9-88c8-62cb7ba9ff41",
    "platform": "Zepto_app"
  },
  {
    "name": "Harvest Gold_Bread",
    "code": "2SFOFCDG7R_K9SX4RXNDZ",
    "platform": "Instamart_app"
  },
  {
    "name": "Harvest Gold_Bread",
    "code": "ULWGSFZZ7V",
    "platform": "Instamart_app"
  },
  {
    "name": "Modern_Bread",
    "code": "03W7K7LOJU",
    "platform": "Instamart_app"
  },
  {
    "name": "Modern_Bread",
    "code": "3J3PGMJMI3",
    "platform": "Instamart_app"
  },
  {
    "name": "Modern_Bread",
    "code": "7J95B70IOJ",
    "platform": "Instamart_app"
  },
  {
    "name": "Modern_Bread",
    "code": "BQFNZU8T5R",
    "platform": "Instamart_app"
  },
  {
    "name": "Baker's Loaf_Burger Bun_300g",
    "code": "Baker's Loaf_Burger Bun_300g",
    "platform": "Instamart_app"
  },
  {
    "name": "Harvest Gold_Brown Bread_400g",
    "code": "Harvest Gold_Brown Bread_400g",
    "platform": "Instamart_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "ZD09ED5BF1F00885F9AE5Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "ZD20B6B7FC465F13BCCB8Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z7F947A21662CF2738909Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z6D0B3A7346CB02046661Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z3F35507AF63532D77ADDZ-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z98319C15762746873D4FZ-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Perfetti_Chewing Gum",
    "code": "Z7721FBADF89D90A47540Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Perfetti_Chewing Gum",
    "code": "Z1A309CF79181647867C4Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Dabur_Toothpaste_200_gm",
    "code": "Dabur_Toothpaste_200_gm",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Fem_Razors_1_Pcs",
    "code": "Fem_Razors_1_Pcs",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Perfetti_Chewing Gum",
    "code": "62b06a16a16823ea7fa4249e",
    "platform": "talabat_mart_uae"
  },
  {
    "name": "Perfetti_Chewing Gum",
    "code": "62b06a16a16823ea7fa4247a",
    "platform": "talabat_mart_uae"
  },
  {
    "name": "pepsico-snacks_Snacks",
    "code": "talabat_mart_uae_501247",
    "platform": "talabat_mart_uae"
  },
  {
    "name": "pepsico-snacks_Snacks",
    "code": "talabat_mart_uae_904161",
    "platform": "talabat_mart_uae"
  },
  {
    "name": "pepsico-snacks_Snacks",
    "code": "1020818",
    "platform": "carrefour_now_uae"
  },
  {
    "name": "Dabur_Toothpaste_190_gm",
    "code": "amazonae_b004bpipfm",
    "platform": "amazonae"
  },
  {
    "name": "Dabur_Toothpaste_150_gm",
    "code": "amazonae_b07mtrw8tg",
    "platform": "amazonae"
  },
  {
    "name": "Harvest Gold_Bread",
    "code": "f3d4a3f0-53df-40ec-a23a-9cefdf9d52af",
    "platform": "Zepto_app"
  },
  {
    "name": "Harvest Gold_Bread",
    "code": "8dd16b08-eb6d-446f-a5bc-545cefc17171",
    "platform": "Zepto_app"
  },
  {
    "name": "Harvest Gold_Bread",
    "code": "8bb9e6e3-44ba-4099-82f6-828e73ede716",
    "platform": "Zepto_app"
  },
  {
    "name": "com.itc_Bread",
    "code": "Q9DIRH64HU_QD2KHIB4PF",
    "platform": "Instamart_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "ZD59508F8DD2CAD4F4A33Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z2A0C3A3CBBF2A9958147Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z76F917F02E1373CADEB0Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z25CE8E8AC0FE2819F626Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z0F4929E96E28303D8BE5Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "ZE4D633285A9A1B136D80Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "Z2CFF3C9A1CC4EB6C4358Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Yogabar_Nutrition Bar",
    "code": "ZC2819CF1906DEDBA0E33Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Sead_Perfetti_Chewing Gum",
    "code": "Z02478A2622BD355CB188Z-1",
    "platform": "noon_minutes_uae_app"
  },
  {
    "name": "Test Customer_Chewing Gum",
    "code": "62b06a14a16823ea7fa422ca",
    "platform": "talabat_mart_uae"
  },
  {
    "name": "pepsico-snacks_Snacks",
    "code": "carrefour_now_uae_1020818",
    "platform": "carrefour_now_uae"
  },
  {
    "name": "Dabur_Toothpaste_190_gm",
    "code": "Dabur_Toothpaste_190_gm",
    "platform": "amazonae"
  },
  {
    "name": "Dabur_Toothpaste_150_gm",
    "code": "Dabur_Toothpaste_150_gm",
    "platform": "amazonae"
  },
  {
    "name": "Dabur_Toothpaste",
    "code": "B0CMDD2LPV",
    "platform": "amazonae"
  },
  {
    "name": "Dabur_Toothpaste",
    "code": "B005OSR1B4",
    "platform": "amazonae"
  },
  {
    "name": "Dabur_Toothpaste",
    "code": "B0BVQT2Z6D",
    "platform": "amazonae"
  },
  {
    "name": "La Shield Fisico Matte Sunscreen Gel (SPF 50+ PA+++)",
    "code": "La Shield Fisico Matte Sunscreen Gel (SPF 50+ PA+++)",
    "platform": "Blinkit"
  }
];

export const CITY_LIST: RefCity[] = [
  {
    "platform": "Blinkit",
    "platformCity": "Ahmedabad",
    "geoCity": "Ahmedabad"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Bengaluru",
    "geoCity": "Bengaluru"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Delhi",
    "geoCity": "Delhi"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Faridabad",
    "geoCity": "Faridabad"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Ghaziabad",
    "geoCity": "Ghaziabad"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Gurugram",
    "geoCity": "Gurugram"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Jalandhar",
    "geoCity": "Jalandhar"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Kolkata",
    "geoCity": "Kolkata"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Kota",
    "geoCity": "Kota"
  },
  {
    "platform": "Blinkit",
    "platformCity": "New Delhi",
    "geoCity": "New Delhi"
  },
  {
    "platform": "Blinkit",
    "platformCity": "Noida",
    "geoCity": "Noida"
  },
  {
    "platform": "Zepto_app",
    "platformCity": "Bengaluru",
    "geoCity": "Bengaluru"
  },
  {
    "platform": "Zepto_app",
    "platformCity": "Delhi",
    "geoCity": "Delhi"
  },
  {
    "platform": "Zepto_app",
    "platformCity": "Faridabad",
    "geoCity": "Faridabad"
  },
  {
    "platform": "Zepto_app",
    "platformCity": "Gurugram",
    "geoCity": "Gurugram"
  },
  {
    "platform": "Zepto_app",
    "platformCity": "Hyderabad",
    "geoCity": "Hyderabad"
  },
  {
    "platform": "Zepto_app",
    "platformCity": "New Delhi",
    "geoCity": "New Delhi"
  },
  {
    "platform": "Zepto_app",
    "platformCity": "GBuddha Nagar",
    "geoCity": "Noida"
  },
  {
    "platform": "Instamart_app",
    "platformCity": "Ajmer",
    "geoCity": "Ajmer"
  },
  {
    "platform": "Instamart_app",
    "platformCity": "Gurugram",
    "geoCity": "Gurugram"
  },
  {
    "platform": "Instamart_app",
    "platformCity": "New Delhi",
    "geoCity": "New Delhi"
  },
  {
    "platform": "Instamart_app",
    "platformCity": "Noida",
    "geoCity": "Noida"
  },
  {
    "platform": "Instamart_app",
    "platformCity": "Gurgaon",
    "geoCity": "Gurugram"
  },
  {
    "platform": "BigBasket",
    "platformCity": "Noida",
    "geoCity": "Noida"
  },
  {
    "platform": "noon_minutes_uae_app",
    "platformCity": "Al Ain",
    "geoCity": "Al Ain"
  },
  {
    "platform": "noon_minutes_uae_app",
    "platformCity": "Dubai",
    "geoCity": "Dubai"
  },
  {
    "platform": "talabat_mart_uae",
    "platformCity": "ABU DHABI",
    "geoCity": "Abu Dhabi"
  },
  {
    "platform": "carrefour_now_uae",
    "platformCity": "003_DUB_Deira_City_Ctr",
    "geoCity": "Dubai"
  },
  {
    "platform": "amazonae",
    "platformCity": "Dubai",
    "geoCity": "Dubai"
  }
];

export const HISTORICAL_CONFIG: RefHistorical[] = [
  {
    "platform": "Blinkit",
    "name": "na_blinkit_jade_forest_defend_keyword_20260702_mf",
    "budgetType": "daily",
    "budgetValue": 1000.0,
    "cities": "Noida",
    "productIds": "544531",
    "targeting": "bisleri soda:broad:492-541"
  },
  {
    "platform": "Blinkit",
    "name": "na_blinkit_jade_forest_targeted_oos_20260701_mf",
    "budgetType": "daily",
    "budgetValue": 1000.0,
    "cities": "Noida",
    "productIds": "544531",
    "targeting": "bisleri soda:broad:492-541"
  },
  {
    "platform": "Blinkit",
    "name": "na_blinkit_english_oven_targeted_oos_20260703_mf",
    "budgetType": "daily",
    "budgetValue": 492.0,
    "cities": "Noida",
    "productIds": "636465",
    "targeting": "english oven:broad:492"
  },
  {
    "platform": "Blinkit",
    "name": "yoga_bar_blinkit_ritebite_None_20260727_mf",
    "budgetType": "overall",
    "budgetValue": 2626.0,
    "cities": "Noida, Bengaluru",
    "productIds": "628502, 537082",
    "targeting": "ritebite:broad:950"
  },
  {
    "platform": "Instamart_app",
    "name": "na_instamart_jade_forest_targeted_oos_20260701_mf",
    "budgetType": "overall",
    "budgetValue": 1740.0,
    "cities": "Ajmer, Noida",
    "productIds": "03W7K7LOJU, 3J3PGMJMI3",
    "targeting": "jade forest:broad:1740"
  },
  {
    "platform": "Instamart_app",
    "name": "na_instamart_app_britannia_targeted_oos_20260703_mf",
    "budgetType": "daily",
    "budgetValue": 1000.0,
    "cities": "Noida, Gurugram",
    "productIds": "2SFOFCDG7R_K9SX4RXNDZ",
    "targeting": "britannia:broad:1740"
  },
  {
    "platform": "Instamart_app",
    "name": "na_instamart_app_the_health_factory_targeted_oos_20260708_mf",
    "budgetType": "daily",
    "budgetValue": 1000.0,
    "cities": "New Delhi",
    "productIds": "ULWGSFZZ7V",
    "targeting": "the health factory:broad:1740"
  },
  {
    "platform": "Zepto_app",
    "name": "na_zepto_app_britannia_targeted_oos_20260708_mf",
    "budgetType": "daily",
    "budgetValue": 120.0,
    "cities": "New Delhi",
    "productIds": "2605ed52-9552-49e3-9356-a712a04ec063",
    "targeting": "britannia:broad:12"
  },
  {
    "platform": "Zepto_app",
    "name": "na_zepto_app_the_health_factory_targeted_oos_20260703_mf",
    "budgetType": "overall",
    "budgetValue": 4500.0,
    "cities": "Gurugram, Faridabad",
    "productIds": "a406d37d-6078-4644-a3da-06ed405cbb46",
    "targeting": "the health factory:broad:32"
  },
  {
    "platform": "noon_minutes_uae_app",
    "name": "yoga_bar_noon_minutes_uae_app_bugles_None_20260715_mf",
    "budgetType": "daily",
    "budgetValue": 120.0,
    "cities": "Dubai",
    "productIds": "ZD09ED5BF1F00885F9AE5Z-1, ZD20B6B7FC465F13BCCB8Z-1",
    "targeting": "bugles:exact:3"
  },
  {
    "platform": "noon_minutes_uae_app",
    "name": "yoga_bar_noon_minutes_uae_app_mr_krisps_None_20260715_mf",
    "budgetType": "daily",
    "budgetValue": 120.0,
    "cities": "Dubai, Al Ain",
    "productIds": "Z7F947A21662CF2738909Z-1",
    "targeting": "mr krisps:phrase:2.5"
  },
  {
    "platform": "noon_minutes_uae_app",
    "name": "yoga_bar_noon_minutes_uae_app_old_el_paso_None_20260715_mf",
    "budgetType": "overall",
    "budgetValue": 524.0,
    "cities": "Dubai",
    "productIds": "Z6D0B3A7346CB02046661Z-1",
    "targeting": "old el paso:broad:2"
  },
  {
    "platform": "noon_minutes_uae_app",
    "name": "yoga_bar_noon_minutes_uae_app_werther_s_None_20260715_mf",
    "budgetType": "overall",
    "budgetValue": 524.0,
    "cities": "Dubai",
    "productIds": "Z3F35507AF63532D77ADDZ-1",
    "targeting": "werther s:exact:2"
  },
  {
    "platform": "talabat_mart_uae",
    "name": "safari_talabat_mart_uae_talabat_mart_uae_501247_targeted_oos_20260519_mf",
    "budgetType": "daily",
    "budgetValue": 100.0,
    "cities": "ABU DHABI",
    "productIds": "62b06a16a16823ea7fa4249e",
    "targeting": "mint:exact:5;chewing gum:exact:5;gum:exact:5"
  },
  {
    "platform": "amazonae",
    "name": "na_amazonae_nivea_targeted_oos_20260812_mf",
    "budgetType": "daily",
    "budgetValue": 100.0,
    "cities": "Dubai",
    "productIds": "amazonae_b004bpipfm",
    "targeting": "dabur toothpaste:exact:45"
  },
  {
    "platform": "carrefour_now_uae",
    "name": "safari_carrefour_now_uae_jade_forest_targeted_oos_20260518_mf",
    "budgetType": "daily",
    "budgetValue": 120.0,
    "cities": "003_DUB_Deira_City_Ctr",
    "productIds": "1020818",
    "targeting": "jade forest:broad:2"
  }
];

export const SAMPLE_BATCH_ROWS: RefSampleRow[] = [
  {
    "subCategory": "Bread",
    "brandName": "Harvest Gold",
    "platform": "Blinkit",
    "campaignName": "harvest_gold_blinkit_english_oven_competition_oos_20260901_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "1000",
    "cities": "Noida, New Delhi, Gurugram",
    "productIds": "636465",
    "targetingDetails": "english oven:broad:492",
    "currency": "INR"
  },
  {
    "subCategory": "Bread",
    "brandName": "Harvest Gold",
    "platform": "Zepto_app",
    "campaignName": "harvest_gold_zepto_app_the_health_factory_competition_oos_20260901_mf",
    "endDate": "2026-09-30",
    "budgetType": "overall",
    "budgetValue": "4500",
    "cities": "New Delhi, Gurugram, Faridabad",
    "productIds": "a406d37d-6078-4644-a3da-06ed405cbb46, 5206d918-f6f8-4021-938c-7fb5aae87000, 58bd25ce-8f73-4031-96ed-7a1278834d2b",
    "targetingDetails": "the health factory:broad:32",
    "currency": "INR"
  },
  {
    "subCategory": "Bread",
    "brandName": "Harvest Gold",
    "platform": "Instamart_app",
    "campaignName": "harvest_gold_instamart_app_britannia_competition_oos_20260902_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "1000",
    "cities": "Noida, Gurugram, New Delhi",
    "productIds": "2SFOFCDG7R_K9SX4RXNDZ, ULWGSFZZ7V",
    "targetingDetails": "britannia:broad:1740",
    "currency": "INR"
  },
  {
    "subCategory": "Bread",
    "brandName": "HarvestGold-Bread",
    "platform": "Zepto_app",
    "campaignName": "harvestgold_bread_zepto_app_britannia_competition_oos_20260902_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "120",
    "cities": "New Delhi",
    "productIds": "2605ed52-9552-49e3-9356-a712a04ec063",
    "targetingDetails": "britannia:broad:12",
    "currency": "INR"
  },
  {
    "subCategory": "Bread",
    "brandName": "Modern",
    "platform": "Instamart_app",
    "campaignName": "modern_instamart_app_jade_forest_competition_oos_20260903_mf",
    "endDate": "2026-09-15",
    "budgetType": "overall",
    "budgetValue": "3200",
    "cities": "Ajmer, Noida",
    "productIds": "03W7K7LOJU, 3J3PGMJMI3, 7J95B70IOJ, BQFNZU8T5R",
    "targetingDetails": "jade forest:broad:1740",
    "currency": "INR"
  },
  {
    "subCategory": "Nutrition Bars",
    "brandName": "Yogabar",
    "platform": "Blinkit",
    "campaignName": "yogabar_blinkit_ritebite_competition_oos_20260903_mf",
    "endDate": "2026-09-20",
    "budgetType": "overall",
    "budgetValue": "2626",
    "cities": "Noida, Bengaluru, Kolkata",
    "productIds": "628502, 537082, 724867",
    "targetingDetails": "ritebite:broad:950",
    "currency": "INR"
  },
  {
    "subCategory": "Nutrition Bars",
    "brandName": "Yogabar",
    "platform": "Blinkit",
    "campaignName": "yogabar_blinkit_planck_foods_competition_oos_20260904_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "500",
    "cities": "Ahmedabad, Jalandhar, Kota",
    "productIds": "681510, 531826, 671680, 544396",
    "targetingDetails": "planck foods:broad:520",
    "currency": "INR"
  },
  {
    "subCategory": "Nutrition Bars",
    "brandName": "Yogabar",
    "platform": "noon_minutes_uae_app",
    "campaignName": "yogabar_noon_minutes_uae_app_bugles_competition_oos_20260904_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "120",
    "cities": "Dubai, Al Ain",
    "productIds": "ZD09ED5BF1F00885F9AE5Z-1, ZD20B6B7FC465F13BCCB8Z-1, Z7F947A21662CF2738909Z-1",
    "targetingDetails": "bugles:exact:3;mr krisps:phrase:2.5",
    "currency": "AED"
  },
  {
    "subCategory": "Nutrition Bars",
    "brandName": "Yogabar",
    "platform": "noon_minutes_uae_app",
    "campaignName": "yogabar_noon_minutes_uae_app_old_el_paso_competition_oos_20260905_mf",
    "endDate": "2026-09-30",
    "budgetType": "overall",
    "budgetValue": "524",
    "cities": "Dubai",
    "productIds": "Z6D0B3A7346CB02046661Z-1, Z3F35507AF63532D77ADDZ-1, Z98319C15762746873D4FZ-1",
    "targetingDetails": "old el paso:broad:2;werther s:exact:2",
    "currency": "AED"
  },
  {
    "subCategory": "Sunscreen",
    "brandName": "Demonstration-Sunscreen",
    "platform": "Blinkit",
    "campaignName": "demonstration_sunscreen_blinkit_la_shield_defend_keyword_20260905_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "1000",
    "cities": "Noida",
    "productIds": "544531",
    "targetingDetails": "la shield:broad:492-541",
    "currency": "INR"
  },
  {
    "subCategory": "Atta & Flour",
    "brandName": "Test Customer",
    "platform": "Blinkit",
    "campaignName": "test_customer_blinkit_aashirvaad_defend_keyword_20260906_mf",
    "endDate": "2026-09-30",
    "budgetType": "overall",
    "budgetValue": "4120",
    "cities": "Noida, New Delhi, Ghaziabad, Faridabad",
    "productIds": "692063, 691794",
    "targetingDetails": "aashirvaad atta:exact:2700;fortune atta:broad:1350;atta:broad:1900",
    "currency": "INR"
  },
  {
    "subCategory": "Atta & Flour",
    "brandName": "Test Customer",
    "platform": "Blinkit",
    "campaignName": "test_customer_blinkit_wheat_flour_keywords_losing_rank_20260906_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "1000",
    "cities": "Delhi, Ahmedabad",
    "productIds": "333324",
    "targetingDetails": "wheat flour:broad:2200;multigrain atta:broad:1350;protein atta:exact:1500",
    "currency": "INR"
  },
  {
    "subCategory": "Atta & Flour",
    "brandName": "Test Customer",
    "platform": "Zepto_app",
    "campaignName": "test_customer_zepto_app_wheat_atta_keywords_losing_rank_20260907_mf",
    "endDate": "2026-09-30",
    "budgetType": "overall",
    "budgetValue": "2000",
    "cities": "Delhi, Gurugram, Bengaluru, Hyderabad",
    "productIds": "6df88314-e3fb-4ed9-88c8-62cb7ba9ff41",
    "targetingDetails": "wheat atta:broad:32;flour:broad:12",
    "currency": "INR"
  },
  {
    "subCategory": "Chewing Gum",
    "brandName": "Perfetti",
    "platform": "talabat_mart_uae",
    "campaignName": "perfetti_talabat_mart_uae_mint_defend_keyword_20260907_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "100",
    "cities": "ABU DHABI",
    "productIds": "62b06a16a16823ea7fa4249e, 62b06a16a16823ea7fa4247a",
    "targetingDetails": "mint:exact:5;chewing gum:exact:5;gum:exact:5",
    "currency": "AED"
  },
  {
    "subCategory": "Chewing Gum",
    "brandName": "Perfetti",
    "platform": "noon_minutes_uae_app",
    "campaignName": "perfetti_noon_minutes_uae_app_mint_defend_keyword_20260908_mf",
    "endDate": "2026-09-30",
    "budgetType": "overall",
    "budgetValue": "3066",
    "cities": "Dubai",
    "productIds": "Z7721FBADF89D90A47540Z-1, Z1A309CF79181647867C4Z-1",
    "targetingDetails": "mint:phrase:3;gum:exact:2",
    "currency": "AED"
  },
  {
    "subCategory": "Toothpaste",
    "brandName": "Dabur",
    "platform": "amazonae",
    "campaignName": "dabur_amazonae_toothpaste_defend_keyword_20260908_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "100",
    "cities": "Dubai",
    "productIds": "amazonae_b004bpipfm, amazonae_b07mtrw8tg",
    "targetingDetails": "dabur toothpaste:exact:45;toothpaste:broad:23",
    "currency": "AED"
  },
  {
    "subCategory": "Snacks",
    "brandName": "pepsico-snacks",
    "platform": "carrefour_now_uae",
    "campaignName": "pepsico_snacks_carrefour_now_uae_jade_forest_competition_oos_20260909_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "120",
    "cities": "003_DUB_Deira_City_Ctr",
    "productIds": "1020818",
    "targetingDetails": "jade forest:broad:2",
    "currency": "AED"
  },
  {
    "subCategory": "Snacks",
    "brandName": "pepsico-snacks",
    "platform": "talabat_mart_uae",
    "campaignName": "pepsico_snacks_talabat_mart_uae_bingo_competition_oos_20260909_mf",
    "endDate": "2026-09-30",
    "budgetType": "overall",
    "budgetValue": "1886",
    "cities": "ABU DHABI",
    "productIds": "talabat_mart_uae_501247, talabat_mart_uae_904161",
    "targetingDetails": "bingo:exact:5",
    "currency": "AED"
  },
  {
    "subCategory": "Snacks",
    "brandName": "pepsico-snacks",
    "platform": "Instamart_app",
    "campaignName": "pepsico_snacks_instamart_app_bingo_competition_oos_20260910_mf",
    "endDate": "",
    "budgetType": "daily",
    "budgetValue": "1000",
    "cities": "Noida, Gurugram",
    "productIds": "2SFOFCDG7R_K9SX4RXNDZ",
    "targetingDetails": "bingo:broad:1740",
    "currency": "INR"
  }
];
