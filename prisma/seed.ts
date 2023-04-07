import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import { vendors, partners, categories } from "./data";
import { CommissionType } from "@prisma/client";
// https://github.com/orta/vscode-twoslash-queries
const createCategories = async () => {
  const c = await prisma.category.count();

  if (c > 1) {
    console.log(`Already have ${c} categories. Skipping...`);
    return;
  }

  for (const v of categories) {
    await prisma.category.create({
      data: { name: v.name },
    });
  }
};

const createVendorUsers = async () => {
  const c = await prisma.vendor.count();

  if (c > 0) {
    console.log(`Already have ${c} Vendors. Skipping...`);
    return;
  }

  for (const v of vendors) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("bm123456", salt);
    v.password = hash;
    const user = await prisma.user.create({
      data: {
        email: v.email,
        password: v.password,
        role: "VENDOR",
        fname: v.fname,
        lname: v.lname,
      },
    });
    const vendor = await prisma.vendor.create({
      data: { userId: user.id, website: v.website, brand: v.brand },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { vendor_id: vendor.id },
    });
    console.log("Vendor: ", v.email);
  }
};

const createPartnerUsers = async () => {
  const c = await prisma.partner.count();

  if (c > 0) {
    console.log(`Already have ${c} Partners. Skipping...`);
    return;
  }

  for (const p of partners) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("bm123456", salt);
    p.password = hash;
    const user = await prisma.user.create({
      data: {
        email: p.email,
        password: p.password,
        role: "PARTNER",
        fname: p.fname,
        lname: p.lname,
      },
    });
    const partner = await prisma.partner.create({
      data: { userId: user.id, username: p.username },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { partner_id: partner.id },
    });
    console.log("Partner: ", p.email);
  }
};

const getVendorUser = async () => {
  return await prisma.user.findFirst({
    where: { email: "wendy@email.com" },
    include: { vendor: true },
  });
};

const getACat = async () => {
  return await prisma.category.findFirst();
};

