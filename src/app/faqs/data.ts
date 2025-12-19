export const faqData = [
  {
    question: "What is Tamdan?",
    answer: "Tamdan is a Personalized AI Search Agent System that provides a daily, personalized newsletter. Its purpose is to solve the problem of information overload by delivering exactly the content the user cares about."
  },
  {
    question: "How does Tamdan work?",
    answer: "Tamdan operates via a two-workflow automation system (n8n Agent) that executes daily at 6 AM. The AI pipeline follows four main steps: Interest Input (converting topics to queries), Searching (finding relevant content), Intelligent Filtering (selecting the most relevant results), and Content Synthesis (summarizing and providing source links)."
  },
  {
    question: "How will I receive my personalized news, and when?",
    answer: "Your personalized newsletter is generated and delivered every morning at 6 AM. The system utilizes a multi-channel delivery approach, sending the curated news via Email (using the Gmail API) and through the Telegram Bot."
  },
  {
    question: "How does Tamdan convert my vague interests into structured search queries?",
    answer: "In the Interest Input stage (Step 1), an AI agent (GPT-4o-mini via OpenRouter) is used to convert your natural language interests into up to high-quality search queries. This agent corrects spelling, infers meaning, and ensures the resulting queries target recent newsfrom diverse angles."
  },
  {
    question: "How does the system ensure the news content is fresh and high-quality?",
    answer: "The system ensures freshness by configuring the Brave Search API to search only for content published within the past day that are less than 24hrs old. For quality, the Intelligent Filtering stage utilizes AI agents to remove low-quality pages and filter outunwanted and irrelevant sources."
  },
  {
    question: "What core technologies and APIs power the Tamdan system?",
    answer: "Tamdan relies on n8n for workflow automation and uses Supabase as the PostgreSQL database for storing user and newsletter data. Key integrations include the Brave Search API for news discovery, Firecrawl for clean content extraction, and the OpenRouter API for orchestrating various LLM agents (GPT-4o variants)."
  },
  {
    question: "Are there plans for new features in the future?",
    answer: "The future roadmap for the Tamdan Personalized AI Search Agent System is structured across several phases to support enhanced personalization and robust scaling. Initial enhancements in Phase 1 focus on user experience, including implementing a user feedback loop (like thumbs up/down on articles) to improve content relevance. To achieve deep personalization in Phase 2, the system will introduce multi-language support (to translate summaries) and enable users to set custom delivery schedules per user, overriding the current fixed 6 AM daily delivery time. Long-term Phase 3 goals include the development of an ML-based topic recommendation engine, and feature expansion will aim to surpass the current limit on input topics by generating more than five high-quality search queries per topic,. Regarding system capacity, the architecture includes scaling recommendations necessary to handle up to 1,000 users. Though constrained by current budget limitations is the primary Brave API quota is limited for free trail. We would also like to explore with more intelligent and higher ends model within our project also."
  },
];
