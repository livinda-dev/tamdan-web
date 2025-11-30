export default function SampleNews({
  setIsOpenNewsModal,
}: {
  setIsOpenNewsModal: (isOpen: boolean) => void;
}) {
  return (
    <div
      className="relative bg-[#FCFAF4] text-gray-800 max-h-[80vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 shadow-xl max-w-5xl mx-auto rounded-md border border-gray-300 w-full sm:w-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        className="absolute top-2 right-3 sm:top-3 sm:right-5 text-gray-500 hover:text-gray-800 text-2xl sm:text-3xl font-bold z-10"
        onClick={() => setIsOpenNewsModal(false)}
      >
        &times;
      </button>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-xs text-gray-600 border-b border-gray-300 pb-2 mb-4 font-serif tracking-wide gap-2">
        <span>VOL. NO.1</span>
        <span className="font-medium">YESTERDAY NEWS TODAY</span>
        <span>25 - 26 / Oct / 2026</span>
      </div>

      {/* Main Title */}
      <div className="text-center mt-4 mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-wider mb-2">
          IN SUMMARIES
        </h1>
        <h2 className="text-xs sm:text-sm uppercase text-gray-700 tracking-[0.25em] font-semibold">
          Stoke Market News Today
        </h2>
      </div>

      {/* Chart Section */}
      <section className="border-t border-gray-300 pt-6 mt-6">
        <h3 className="text-base sm:text-lg font-semibold mb-1 font-serif">
          Asia Stocks Have Lagged US Peers Since End-2020
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Percentage change in MSCI Asia Pacific ex Japan Index and S&P 500
        </p>

        <div className="bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
          <img
            src="/image/sampleChart.png"
            alt="Sample Chart"
            className="w-full max-w-3xl h-auto object-contain p-2"
          />
        </div>

        <p className="text-xs text-gray-500 text-right mt-1">
          Source: Bloomberg
        </p>
      </section>

      {/* Market Highlights */}
      <section className="pt-8 border-t border-gray-300 mt-8">
        <h3 className="text-lg sm:text-xl font-bold font-serif mb-4">Market Highlights</h3>
        <div className="space-y-4 text-sm sm:text-base text-gray-800 leading-relaxed">
          <p>
            Asian stocks rose today, led by South Korea's Kospi hitting record
            highs due to optimism in U.S.–China trade talks and strong AI-sector
            investment. U.S. stock futures also gained slightly ahead of key
            earnings from AMD and Palantir. However, investor confidence stayed
            cautious as the Federal Reserve signaled uncertainty about further
            rate cuts, boosting the U.S. dollar. Meanwhile, Indian markets
            opened lower, with the Nifty 50 down 0.23% and the Sensex dropping
            0.27%.
          </p>
          <p>
            Global stock markets showed mixed performance today. Asian shares
            climbed, led by South Korea's Kospi reaching a record high, fueled
            by renewed optimism surrounding U.S.–China trade-talk progress and
            growth investment in the AI sector. In the U.S., stock futures for
            the S&P 500 and Nasdaq edged higher ahead of major tech earnings
            from AMD and Palantir, reflecting investor confidence in the
            technology industry.
          </p>
          <p>
            Despite the gains, overall market sentiment remains cautious as the
            Federal Reserve signaled that future interest rate cuts are not
            guaranteed, leading to a stronger U.S. dollar. In India, trading
            started on a weaker note, with both the Nifty 50 and Sensex slipping
            amid global uncertainty. Meanwhile, European markets continue to
            face pressure from sluggish manufacturing data, highlighting uneven
            economic recovery across regions.
          </p>
        </div>
      </section>

      {/* Market Takeaways */}
      <section className="pt-8 border-t border-gray-300 mt-8">
        <h3 className="text-lg sm:text-xl font-bold font-serif mb-4">
          Market Takeaways & Outlook
        </h3>
        <div className="space-y-4 text-sm sm:text-base text-gray-800 leading-relaxed">
          <p>
            Tech and AI-related stocks continue to drive market momentum as
            investors await key earnings reports from major technology
            companies. Expectations are high, but volatility could remain.
          </p>
          <p>
            Meanwhile, global investors are closely monitoring monetary policy,
            as the U.S. Federal Reserve's cautious tone on future rate cuts has
            strengthened the dollar and limited appetite for riskier assets.
            This stance signals that policymakers remain focused on controlling
            inflation rather than stimulating growth.
          </p>
          <p>
            Across global markets, economic signals remain uneven. While Asia
            shows resilience with rising equities and investor optimism, Europe
            and the U.K. continue to struggle with weak manufacturing output and
            slower recovery. The contrast highlights ongoing uncertainty in the
            global growth outlook, leaving investors watchful of data and policy
            decisions in the weeks ahead.
          </p>
        </div>
      </section>

      {/* Global Stock Market Update */}
      <section className="pt-8 border-t border-gray-300 mt-8">
        <h3 className="text-lg sm:text-xl font-bold font-serif mb-4">
          Global Stock Market Update – November 3, 2025
        </h3>
        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
          Global stock markets moved cautiously upward today, supported by gains
          in Asia and optimism renewed from U.S.–China trade talks. South
          Korea's Kospi hit a record high, reflecting strong investor confidence
          in the region's growing technology and AI industries. Meanwhile, U.S.
          stock futures for the S&P 500 and Nasdaq inched higher as investors
          looked ahead to earnings from tech giants AMD and Palantir. Despite
          positive momentum, market sentiment remains restrained amid
          uncertainty about the Federal Reserve's policy outlook.
        </p>
      </section>

      {/* Footer */}
      <footer className="pt-8 mt-8 border-t border-gray-300 text-center text-xs text-gray-500 font-serif">
        <p>© 2026 TAMDAN NEWS · Powered by Artificial Intelligent</p>
        <p className="mt-1">
          www.tamdan.news.by.ai.com · Released: 26 / Oct / 2025 · 6:00 AM
        </p>
      </footer>
    </div>
  );
}