const seedProducts = async () => {
  const u = await getVendorUser();
  const c = await getACat();

  const hasProduct = await prisma.product.findFirst({
    where: { vendor_user_id: u?.id },
  });

  if(hasProduct) {
    console.log('wendy already have products, skipping..');
    return
  }

  const vendor_user_id = u?.id ?? "abc";
  const vendor_profile_id = u?.vendor_id ?? "abc";

  const prods = [
    {
      title: "LG 38 inch Ultrawide Monitor",
      desc: "LG 38 inch Ultrawide Monitor",
      price: 20000,
      perClick: 3,
      perClickType: CommissionType.CASH,
      perSale: 12,
      perSaleType: CommissionType.PERC,
      active: false,
      product_url: "https://www.lg.com/us/ultrawide-monitors",
      image:
        "https://www.lg.com/us/images/monitors/md06121837/gallery/1100-01.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 1,
    },
    {
      title: "1974 Fender Stratocaster, Sunburst",
      desc: "Wonderful 1974 Fender Stratocaster in three-tone Sunburst, with Rosewood fingerboard, large headstock, bullet trussrod, staggered pole pickups all in excellent condition complete with bridge cover and tremolo arm at a good price thanks to a replacement neck pickup.",
      price: 1000,
      perClick: 1,
      perClickType: CommissionType.CASH,
      perSale: 8,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.vintageandrareguitars.com/products/1974-fender-stratocaster-sunburst",
      image:
        "https://guitarpoint.de/app/uploads/products/1974-fender-stratocaster-3t-sunburst-mapleneck-3/Fender74Strat3tSBMN574421_18.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 3,
    },
    {
      title: "Philips Hue",
      desc: "Philips Hue White and Color ambiance Play lamba ikili paket",
      price: 1000,
      perClick: 1,
      perClickType: CommissionType.CASH,
      perSale: 10,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.trendyol.com/philips/hue-play-2-li-paket-siyah-915005733901-p-37663683?boutiqueId=614296&merchantId=109635",
      image:
        "https://cdn.dsmcdn.com/assets/dev/product/media/images/20200328/16/670980/66961232/1/1_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 1,
    },
    {
      title: "Delonghi Dedica Manuel Espresso Makinesi",
      desc: "Delonghi Dedica Manuel Espresso Makinesi, 15 cm Genişlik, 1 L Kapasite, 1350W, 15 Bar Basınç, Paslanmaz Çelik (EC 685.M).",
      price: 1000,
      perClick: 1,
      perClickType: CommissionType.CASH,
      perSale: 7,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.amazon.com.tr/Espresso-ve-Kapu%C3%A7ino-Makineleri-Delonghi-Kahve/s?rh=n%3A13511569031%2Cp_89%3ADelonghi",
      image:
        "https://cdn.dsmcdn.com/ty520/product/media/images/20220902/21/168727751/558385585/1/1_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 5,
    },
    {
      title: "Philips Hue Lightstrip Gradient Tv 75 inch Akıllı Led Şerit",
      desc: "Kolay akıllı aydınlatma Philips Hue ile sinemanın heyecanını evinizde yaşayın Degrade ışık şeridi oynayın. tepki veren birden çok ışık rengi elde edin. • Renkleri Sorunsuz Bir Şekilde Karıştırın • Çevre Aydınlatma Efektleri • Oyunu Değiştiren Ev Eğlencesi • Kolay kurulum • Hue Sync ve Hue Bridge Gerekli • Mükemmel uyum için üç boyut",
      price: 1000.0,
      perClick: 0,
      perClickType: CommissionType.CASH,
      perSale: 12,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.trendyol.com/philips/hue-lightstrip-gradient-tv-75-akilli-led-serit-p-165028794",
      image:
        "https://cdn.dsmcdn.com/ty205/product/media/images/20211020/10/152702278/269209288/5/5_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 1,
    },
    {
      title: "Philips Tar4406/12 Alarmlı Saatli Radyo",
      desc: "Philips TAR4406/12 alarmlı saat/kronometre Dijital çalar saat Beyaz",
      price: 1000,
      perClick: 1,
      perClickType: CommissionType.CASH,
      perSale: 16,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.trendyol.com/philips/tar4406-12-alarmli-saatli-radyo-p-310677433",
      image:
        "https://cdn.dsmcdn.com/ty449/product/media/images/20220606/18/122223020/495602189/1/1_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 5,
    },
    {
      title: "Caterpillar Kadın Bej Colorado Bot",
      desc: "Kadın Bot",
      price: 2000.0,
      perClick: 1,
      perClickType: CommissionType.PERC,
      perSale: 8,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.trendyol.com/caterpillar/kadin-bej-colorado-bot-015g100095-p-65496097",
      image:
        "https://cdn.dsmcdn.com/ty523/product/media/images/20220906/12/169717797/16382194/1/1_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 2,
    },
  ];

  if (!c) return;

  for (const p of prods) {
    await prisma.product.create({
      data: { ...p, categoryId: c.id },
    });
  }

  const productCreation = await prisma.product.createMany({
    data: prods,
  });

  console.log({ productCreation });
};

