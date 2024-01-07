const LANGUAGES = {
  en: 'en-US',
  fi: 'fi-FI',
}

export const useVoiceover = () => {
  const play = (
    text: string,
    { language }: { language: keyof typeof LANGUAGES },
  ) => {
    const synth = new SpeechSynthesisUtterance(text)
    synth.lang = LANGUAGES[language]
    speechSynthesis.speak(synth)
  }

  return { play }
}
