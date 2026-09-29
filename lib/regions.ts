import { DEFAULT_PHONE } from "./site";

export type Region = {
  slug: string;
  name: string;
  shortName: string;
  locative: string;
  description: string;
  seoDescription: string;
  serviceArea: string[];
  phone: string;
};

const fallback = process.env.DEFAULT_PHONE || DEFAULT_PHONE;

export const regions: Region[] = [
  {
    slug: "yug-rossii",
    name: "Юг России",
    shortName: "Юг России",
    locative: "на Юге России",
    description:
      "Выезжаем на объекты по Югу России: оцениваем остекление, подбираем защитную систему и выполняем профессиональный монтаж.",
    seoDescription: "Подбор и установка защитной противоосколочной плёнки на окна на Юге России. Расчёт стоимости по фото и размерам остекления.",
    serviceArea: ["Ростовская область", "Краснодарский край", "Крым", "Новые регионы"],
    phone: process.env.REGION_PHONE_SOUTH || fallback,
  },
  {
    slug: "rostov-na-donu",
    name: "Ростов-на-Дону и Ростовская область",
    shortName: "Ростов",
    locative: "в Ростове-на-Дону",
    description:
      "Защита окон квартир, домов, офисов и коммерческих объектов в Ростове-на-Дону и по Ростовской области.",
    seoDescription: "Установка противоосколочной плёнки на окна в Ростове-на-Дону и Ростовской области. Защита остекления квартир, домов и офисов. Расчёт по фото и размерам.",
    serviceArea: ["Ростов-на-Дону", "Батайск", "Аксай", "Таганрог"],
    phone: process.env.REGION_PHONE_ROSTOV || fallback,
  },
  {
    slug: "krasnodar",
    name: "Краснодар и Краснодарский край",
    shortName: "Краснодар",
    locative: "в Краснодаре",
    description:
      "Монтаж противоосколочной плёнки в Краснодаре и по краю — для существующих окон и крупноформатного остекления.",
    seoDescription: "Монтаж защитной противоосколочной плёнки в Краснодаре и Краснодарском крае. Окна, витрины и панорамное остекление. Подбор плёнки и расчёт стоимости.",
    serviceArea: ["Краснодар", "Новороссийск", "Анапа", "Сочи"],
    phone: process.env.REGION_PHONE_KRASNODAR || fallback,
  },
  {
    slug: "donetsk",
    name: "Донецк и ДНР",
    shortName: "Донецк",
    locative: "в Донецке",
    description:
      "Подбираем решения для снижения риска травмирования оконными осколками в жилых и коммерческих помещениях Донецка и ДНР.",
    seoDescription: "Защитная противоосколочная плёнка на окна с установкой в Донецке и ДНР. Для квартир, домов и коммерческих помещений. Расчёт стоимости по фото остекления.",
    serviceArea: ["Донецк", "Макеевка", "Мариуполь", "Горловка"],
    phone: process.env.REGION_PHONE_DONETSK || fallback,
  },
  {
    slug: "lugansk",
    name: "Луганск и ЛНР",
    shortName: "Луганск",
    locative: "в Луганске",
    description:
      "Профессиональная установка защитной плёнки на окна квартир, домов, офисов и общественных объектов Луганска и ЛНР.",
    seoDescription: "Установка противоосколочной плёнки на окна в Луганске и ЛНР. Защита остекления домов, квартир и офисов. Подбор решения и предварительный расчёт стоимости.",
    serviceArea: ["Луганск", "Алчевск", "Северодонецк", "Краснодон"],
    phone: process.env.REGION_PHONE_LUGANSK || fallback,
  },
  {
    slug: "krym",
    name: "Республика Крым",
    shortName: "Крым",
    locative: "в Республике Крым",
    description:
      "Защита остекления в квартирах, частных домах, гостиницах, офисах и коммерческих объектах по Республике Крым.",
    seoDescription: "Монтаж защитной противоосколочной плёнки на окна в Крыму. Квартиры, дома, гостиницы и витрины. Оценим остекление и рассчитаем стоимость по фото и размерам.",
    serviceArea: ["Симферополь", "Севастополь", "Ялта", "Керчь"],
    phone: process.env.REGION_PHONE_CRYM || fallback,
  },
];

export const localRegions = regions.filter((region) => region.slug !== "yug-rossii");

export function getRegion(slug: string) {
  return regions.find((region) => region.slug === slug);
}

export function regionHref(region: Region) {
  return region.slug === "yug-rossii" ? "/" : `/regions/${region.slug}/`;
}
