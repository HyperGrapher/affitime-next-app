```ts
   const visits = await ctx.prisma.visit.findMany({
      where: {
        AND: [
          {
            vendor_id: vendorId,
          },
          {
            ipapi: null,
          },
        ],
      },
    });
```


```prisma
model Product {
  name                      String      
  filters                   Filter[]
}

model Filter {
  name                        String      
  value                       String
  product                     Product?    @relation(fields: [productId], references:[id])
  productId                   Int?
}

```

Yukaridaki model icin query
[Use multiple conditions inside AND operator in a nested relation](https://github.com/prisma/prisma/discussions/8216)
The idea is, products can be queried based on different parameters, like RAM, Storage, Graphics card etc. These params come dynamically from the frontend (using checkboxes and radio buttons etc).
The above code works only if there is a single condition, e.g.

```ts
await prisma.product.findMany({
      where: {
        AND: [
          { price: 21.99 },
          { filters: { some: { name: 'ram', value: '8GB' } } },
          { filters: { some: { name: 'storage', value: '256GB' } } },
        ],
      },
})

```

## GroupBy

```ts

const visitsGroupByRes = await ctx.prisma.visit.groupBy({
      by: ['link_id'],
      _count: {
        dubious: true
        
      }
      
    });
    
    const visitsGroupByRes = [
      { _count: { dubious: 3 }, link_id: 'clcx7ayh40002cqecxd18d2ui' },
      { _count: { dubious: 1 }, link_id: 'clcxoofis0004cq6gl94wkc8e' }
    ]
```