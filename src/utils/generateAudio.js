const generateAudio = (text) => {
  if ("speechSynthesis" in window) {
    const message = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(message);
  } else {
    console.error("Speech synthesis not supported");
  }
};

export default generateAudio;
