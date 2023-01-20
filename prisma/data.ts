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
]


export const partners = [
  {
    email: "paris@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    username: "Paris",
    fname: "Paris",
    lname: "Dior",
    packageType: PackageType.BASIC,
  },
  {
    email: "parma@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    username: "Parma",
    fname: "Parma",
    lname: "Sarma",
    packageType: PackageType.BASIC,
  },
  {
    email: "parloo@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    username: "Parloo",
    fname: "Parloo",
    lname: "Diaz",
    packageType: PackageType.BASIC,
    vendor_id: null,
    partner_id: null,
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
    packageType: PackageType.BASIC,
  },
  {
    email: "wendoo@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    brand: "Wendoo Ticaret AS",
    website: "https://wendoo.com",
    fname: "Wendoo",
    lname: "Cartman",
    packageType: PackageType.BASIC,
  },
  {
    email: "veronica@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    brand: "Veronica Ticaret AS",
    website: "https://veronica.com",
    fname: "Veronica",
    lname: "Diaz",
    packageType: PackageType.BASIC,
  },
];
