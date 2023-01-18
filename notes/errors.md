Invalid `prisma.user.findFirst()` invocation:


error: Error validating datasource `db`: the URL must start with the protocol `mysql://`.
  -->  schema.prisma:18
   |
17 |   provider = "mysql"
18 |   url      = env("DATABASE_URL")
   |


.env deki NEXTAUTH_URL ve BASE_URL nin local development'da iken 
http://localhost:3000 olmali
ayrica prisma schema dosyasinda database kisminda url = mysql://burak:B.....
olarak degistirip npx prisma generate yaptim ve calisti.

