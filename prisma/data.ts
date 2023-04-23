import { PackageType, Role } from "@prisma/client";


export const categories = [
  {
    name: "Elektronik"
  },
  {
    name: "Giyim & Aksesuar"
  },
  {
    name: "Müzik aletleri"
  },
  {
    name: "Cep Telefonu"
  },
  {
    name: "Elektrikli Ev Aletleri"
  },
  {
    name: "Anne & Bebek"
  },
  {
    name: "Hobi & Oyuncak"
  },
  {
    name: "Kişisel Bakım & Kozmetik"
  },
  {
    name: "Oyun & Konsol"
  },
  {
    name: "Takı, Mücevher & Altın"
  },
  {
    name: "Kadın Giyim & Aksesuar"
  },
  {
    name: "Erkek Giyim & Aksesuar"
  },
  {
    name: "Genel Giyim"
  },
]


export const partners = [
  {
    email: "paris@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    username: "Paris",
    fname: "Paris",
    lname: "Dior",
    packageType: PackageType.PARTNER,
  },
  {
    email: "parma@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    username: "Parma",
    fname: "Parma",
    lname: "Sarma",
    packageType: PackageType.PARTNER,
  },
  {
    email: "parloo@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    username: "Parloo",
    fname: "Parloo",
    lname: "Diaz",
    packageType: PackageType.PARTNER,
  },
];

export const vendors = [
  {
    email: "wendy@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    brand: "Wendy Ticaret AS",
    website: "https://wendy.com",
    fname: "Wendy",
    lname: "Dior",
    phone: "5535555555",
    packageType: PackageType.ULTIMATE,
  },
  {
    email: "wendoo@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    brand: "Wendoo Ticaret AS",
    website: "https://wendoo.com",
    fname: "Wendoo",
    lname: "Cartman",
    phone: "5535555555",
    packageType: PackageType.ULTIMATE,
  },
  {
    email: "veronica@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    brand: "Veronica Ticaret AS",
    website: "https://veronica.com",
    fname: "Veronica",
    lname: "Diaz",
    phone: "5535555555",
    packageType: PackageType.ULTIMATE,
  },
];
