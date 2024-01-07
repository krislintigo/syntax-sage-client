type LANGUAGES = 'fi-FI' | 'en-US'

export const useVoiceover = () => {
  if (window?.speechSynthesis) {
    // console.log('speech synthesis')
    speechSynthesis.onvoiceschanged = () => {
      console.log('voices changed')
    }
  }

  const getVoices = ({ language }: { language?: LANGUAGES }) => {
    const all = speechSynthesis.getVoices()
    return language ? all.filter((v) => v.lang === language) : all
  }

  const play = (
    text: string,
    { language, preset }: { language: LANGUAGES; preset?: string },
  ) => {
    const voices = getVoices({ language })
    const voice = voices.find((v) => v.name === preset)
    const synth = new SpeechSynthesisUtterance(text)
    synth.lang = language
    synth.voice = voice || voices[0]
    synth.rate = 0.8
    speechSynthesis.speak(synth)
  }

  return { getVoices, play }
}
