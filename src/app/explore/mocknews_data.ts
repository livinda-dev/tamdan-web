export interface Article {
  url: string;
  summary: string;
  source_name: string;
  article_title: string;
}


export interface NewsTopic {
  articles: Article[];
  section_title: string;
  section_summary: string;
}

export interface NewsHeader {
  edition_name: string;
  subject_line: string;
  delivery_date: string;
  topics_covered: string[];
  // intro_paragraph: string;
}

export interface News{
  newsHeader: NewsHeader;
  newsTopics: NewsTopic[];
}

export interface NewsResponse {
  ok: boolean;
  newsletterId: number;
  newsHeader: NewsHeader;
  newsTopics: NewsTopic[];
}

export const mockNewsData: NewsResponse = {
  ok: true,
  newsletterId: 2,
  newsHeader: {
    edition_name: "Tamdan Mock newsletter",
    subject_line: "Cambodia-Thailand Border, Stock Market Rally, AI Coding Tools Growth",
    delivery_date: "2025-11-26",
    topics_covered: [
      "Cambodia-Thailand Border",
      "Stock Market",
      "AI Coding Tools"
    ],
    // intro_paragraph: "You do not have any new news updates for today yets. Here are some mock news articles covering recent events in Cambodia-Thailand border tensions, stock market rallies, and the growth of AI coding tools."
  },
  newsTopics: [
    {
      section_title: "Cambodia-Thailand Border Updates",
      section_summary: "Latest developments on the temporary border demarcation and tensions between Cambodia and Thailand.",
      articles: [
        {
          url: "https://cambojanews.com/cambodia-and-thailand-to-install-temporary-demarcation-border-posts-at-disputed-zones/",
          summary: "Cambodia and Thailand will begin installing temporary border posts on November 27 to demarcate disputed zones following a joint survey with aerial drone photography covering 5.3 kilometers. The temporary markers, located in contested villages such as Prey Chan and Chouk Chey, are intended to set clear boundaries based on historical legal documents, not to adjust territorial claims. Both countries have cooperated on border demarcation for nearly 20 years, but analysts caution that treating temporary lines as permanent could escalate tensions.",
          source_name: "CamboJA News",
          article_title: "Cambodia and Thailand to Install Temporary Demarcation Border Posts At Disputed Zones | CamboJA News"
        },
        {
          url: "https://www.khmertimeskh.com/501796098/cambodia-denies-thai-claims-of-new-landmines-and-drone-bases-at-border/",
          summary: "Cambodia has denied Thailand's claims that Cambodian forces are using casino buildings near the border for drone operations and that new anti-personnel mines have been laid along the Cambodia–Thailand border. The Cambodian Mine Action and Victim Assistance Authority stated that such claims lack credible evidence and require formal technical verification through joint investigations. The Cambodian side called for transparency and careful adherence to bilateral mechanisms amid ongoing border tensions and disputes.",
          source_name: "Khmer Times",
          article_title: "Cambodia denies Thai claims of new landmines and drone bases at border - Khmer Times"
        },
        {
          url: "https://www.khmertimeskh.com/501796396/video-rac-urges-calm-on-cambodia-thailand-border/",
          summary: "Yang Peou, Secretary-General of the Royal Academy of Cambodia, called for calm regarding the Cambodia-Thailand border issue, emphasizing that the temporary demarcation from posts 42 to 47 complies with international law and does not represent a loss or gain of territory. He highlighted that the border demarcation is a step to clarify ownership and prevent nationalist tensions, with the official border subject to parliamentary ratification. The approach is based on the French-Siamese Treaty, reinforcing that the land belongs to both countries under international law.",
          source_name: "Khmer Times",
          article_title: "VIDEO: RAC Urges Calm on Cambodia-Thailand Border - Khmer Times"
        }
      ]
    },
    {
      section_title: "Stock Market News",
      section_summary: "Coverage of recent stock market rallies, factors driving markets, and sector performance.",
      articles: [
        {
          url: "https://finance.yahoo.com/news/live/stock-market-today-dow-sp-500-nasdaq-rally-for-3rd-day-as-fed-rate-cut-hopes-grow-apple-and-alphabet-notch-records-210019302.html",
          summary: "On November 25, 2025, US stock markets rallied for the third consecutive day amid growing optimism for a Federal Reserve interest rate cut in December. The Dow Jones Industrial Average surged over 600 points, the S&P 500 rose 0.9%, and the Nasdaq advanced 0.7%, boosted by record highs in Apple and Alphabet shares. Market sentiment was also influenced by strong earnings reports and easing inflation data, while Nvidia shares declined due to increased competition from Google's AI chip developments.",
          source_name: "Yahoo Finance",
          article_title: "Stock market today: Dow, S&P 500, Nasdaq rally for 3rd day as Fed rate cut hopes grow, Apple and Alphabet notch records"
        },
        {
          url: "https://bloomberg.com/news/articles/2025-11-25/asian-stocks-set-to-extend-gains-on-fed-cut-hopes-markets-wrap",
          summary: "Global equities extended their rally into a fourth day due to increased bets on a Federal Reserve interest-rate cut, driven by weak US consumer data and the potential appointment of a pro–rate-cut official as the next Fed chair. Asian shares advanced, lifting MSCI's All Country World Index by 0.2%, while Treasuries maintained gains and the dollar weakened against most Group-of-10 currencies, with New Zealand's currency rising over 1%.",
          source_name: "Bloomberg",
          article_title: "Stock Market Today: Dow, S&P Live Updates for November 26 - Bloomberg"
        },
        {
          url: "https://www.thestreet.com/latest-news/stock-market-today-nasdaq-sp-500-moderate-after-overdue-september-retail-sales-report-disappoints",
          summary: "U.S. markets closed higher with the Russell 2000 gaining 2.16% and the Dow rising 1.43%, led by strong performances from retail and AI stocks. Nvidia and the technology sector lagged due to competition from Google's TPU chips and other macroeconomic factors. Key economic reports and earnings, including those from Alibaba and Dell, influenced market movements throughout the day.",
          source_name: "TheStreet",
          article_title: "Stock Market Today: Russell 2000 Shines With 2% Jump; Nvidia Sags as Google TPU Threat Comes into Picture - TheStreet"
        },
        {
          url: "https://finance.yahoo.com/news/us-stock-market-today-p-100959650.html",
          summary: "US stock futures slipped with S&P 500 contracts down around 0.1 percent as the 10-year Treasury yield dropped to 4.04 percent, its lowest in a month. This decline follows central bank officials suggesting potential lower rates due to weakening US jobs data, signaling slower economic growth and affecting sectors differently. Investors are weighing the benefits of lower borrowing costs against concerns over a slowing economy, impacting real estate, technology, manufacturing, and energy stocks.",
          source_name: "Simply Wall St",
          article_title: "US Stock Market Today: S&P 500 Futures Slip as Rate Cut Bets Rise Amid Weak Jobs Data"
        },
        {
          url: "https://economictimes.indiatimes.com/markets/stocks/news/ahead-of-market-10-things-that-will-decide-stock-market-action-on-wednesday/articleshow/125568855.cms",
          summary: "The article highlights key factors influencing the stock market on Wednesday, noting visible selling pressure near the 26,000 Nifty level but limited downside due to strong domestic fundamentals and a positive earnings outlook for the second half of the year. PSU banks and real estate stocks outperformed, supported by a revival in home loan demand and increased market share for PSU banks. The piece also discusses volatility driven by a weakening Rupee, FII outflows, and market reactions to US economic data and trade deal developments.",
          source_name: "The Economic Times",
          article_title: "Ahead of Market: 10 things that will decide stock market action on Wednesday - The Economic Times"
        }
      ]
    },
    {
      section_title: "New Framework Coding and AI Tools",
      section_summary: "Growth and impact of AI-powered coding tools enhancing developer productivity and software creation.",
      articles: [
        {
          url: "https://webpronews.com/ai-coding-tools-surpass-3-1b-revenue-set-for-26b-by-2030",
          summary: "AI coding tools have generated over $3.1 billion in revenue, driven by products like GitHub Copilot and Cursor that improve developer productivity by up to 55%. The market is projected to grow to $26 billion by 2030, facilitating the democratization of coding and transforming software development jobs, though challenges such as intellectual property concerns remain.",
          source_name: "WebProNews",
          article_title: "AI Coding Tools Surpass $3.1B Revenue, Set for $26B by 2030"
        },
        {
          url: "https://webpronews.com/ai-coding-tools-surpass-3-1b-revenue-set-for-26b-by-2030",
          summary: "AI coding tools like GitHub Copilot and Cursor have generated over $3.1 billion in revenue and are projected to reach $26 billion by 2030, significantly boosting developer productivity by up to 55%. This market growth is driven by advances in generative AI and increasing enterprise adoption, although challenges such as intellectual property concerns remain. The rise of these tools is transforming software development, democratizing coding, and evolving job roles within the industry.",
          source_name: "WebProNews",
          article_title: "AI Coding Tools Surpass $3.1B Revenue, Set for $26B by 2030"
        }
      ]
    }
  ]
};