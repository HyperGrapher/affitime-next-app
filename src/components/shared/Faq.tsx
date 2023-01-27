import React from 'react'
import AccordItem from '../accordion/AccordItem'

const Faq = () => {
    return (<section className="text-white">
        <div className="container px-5 py-24 mx-auto" >
            <div className="flex flex-col text-center w-full mb-20" >
                <h3 className="sm:text-3xl text-2xl font-medium title-font text-gray-900/50">
                    Sıkça Sorulan Sorular
                </h3>
            </div>

            <section className="space-y-8 mx-auto max-w-screen-md">

                <AccordItem
                    id="1"
                    title="Lorem ipsum dolor sit amet consectetur adipisicing."
                    desc="Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
            Dolore vel placeat labore doloremque inventore magni optio tenetur. 
            Labore deserunt aut est cumque, eveniet molestias odio quibusdam, 
            velit quidem laudantium amet consequuntur, accusantium ipsum neque!"
                />

                <AccordItem
                    id="2"
                    title="Lorem ipsum dolor sit amet consectetur adipisicing."
                    desc="Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
            Dolore vel placeat labore doloremque inventore magni optio tenetur. 
            Labore deserunt aut est cumque, eveniet molestias odio quibusdam, 
            velit quidem laudantium amet consequuntur, accusantium ipsum neque!"
                />

                <AccordItem
                    id="3"
                    title="Lorem ipsum dolor sit amet consectetur adipisicing."
                    desc="Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
            Dolore vel placeat labore doloremque inventore magni optio tenetur. 
            Labore deserunt aut est cumque, eveniet molestias odio quibusdam, 
            velit quidem laudantium amet consequuntur, accusantium ipsum neque!"
                />

            </section>
        </div>
    </section>
    )

}

export default Faq