const seedProductsForVeronica = async () => {
  const u = await prisma.user.findFirst({
    where: { email: "veronica@email.com" },
    include: { vendor: true },
  });
  const c = await getACat();

  const vendor_user_id = u?.id ?? "abc";
  const vendor_profile_id = u?.vendor_id ?? "abc";

  const prods = [
    {
      title: "LG 38 inch Ultrawide Monitor",
      desc: "LG 38 inch Ultrawide Monitor",
      price: 20000,
      perClick: 3,
      perClickType: CommissionType.CASH,
      perSale: 12,
      perSaleType: CommissionType.PERC,
      active: false,
      product_url: "https://www.lg.com/us/ultrawide-monitors",
      image:
        "https://www.lg.com/us/images/monitors/md06121837/gallery/1100-01.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 1,
    },
    {
      title: "1974 Fender Stratocaster, Sunburst",
      desc: "Wonderful 1974 Fender Stratocaster in three-tone Sunburst, with Rosewood fingerboard, large headstock, bullet trussrod, staggered pole pickups all in excellent condition complete with bridge cover and tremolo arm at a good price thanks to a replacement neck pickup.",
      price: 1000,
      perClick: 1,
      perClickType: CommissionType.CASH,
      perSale: 8,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.vintageandrareguitars.com/products/1974-fender-stratocaster-sunburst",
      image:
        "https://guitarpoint.de/app/uploads/products/1974-fender-stratocaster-3t-sunburst-mapleneck-3/Fender74Strat3tSBMN574421_18.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 3,
    },
    {
      title: "Philips Hue",
      desc: "Philips Hue White and Color ambiance Play lamba ikili paket",
      price: 1000,
      perClick: 1,
      perClickType: CommissionType.CASH,
      perSale: 10,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.trendyol.com/philips/hue-play-2-li-paket-siyah-915005733901-p-37663683?boutiqueId=614296&merchantId=109635",
      image:
        "https://cdn.dsmcdn.com/assets/dev/product/media/images/20200328/16/670980/66961232/1/1_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 1,
    },
    {
      title: "Delonghi Dedica Manuel Espresso Makinesi",
      desc: "Delonghi Dedica Manuel Espresso Makinesi, 15 cm Genişlik, 1 L Kapasite, 1350W, 15 Bar Basınç, Paslanmaz Çelik (EC 685.M).",
      price: 1000,
      perClick: 1,
      perClickType: CommissionType.CASH,
      perSale: 7,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.amazon.com.tr/Espresso-ve-Kapu%C3%A7ino-Makineleri-Delonghi-Kahve/s?rh=n%3A13511569031%2Cp_89%3ADelonghi",
      image:
        "https://cdn.dsmcdn.com/ty520/product/media/images/20220902/21/168727751/558385585/1/1_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 5,
    },
    {
      title: "Philips Hue Lightstrip Gradient Tv 75 inch Akıllı Led Şerit",
      desc: "Kolay akıllı aydınlatma Philips Hue ile sinemanın heyecanını evinizde yaşayın Degrade ışık şeridi oynayın. tepki veren birden çok ışık rengi elde edin. • Renkleri Sorunsuz Bir Şekilde Karıştırın • Çevre Aydınlatma Efektleri • Oyunu Değiştiren Ev Eğlencesi • Kolay kurulum • Hue Sync ve Hue Bridge Gerekli • Mükemmel uyum için üç boyut",
      price: 1000.0,
      perClick: 0,
      perClickType: CommissionType.CASH,
      perSale: 12,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.trendyol.com/philips/hue-lightstrip-gradient-tv-75-akilli-led-serit-p-165028794",
      image:
        "https://cdn.dsmcdn.com/ty205/product/media/images/20211020/10/152702278/269209288/5/5_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 1,
    },
    {
      title: "Philips Tar4406/12 Alarmlı Saatli Radyo",
      desc: "Philips TAR4406/12 alarmlı saat/kronometre Dijital çalar saat Beyaz",
      price: 1000,
      perClick: 1,
      perClickType: CommissionType.CASH,
      perSale: 16,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.trendyol.com/philips/tar4406-12-alarmli-saatli-radyo-p-310677433",
      image:
        "https://cdn.dsmcdn.com/ty449/product/media/images/20220606/18/122223020/495602189/1/1_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 5,
    },
    {
      title: "Caterpillar Kadın Bej Colorado Bot",
      desc: "Kadın Bot",
      price: 2000.0,
      perClick: 1,
      perClickType: CommissionType.PERC,
      perSale: 8,
      perSaleType: CommissionType.PERC,
      active: true,
      product_url:
        "https://www.trendyol.com/caterpillar/kadin-bej-colorado-bot-015g100095-p-65496097",
      image:
        "https://cdn.dsmcdn.com/ty523/product/media/images/20220906/12/169717797/16382194/1/1_org_zoom.jpg",
      vendor_profile_id,
      vendor_user_id,
      categoryId: 2,
    },
  ];

  if (!c) return;

  for (const p of prods) {
    await prisma.product.create({
      data: { ...p, categoryId: c.id },
    });
  }

  const productCreation = await prisma.product.createMany({
    data: prods,
  });

};

createCategories()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();

    createPartnerUsers()
      .catch((e) => {
        console.log(e);
        process.exit(1);
      })
      .finally(() => {
        prisma.$disconnect();

        createVendorUsers()
          .catch((e) => {
            console.log(e);
            process.exit(1);
          })
          .finally(() => {
            prisma.$disconnect();

            seedProducts()
              .catch((e) => {
                console.log(e);
                process.exit(1);
              })
              .finally(() => {
                prisma.$disconnect();

                seedProductsForVeronica().catch((e) => {
                  console.log(e);
                  process.exit(1);
                })
              });
          });
      });
  });
