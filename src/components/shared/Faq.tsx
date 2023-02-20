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
                    title="Affitime’ı denemek için kredi kartı bilgimi girmeli miyim?"
                    desc={<p>Hayır. affitime’ıherhangi bir bağlayıcılık olmadan ve kredi kartınızı girmeden 14 gün ücretsiz kullanabilirsin. Taahhütsüz, ücretsiz, sınırsız ve bir sürpriz ile karşılaşmadan tüm özellikleri deneyebilirsin.</p>}
                />

                <AccordItem
                    id="2"
                    title="Deneme sürem bitince ne olacak?"
                    desc={<p>affitime’ı 14 gün koşulsuz ücretsiz kullanırsın. Deneme süren bittiğinde seçtiğin pakete göre kredi kartı ya da banka ödemesi ile ödeme yapar ve affitime’ı kullanmaya devam edersin. Eğer herhangi bir ödeme yapmadıysan hesaba giriş yapabilir fakat sistemi kullanamazsın. Deneme süresi içerisinde girdiğin veriler ise kullanımın için seni bekler.
                    </p>}
                />

                <AccordItem
                    id="3"
                    title="Aboneliğimi nasıl yenileyebilirim?"
                    desc={<p>Kredi kartını tanımladıysan aboneliğin otomatik olarak yenilenecek ve abonelik ücreti kredi kartından tahsil edilecektir. Eğer EFT/Havale ile ödeme yaptıysan paket bitiş tarihine doğru seninle irtibata geçeceğiz. </p>}
                />

                <AccordItem
                    id="3"
                    title="Yıllık faturalandırılan üyeliğimi taksitlendirebilir miyim?"
                    desc={<p>Harcamanı affitime ile anlaşmalı bankaların kredi kartlarına 12 taksit olarak taksitlendirebilirsin </p>} />

                <AccordItem
                    id="3"
                    title="Fatura gönderecek misiniz?"
                    desc={<p>Ödeme işlemin gerçekleştikten sonra en kısa süre içinde sistemde kayıtlı e-posta adresine affitime’a kaydolurken belirttiğin firma bilgilerine göre düzenlenen e-arşiv
                        faturan gönderilecektir.
                    </p>} />

                <AccordItem
                    id="3"
                    title="Kredi kartı bilgilerimi saklıyor musunuz?"
                    desc={<p>Kredi kartı bilgilerin affitime tarafından kesinlikle saklanmamaktadır. 
                        Tüm ödeme işlemleri BDDK tarafından ödeme sistemleri lisansı verilmiş olan PAYTR
                        tarafından gerçekleştirilir. Ödeme ve güvenlik ile ilgili sorularınızla ilgili bizimle her zaman
                        iletişime geçebilirsin.</p>} />

            </section>
        </div>
    </section>
    )

}

export default Faq


export const FaqIndex = () => {
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
                    title="affitime’a kayıt olmak ücretli mi?                    "
                    desc={<p>
                        Firman için kayıt oluyorsan 14 gün ücretsiz
                        deneme süresinden sana en uygun paketi seçerek
                        reklam giderlerini azaltabilir ve satışlarını arttırabilirsin.
                        Affiliateler için affitime’a kayıt olmak ücretsizdir
                        ve her zaman ücretsiz kalacaktır.
                    </p>}
                />

                <AccordItem
                    id="2"
                    title="affitime affiliateler aracılığıyla gerçekleşen satışlarımı nasıl analiz eder?"
                    desc={<p>affitime kendi geliştirdiği API sayesinde
                        mağazanızda affiliateler aracılığıyla
                        gerçekleşen satışları analiz eder. API entegrasyonları
                        için entegrasyon sayfamızı ziyaret edebilirsin.
                    </p>}
                />

                <AccordItem
                    id="3"
                    title="affitime’a yeni eklenecek özellikler seçeceğim pakete daha sonra eklenecek mi?"
                    desc={<p>
                        affitime kendini sürekli geliştirmeyi hedefleyen bir platformdur.
                        Yapılan ve yapılacak analizler doğrultusunda paketlerimize yeni
                        ekleyeceğimiz özellikler senin için de daha sonra kullanıma açılacaktır.
                    </p>}
                />

            </section>
        </div>
    </section>
    )

}