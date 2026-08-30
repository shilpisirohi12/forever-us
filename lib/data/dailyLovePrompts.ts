export type DailyLoveCategory = 'sweet' | 'funny' | 'memory' | 'deep' | 'date' | 'flirty';

export type DailyLovePrompt = {
  category: DailyLoveCategory;
  prompt: string;
};

export const DAILY_LOVE_PROMPTS: DailyLovePrompt[] = [
  { category: 'sweet', prompt: 'What’s one thing your partner did recently that made you smile?' },
  { category: 'memory', prompt: 'What’s your favorite memory of the two of you?' },
  { category: 'sweet', prompt: 'What’s one thing you appreciate about your partner today?' },
  { category: 'memory', prompt: 'What was your first impression of your partner?' },
  { category: 'sweet', prompt: 'What’s something your partner does that instantly makes you feel loved?' },
  { category: 'memory', prompt: 'If you could relive one day together, which day would you choose?' },
  { category: 'sweet', prompt: 'What’s your favorite thing about your partner’s personality?' },
  { category: 'funny', prompt: 'What tiny habit of your partner do you secretly find adorable?' },
  { category: 'sweet', prompt: 'What’s something your partner is really good at but doesn’t get enough credit for?' },
  { category: 'deep', prompt: 'Describe your partner using only three words.' },
  { category: 'memory', prompt: 'What song makes you think of your relationship?' },
  { category: 'date', prompt: 'Where would you take your partner on a surprise date tonight?' },
  { category: 'funny', prompt: 'What’s the funniest thing you’ve experienced together?' },
  { category: 'deep', prompt: 'What’s one thing you hope you’re still doing together when you’re 70?' },
  { category: 'memory', prompt: 'What’s your favorite photo of the two of you, and why?' },
  { category: 'sweet', prompt: 'What’s one thing your partner does better than you?' },
  { category: 'deep', prompt: 'What’s something about your relationship that you’re proud of?' },
  { category: 'date', prompt: 'What’s one place you’d love to travel to together?' },
  { category: 'date', prompt: 'What’s your ideal lazy Sunday together?' },
  { category: 'date', prompt: 'What’s one meal you’d love your partner to make for you?' },
  { category: 'sweet', prompt: 'What’s your favorite nickname for your partner?' },
  { category: 'sweet', prompt: 'What’s one thing your partner could do tonight that would make your day better?' },
  { category: 'funny', prompt: 'Which movie or TV couple reminds you most of the two of you?' },
  { category: 'funny', prompt: 'If your relationship had a movie title, what would it be?' },
  { category: 'flirty', prompt: 'What’s your partner’s most attractive quality?' },
  { category: 'sweet', prompt: 'What’s one compliment you think your partner needs to hear today?' },
  { category: 'date', prompt: 'What’s something new you’d love to try together?' },
  { category: 'funny', prompt: 'What’s one silly thing you love about your relationship?' },
  { category: 'sweet', prompt: 'What’s your favorite way your partner shows affection?' },
  { category: 'funny', prompt: 'What’s something your partner does that always makes you laugh?' },
  { category: 'date', prompt: 'If you had an unexpected free day tomorrow, how would you spend it together?' },
  { category: 'memory', prompt: 'What’s one date you’ve had that you’d happily repeat?' },
  { category: 'deep', prompt: 'What’s one thing you’ve learned from your partner?' },
  { category: 'deep', prompt: 'What’s something you think the two of you make a great team at?' },
  { category: 'sweet', prompt: 'What ordinary moment together makes you surprisingly happy?' },
  { category: 'deep', prompt: 'What’s one thing you want more of in your relationship this month?' },
  { category: 'date', prompt: 'What’s your favorite thing to do together at home?' },
  { category: 'date', prompt: 'What would your perfect date night look like right now?' },
  { category: 'flirty', prompt: 'What’s something about your partner that still gives you butterflies?' },
  { category: 'sweet', prompt: 'What’s one thing you want to thank your partner for?' },
  { category: 'flirty', prompt: 'What’s your favorite way to be kissed? 😘' },
  { category: 'flirty', prompt: 'What outfit of your partner’s do you find especially attractive?' },
  { category: 'flirty', prompt: 'When do you find your partner most irresistible? 👀' },
  { category: 'flirty', prompt: 'What’s your favorite kind of physical affection from your partner?' },
  { category: 'flirty', prompt: 'If you could whisper one thing in your partner’s ear right now, what would you say?' },
  { category: 'flirty', prompt: 'Choose one for tonight: cuddle 🫂, massage 💆, kiss 💋, or surprise 🎁?' },
  { category: 'date', prompt: 'What’s one romantic thing you’d love your partner to surprise you with?' },
  { category: 'memory', prompt: 'Finish the sentence: “I knew I loved you when…”' },
  { category: 'deep', prompt: 'Finish the sentence: “Life with you is better because…”' },
  { category: 'flirty', prompt: 'Finish the sentence: “Tonight, I want us to…” ❤️' },
];

const categoryCycle: DailyLoveCategory[] = ['sweet', 'memory', 'deep', 'date', 'funny', 'flirty'];

export function getDailyLovePromptIndex(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const category = categoryCycle[day % categoryCycle.length];
  const matches = DAILY_LOVE_PROMPTS.map((prompt, index) => ({ prompt, index })).filter(({ prompt }) => prompt.category === category);
  return matches[day % matches.length].index;
}
