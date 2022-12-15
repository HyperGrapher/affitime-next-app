## TODO:
- product duzenlenirken product_url'nin link relationinda da duznleme gerekli olabilir. Check etmeli.

## Product

- Product olustururken perClick ve perSale default olarak null degeri alir.
- Eger user bunlara bir deger verirs ve sonra disable yaparsa tekrar null degeri alir.
- perClick ve perSale ayni anda null ise product `active=false` hale gelir.
- Bu durumda vendor uyari mesaji gorur.
- `active=false` ise redirect yapilmaz, bir hata sayfasina yonlenir.

## Visit

- isUnique field, linke tiklayan customer'in ip ve cookiee'si check edilip true/false degeri aliyor.
- Visit id'leri yonlendirilen kullanicinin cookiee'sine partner id, tarih, unique, ip, vb ile beraber yazilir.
- <b>paid field<b>: partner'in bu visit'ten bir kazanci varsa status'unu gosterir. Odeme yapilanlar daha sonra hesaplanmaz.
- <b>dubious field<b> Partner ip'si ve/veya cookiee'si ile uyusuyor ise true degerini alir.
- <b>isUnique field<b> Cookiee ve ip bulunmuyorsa true degerini alir.