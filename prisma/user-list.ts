import { PackageType, Role } from "@prisma/client";

export const partners = [
  {
    email: "paris@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    name: "Paris Dior",
    packageType: PackageType.BASIC,
  },
  {
    email: "parma@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    name: "Parma Sarma",
    packageType: PackageType.BASIC,
  },
  {
    email: "parloo@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    name: "Parloo Diaz",
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
    name: "Wendy Dior",
    packageType: PackageType.BASIC,
  },
  {
    email: "wendoo@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    name: "Wendoo Cartman",
    packageType: PackageType.BASIC,
  },
  {
    email: "veronica@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    name: "Veronica Diaz",
    packageType: PackageType.BASIC,
  },
];
