ssh burak@178.62.214.223  → bm13xxxxxxxxx
pm2 stop affinext
pm2 start affinext
pm2 restart affinext
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

## PRISMA MIGRATIONS
Test edildi, Onaylandi: 
Local'de db resetleyerek yeni migration file olusturuyoruz
Sonra server'da git ile gelen bu dosyayi npx prisma migrate deploy ile db'ye yansitiyoruz.

Column isim degisikligi yaparsan onceden o column'daki kayitli tum data kaybolur.
Yeni Column eklenirse default value bulunmali.
Yani prisma schema'sinda ya  “params String?” yada “params String @default("val")”
seklinde column eklenmeli. 

### Migration steps
- local: npx prisma migrate dev --create-only
- local: npx prisma migrate dev (LOCAL)
- local: git push
-- SERVER
- pm2 stop affinext
- server: git pull origin main
- npm i
- server: npx prisma migrate deploy (veya migrate dev henuz prod degil ve tumden degisiklik varsa)
- npm run db:seed
- npm run build
- pm2 start affinext

mysql -u burak -p
DROP TABLE `account`, `category`, `link`, `notification`, `payment`, `product`, `session`, `tag`, `tags_on_products`, `user`, `user_ip`, `user_partner`, `user_vendor`, `verification_token`, `visit` `_prisma_migrations`;