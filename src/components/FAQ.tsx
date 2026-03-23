import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqKeys = ["q1", "q2", "q3", "q4", "q5"] as const;

export function FAQ() {
  const { t } = useTranslation();

  const faqItems = faqKeys.map((key) => ({
    question: t(`faq.${key}`),
    answer: t(`faq.a${key.slice(1)}`),
  }));

  return (
    <section id="faq" className="section-gradient-rose py-16 md:py-24">
      <motion.div
        className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <header className="text-center mb-12 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
            {t("faq.eyebrow")}
          </p>
          <h2
            className="font-serif font-bold tracking-[-0.02em] leading-[1.05] text-foreground"
            style={{ fontSize: "clamp(2.75rem, 5vw + 0.75rem, 5.5rem)" }}
          >
            {t("faq.title")}
          </h2>
          <p className="text-base text-muted-foreground font-sans mt-4">
            {t("faq.subtitle")}
          </p>
        </header>

        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass-card rounded-xl border-0 px-5"
            >
              <AccordionTrigger className="text-sm font-semibold text-foreground font-sans hover:no-underline py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground font-sans leading-relaxed pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* JSON-LD FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            }),
          }}
        />
      </motion.div>
    </section>
  );
}
