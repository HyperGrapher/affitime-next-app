# CSS ve Genel Tasarim

- "field selector" dropdown 
    https://twitter.com/i/status/1613619886131122176
- headlessui navbar https://github.com/joschan21/business-card-fullstack/blob/main/src/components/shared/Navbar.tsx  
    https://www.youtube.com/watch?v=qJnIJa-cF2M


    

https://www.austinshelby.com/blog/build-a-react-form-with-react-hook-form-and-zod
const FormSchema = z.object({
    email: z.string().email(),
    accept: z.literal(true, {
        invalid_type_error: "You must accept Terms and Conditions.",
    }),
    tier: z
        .string({ invalid_type_error: "Please select a payment tier." })
        .refine((val) => [{ id: "BRONZE" }, { id: "SILVER" }, { id: "GOLD" }].map((item) => item.id).includes(val)),
});
