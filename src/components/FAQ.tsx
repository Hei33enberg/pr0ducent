import { useTranslation } from "@/lib/i18n";
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="font-serif font-bold tracking-[-0.02em] leading-[1.1] text-foreground text-center mb-12" style={{ fontSize: "clamp(3rem, 6vw + 1rem, 7rem)" }}>
          {t("faq.title")}
        </h2>

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
      </div>
    </section>
  );
}
