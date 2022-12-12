import { PackageType, Role } from "@prisma/client";

export const partners = [
  {
    email: "paris@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    fname: "Paris",
    lname: "Dior",
    packageType: PackageType.BASIC,
  },
  {
    email: "parma@email.com",
    password: "bm123456",
    role: Role.PARTNER,
    fname: "Parma",
    lname: "Sarma",
    packageType: PackageType.BASIC,
  },
  {
    email: "parloo@email.com",
    password: "bm123456",
    role: Role.PARTNER,
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
    fname: "Wendy",
    lname: "Dior",
    packageType: PackageType.BASIC,
  },
  {
    email: "wendoo@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    fname: "Wendoo",
    lname: "Cartman",
    packageType: PackageType.BASIC,
  },
  {
    email: "veronica@email.com",
    password: "bm123456",
    role: Role.VENDOR,
    fname: "Veronica",
    lname: "Diaz",
    packageType: PackageType.BASIC,
  },
];
