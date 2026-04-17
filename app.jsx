import React, { useEffect, useMemo, useState } from "react";

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const RULES = [
  {
    id: 1,
    label: "x + 3",
    hint: "Legg til 3",
    apply: (x) => x + 3,
  },
  {
    id: 2,
    label: "x - 2",
    hint: "Trekk fra 2",
    apply: (x) => x - 2,
  },
  {
    id: 3,
    label: "2x",
    hint: "Gang med 2",
    apply: (x) => x * 2,
  },
  {
    id: 4,
    label: "3x",
    hint: "Gang med 3",
    apply: (x) => x * 3,
  },
  {
    id: 5,
    label: "x + 5",
    hint: "Legg til 5",
    apply: (x) => x + 5,
  },
  {
    id: 6,
    label: "2x + 1",
    hint: "Gang med 2 og legg til 1",
    apply: (x) => x * 2 + 1,
  },
];

function getRandomRule() {
  return RULES[Math.floor(Math.random() * RULES.length)];
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
  const [rule, setRule] = useState(getRandomRule());
  const [history, setHistory] = useState([]);
  const [latestOutput, setLatestOutput] = useState(null);
  const [selectedGuess, setSelectedGuess] = useState("");
  const [feedback, setFeedback] = useState("Test noen tall og finn mønsteret.");
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(90);

  useEffect(() => {
    if (solved || timeLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [solved, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !solved) {
      setFeedback(`Tiden er ute. Regelen var ${rule.label}.`);
    }
  }, [timeLeft, solved, rule]);

  const options = useMemo(() => {
    const wrongOptions = RULES.filter((item) => item.label !== rule.label)
      .map((item) => item.label)
      .slice(0, 3);

    return shuffle([rule.label, ...wrongOptions]);
  }, [rule]);

  function testNumber(value) {
    if (solved || timeLeft === 0) return;

    const output = rule.apply(value);
    setLatestOutput(output);
    setHistory((prev) => [...prev, { input: value, output }]);
    setFeedback(`Du testet ${value}, og fabrikken ga ${output}. Hva kan regelen være?`);
  }

  function chooseAnswer(option) {
    if (solved || timeLeft === 0) return;

    setSelectedGuess(option);

    if (option === rule.label) {
      setSolved(true);
      setScore((prev) => prev + Math.max(10, timeLeft));
      setFeedback(`Riktig. Fabrikken bruker regelen ${rule.label}.`);
    } else {
      setFeedback("Ikke helt riktig. Test flere tall og sammenlign resultatene.");
    }
  }

  function nextRound() {
    setRule(getRandomRule());
    setHistory([]);
    setLatestOutput(null);
    setSelectedGuess("");
    setFeedback("Test noen tall og finn mønsteret.");
    setSolved(false);
    setShowHint(false);
    setRound((prev) => prev + 1);
    setTimeLeft(90);
  }

  const progressPercent = Math.max(0, (timeLeft / 90) * 100);

  return (
    <div className="page">
      <div className="container">
        <h1>Likningsfabrikken</h1>
        <p className="subtitle">
          Velg et tall på venstre side, send det gjennom maskinen, og finn den skjulte regelen.
        </p>

        <div className="top-grid">
          <div>
            <section className="card">
              <div className="machine-grid">
                <div>
                  <h2>Tall inn</h2>
                  <div className="digit-grid">
                    {DIGITS.map((digit) => (
                      <button
                        key={digit}
                        className="digit-button"
                        onClick={() => testNumber(digit)}
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="machine-box">
                  <div className="machine-inner">Skjult matematikk-fabrikk</div>
                </div>

                <div>
                  <h2>Tall ut</h2>
                  <div className="output-box">
                    {latestOutput === null ? (
                      <div className="muted">Send et tall gjennom maskinen</div>
                    ) : (
                      <>
                        <div className="small-label">Resultat</div>
                        <div className="output-number">{latestOutput}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <h2>Forsøk denne runden</h2>
              <div className="history-grid">
                {history.length === 0 ? (
                  <div className="history-item">Ingen tall testet ennå.</div>
                ) : (
                  history.map((entry, index) => (
                    <div
                      key={`${entry.input}-${entry.output}-${index}`}
                      className="history-item"
                    >
                      <div className="small-label">Test {index + 1}</div>
                      <div className="history-value">
                        {entry.input} → {entry.output}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="card">
            <div className="stats-grid">
              <div className="stat-box">
                <div className="small-label">Poeng</div>
                <div className="stat-number">{score}</div>
              </div>
              <div className="stat-box">
                <div className="small-label">Runde</div>
                <div className="stat-number">{round}</div>
              </div>
            </div>

            <div className="small-label">Tid igjen: {timeLeft} sekunder</div>
            <div className="progress-outer">
              <div
                className="progress-inner"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <h2>Hva tror du regelen er?</h2>
            <div className="answer-list">
              {options.map((option) => (
                <button
                  key={option}
                  className={`answer-button ${
                    selectedGuess === option ? "selected" : ""
                  }`}
                  onClick={() => chooseAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="hint-box">
              <div className="hint-title">Hint</div>
              <div className="hint-text">
                {showHint
                  ? rule.hint
                  : "Klikk for å vise et hint hvis eleven trenger støtte."}
              </div>
              <button className="secondary-button" onClick={() => setShowHint((prev) => !prev)}>
                {showHint ? "Skjul hint" : "Vis hint"}
              </button>
            </div>

            <div className="feedback-box">{feedback}</div>

            <div className="button-row">
              <button className="primary-button" onClick={nextRound}>
                Neste runde
              </button>
              <button className="secondary-button" onClick={nextRound}>
                Start på nytt
              </button>
            </div>

            <p className="note">
              Denne versjonen er laget for å være enkel å kjøre på GitHub Pages.
            </p>
          </aside>
        </div>

        <section className="card">
          <h2>Videre utvikling</h2>
          <div className="footer-grid">
            <div className="idea-box">
              <strong>Enkle nivåer</strong>
              <p>Start med addisjon og subtraksjon før du åpner for multiplikasjon og sammensatte regler.</p>
            </div>
            <div className="idea-box">
              <strong>Lærermodus</strong>
              <p>La lærer velge hvilke regelfamilier som skal være med i økten.</p>
            </div>
            <div className="idea-box">
              <strong>Fritekst-svar</strong>
              <p>Bytt ut flervalg med et felt der eleven skriver sin egen hypotese om regelen.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}