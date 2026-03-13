import { useState, useEffect } from 'react'
import './App.css'

// ── VOCABULARY BANKS ──────────────────────────────────────────────
const BANKS = [
  {
    id: 'bank1',
    name: 'Banque 1',
    description: 'Émotions, apparence & société',
    emoji: '📖',
    color: 'indigo',
    cards: [
      { en: 'amazement', fr: 'étonnement' },
      { en: 'bloom', fr: 'floraison (ou éclat selon le contexte)' },
      { en: 'burdened', fr: 'accablé' },
      { en: 'coarse', fr: 'grossier' },
      { en: 'dazed', fr: 'abasourdi' },
      { en: 'devotion', fr: 'dévouement' },
      { en: 'discovery', fr: 'découverte' },
      { en: 'dreadful', fr: 'épouvantable' },
      { en: 'fashionable', fr: 'à la mode' },
      { en: 'fame', fr: 'célébrité' },
      { en: 'flush', fr: 'rougir' },
      { en: 'frown', fr: 'froncer les sourcils' },
      { en: 'gratifying', fr: 'gratifiant' },
      { en: 'harshly', fr: 'durement' },
      { en: 'hatred', fr: 'haine' },
      { en: 'hideous', fr: 'hideux' },
      { en: 'loathe', fr: 'détester' },
      { en: "make one's debut", fr: 'faire ses débuts' },
      { en: 'marvelous', fr: 'merveilleux' },
      { en: 'overemphasize', fr: 'exagérer (ou trop insister sur)' },
      { en: 'panegyric', fr: 'éloge' },
      { en: 'prejudiced', fr: 'partial / prévenu' },
      { en: 'puzzled', fr: 'perplexe' },
      { en: 'rough', fr: 'rude, brusque (manières) / rugueux (surface)' },
      { en: 'sin', fr: 'péché' },
      { en: 'uncouth', fr: 'grossier' },
      { en: 'ungainly', fr: 'gauche, maladroit' },
      { en: 'untarnished', fr: 'intact' },
      { en: 'wizened', fr: 'flétri' },
      { en: 'worship', fr: 'vénérer' },
      { en: 'wrinkled', fr: 'ridé' },
      { en: 'wretch', fr: 'misérable' },
    ],
  },
  // Add more banks here in the future
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── CONTEXT MENU ──────────────────────────────────────────────────
function ContextMenu({ x, y, onRename, onDelete, onClose }) {
  useEffect(() => {
    const close = () => onClose()
    window.addEventListener('click', close)
    window.addEventListener('contextmenu', close)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('contextmenu', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="ctx-menu"
      style={{ top: y, left: x }}
      onClick={e => e.stopPropagation()}
    >
      <button className="ctx-menu-item" onClick={onRename}>
        ✏️ Renommer
      </button>
      <button className="ctx-menu-item ctx-menu-item-danger" onClick={onDelete}>
        🗑️ Supprimer
      </button>
    </div>
  )
}

// ── CONFIRM DELETE MODAL ───────────────────────────────────────────
function ConfirmDeleteModal({ bankName, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="rename-overlay" onClick={onCancel}>
      <div className="rename-modal" onClick={e => e.stopPropagation()}>
        <p className="rename-title">Supprimer la banque</p>
        <p className="delete-confirm-text">
          Voulez-vous vraiment supprimer <strong>"{bankName}"</strong> ?<br />
          Cette action est irréversible.
        </p>
        <div className="rename-actions">
          <button className="btn-home" onClick={onCancel}>Annuler</button>
          <button className="btn-delete-confirm" onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  )
}

// ── RENAME MODAL ──────────────────────────────────────────────────
function RenameModal({ currentName, onConfirm, onCancel }) {
  const [value, setValue] = useState(currentName)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm(value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [value, onConfirm, onCancel])

  return (
    <div className="rename-overlay" onClick={onCancel}>
      <div className="rename-modal" onClick={e => e.stopPropagation()}>
        <p className="rename-title">Renommer la banque</p>
        <input
          className="rename-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
          maxLength={40}
        />
        <div className="rename-actions">
          <button className="btn-home" onClick={onCancel}>Annuler</button>
          <button className="btn-restart" onClick={() => onConfirm(value)}>Confirmer</button>
        </div>
      </div>
    </div>
  )
}

// ── CREATE BANK MODAL ─────────────────────────────────────────────
function CreateBankModal({ onConfirm, onCancel }) {
  const [name, setName] = useState('')
  const [wordsText, setWordsText] = useState('')
  const [error, setError] = useState('')

  function parseWords(text) {
    return text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => {
        const sep = l.includes('→') ? '→' : l.includes('->') ? '->' : l.includes(' - ') ? ' - ' : null
        if (!sep) return null
        const [en, ...rest] = l.split(sep)
        const fr = rest.join(sep).trim()
        return en.trim() && fr ? { en: en.trim(), fr } : null
      })
      .filter(Boolean)
  }

  function handleConfirm() {
    if (!name.trim()) { setError('Donnez un nom à la banque.'); return }
    const cards = parseWords(wordsText)
    if (cards.length === 0) { setError('Aucun mot valide trouvé. Format attendu : anglais → français'); return }
    onConfirm({ name: name.trim(), cards })
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const preview = parseWords(wordsText)

  return (
    <div className="rename-overlay" onClick={onCancel}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <p className="rename-title">Nouvelle banque de vocabulaire</p>

        <div className="create-field">
          <label className="create-label">Nom de la banque</label>
          <input
            className="rename-input"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="ex : Chapitre 3 — Nature"
            autoFocus
            maxLength={40}
          />
        </div>

        <div className="create-field">
          <label className="create-label">
            Mots (un par ligne, format&nbsp;: <code>anglais → français</code>)
          </label>
          <textarea
            className="create-textarea"
            value={wordsText}
            onChange={e => { setWordsText(e.target.value); setError('') }}
            placeholder={"serene → serein\nbliss → bonheur\nwither → se faner"}
            rows={7}
          />
          {preview.length > 0 && (
            <p className="create-preview-count">✓ {preview.length} mot{preview.length > 1 ? 's' : ''} reconnu{preview.length > 1 ? 's' : ''}</p>
          )}
        </div>

        {error && <p className="create-error">{error}</p>}

        <div className="rename-actions">
          <button className="btn-home" onClick={onCancel}>Annuler</button>
          <button className="btn-restart" onClick={handleConfirm}>Créer</button>
        </div>
      </div>
    </div>
  )
}

// ── SCREEN 1 : BANK SELECTION ─────────────────────────────────────
function BankSelect({ onSelect, bankNames, deletedBanks, customBanks, onRightClick, contextMenu, onContextMenuClose, onRenameStart, onDeleteStart, onCreateClick }) {
  const visibleBuiltin = BANKS.filter(b => !deletedBanks.includes(b.id))
  const visibleCustom  = customBanks.filter(b => !deletedBanks.includes(b.id))
  const allBanks = [...visibleBuiltin, ...visibleCustom]

  return (
    <div className="mode-screen">
      <div className="mode-header">
        <h1>Vocabulary Flash Cards</h1>
        <p className="subtitle">Choisissez une banque de vocabulaire</p>
      </div>

      <div className="bank-list">
        {allBanks.map(bank => {
          const displayName = bankNames[bank.id] ?? bank.name
          return (
            <button
              key={bank.id}
              className={`bank-card bank-${bank.color}`}
              onClick={() => onSelect(bank)}
              onContextMenu={e => onRightClick(bank.id, e)}
              title="Clic droit pour renommer ou supprimer"
            >
              <span className="bank-emoji">{bank.emoji}</span>
              <div className="bank-info">
                <span className="bank-name">{displayName}</span>
                <span className="bank-desc">{bank.description}</span>
              </div>
              <span className="bank-count">{bank.cards.length} mots</span>
              <span className="bank-chevron">›</span>
            </button>
          )
        })}

        <button className="bank-card bank-add" onClick={onCreateClick}>
          <span className="bank-emoji">➕</span>
          <div className="bank-info">
            <span className="bank-name">Nouvelle banque</span>
            <span className="bank-desc">Ajouter vos propres mots</span>
          </div>
        </button>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={() => { onContextMenuClose(); onRenameStart(contextMenu.bankId) }}
          onDelete={() => { onContextMenuClose(); onDeleteStart(contextMenu.bankId) }}
          onClose={onContextMenuClose}
        />
      )}
    </div>
  )
}

// ── SCREEN 2 : MODE SELECTION ─────────────────────────────────────
function ModeSelect({ bank, onSelect, onBack }) {
  return (
    <div className="mode-screen">
      <button className="btn-back-top" onClick={onBack}>← Banques</button>

      <div className="mode-header">
        <div className="selected-bank-tag">
          {bank.emoji} {bank.name} · {bank.cards.length} mots
        </div>
        <h1>Choisissez un mode</h1>
        <p className="subtitle">{bank.description}</p>
      </div>

      <div className="mode-cards">
        <button className="mode-card mode-en" onClick={() => onSelect('en')}>
          <span className="mode-flag">🇬🇧</span>
          <span className="mode-title">Anglais → Français</span>
          <span className="mode-desc">Le mot anglais s'affiche, retournez pour voir la traduction</span>
          <div className="mode-preview">
            <div className="preview-front">
              <span className="preview-tag">EN</span>
              <span className="preview-word">marvelous</span>
            </div>
            <span className="preview-arrow">→</span>
            <div className="preview-back fr">
              <span className="preview-tag fr">FR</span>
              <span className="preview-word">merveilleux</span>
            </div>
          </div>
        </button>

        <button className="mode-card mode-fr" onClick={() => onSelect('fr')}>
          <span className="mode-flag">🇫🇷</span>
          <span className="mode-title">Français → Anglais</span>
          <span className="mode-desc">Le mot français s'affiche, retournez pour voir l'anglais</span>
          <div className="mode-preview">
            <div className="preview-front fr">
              <span className="preview-tag fr">FR</span>
              <span className="preview-word">merveilleux</span>
            </div>
            <span className="preview-arrow">→</span>
            <div className="preview-back">
              <span className="preview-tag">EN</span>
              <span className="preview-word">marvelous</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('bank') // 'bank' | 'mode' | 'game'
  const [selectedBank, setSelectedBank] = useState(null)
  const [mode, setMode] = useState(null)
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [noTransition, setNoTransition] = useState(false)
  const [bankNames, setBankNames] = useState({})
  const [deletedBanks, setDeletedBanks] = useState([])
  const [contextMenu, setContextMenu] = useState(null) // { bankId, x, y }
  const [renaming, setRenaming] = useState(null)       // { bankId, currentName }
  const [confirmDelete, setConfirmDelete] = useState(null) // { bankId, bankName }

  useEffect(() => {
    if (noTransition) {
      const t = setTimeout(() => setNoTransition(false), 50)
      return () => clearTimeout(t)
    }
  }, [noTransition])

  function handleRightClick(bankId, e) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ bankId, x: e.clientX, y: e.clientY })
  }

  function handleDeleteStart(bankId) {
    const bank = BANKS.find(b => b.id === bankId)
    const name = bankNames[bankId] ?? bank.name
    setConfirmDelete({ bankId, bankName: name })
  }

  function handleDeleteConfirm() {
    setDeletedBanks(prev => [...prev, confirmDelete.bankId])
    setConfirmDelete(null)
  }

  function handleRenameStart(bankId) {
    const bank = BANKS.find(b => b.id === bankId)
    const currentName = bankNames[bankId] ?? bank.name
    setRenaming({ bankId, currentName })
  }

  function handleRenameConfirm(newName) {
    if (newName.trim()) {
      setBankNames(prev => ({ ...prev, [renaming.bankId]: newName.trim() }))
      // update selectedBank display name if it's the one being renamed
      if (selectedBank?.id === renaming.bankId) {
        setSelectedBank(prev => ({ ...prev, name: newName.trim() }))
      }
    }
    setRenaming(null)
  }

  function selectBank(bank) {
    setSelectedBank(bank)
    setScreen('mode')
  }

  function startGame(selectedMode) {
    setMode(selectedMode)
    setDeck(shuffle(selectedBank.cards))
    setIndex(0)
    setFlipped(false)
    setShowAll(false)
    setCorrectCount(0)
    setWrongCount(0)
    setFinished(false)
    setFeedback(null)
    setScreen('game')
  }

  function goToModeSelect() {
    setScreen('mode')
    setFinished(false)
    setShowAll(false)
  }

  function goToBankSelect() {
    setScreen('bank')
    setFinished(false)
    setShowAll(false)
  }

  function handleAnswer(isCorrect) {
    setFeedback(isCorrect ? 'correct' : 'wrong')

    setTimeout(() => {
      setNoTransition(true)
      setFlipped(false)
      setFeedback(null)

      setDeck(prev => {
        let next = [...prev]
        if (isCorrect) {
          setCorrectCount(c => c + 1)
          next.splice(index, 1)
          if (next.length === 0) {
            setFinished(true)
            return next
          }
          const newIndex = index >= next.length ? next.length - 1 : index
          setIndex(newIndex)
        } else {
          setWrongCount(c => c + 1)
          const [card] = next.splice(index, 1)
          const remaining = next.length - index
          const offset = remaining > 1
            ? Math.floor(Math.random() * (remaining - 1)) + 1
            : 1
          next.splice(Math.min(index + offset, next.length), 0, card)
          const newIndex = index >= next.length ? next.length - 1 : index
          setIndex(newIndex)
        }
        return next
      })
    }, 600)
  }

  // ── SCREEN: BANK ──
  if (screen === 'bank') {
    return (
      <>
        <BankSelect
          onSelect={selectBank}
          bankNames={bankNames}
          deletedBanks={deletedBanks}
          onRightClick={handleRightClick}
          contextMenu={contextMenu}
          onContextMenuClose={() => setContextMenu(null)}
          onRenameStart={handleRenameStart}
          onDeleteStart={handleDeleteStart}
        />
        {renaming && (
          <RenameModal
            currentName={renaming.currentName}
            onConfirm={handleRenameConfirm}
            onCancel={() => setRenaming(null)}
          />
        )}
        {confirmDelete && (
          <ConfirmDeleteModal
            bankName={confirmDelete.bankName}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </>
    )
  }

  // ── SCREEN: MODE ──
  if (screen === 'mode') {
    const bankForMode = { ...selectedBank, name: bankNames[selectedBank.id] ?? selectedBank.name }
    return <ModeSelect bank={bankForMode} onSelect={startGame} onBack={goToBankSelect} />
  }

  // ── SCREEN: FINISH ──
  if (finished) {
    return (
      <div className="mode-screen">
        <div className="finish-screen">
          <div className="finish-icon">🎉</div>
          <h2>Félicitations !</h2>
          <p>Vous avez maîtrisé tous les mots !</p>
          <div className="finish-stats">
            <div className="stat correct">
              <span className="stat-num">{correctCount}</span>
              <span className="stat-label">Justes</span>
            </div>
            <div className="stat wrong">
              <span className="stat-num">{wrongCount}</span>
              <span className="stat-label">Erreurs</span>
            </div>
          </div>
          <div className="finish-actions">
            <button className="btn-restart" onClick={() => startGame(mode)}>Rejouer</button>
            <button className="btn-home" onClick={goToModeSelect}>Changer de mode</button>
            <button className="btn-home" onClick={goToBankSelect}>Changer de banque</button>
          </div>
        </div>
      </div>
    )
  }

  // ── SCREEN: GAME ──
  const current = deck[index]
  const total = selectedBank.cards.length
  const remaining = deck.length

  const frontWord = mode === 'en' ? current.en : current.fr
  const backWord  = mode === 'en' ? current.fr : current.en
  const frontLang = mode === 'en' ? 'EN' : 'FR'
  const backLang  = mode === 'en' ? 'FR' : 'EN'

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <button className="btn-back" onClick={goToModeSelect}>← Modes</button>
          <span className={`mode-badge ${mode}`}>
            {mode === 'en' ? '🇬🇧 EN → FR' : '🇫🇷 FR → EN'}
          </span>
        </div>
        <h1>Vocabulary Flash Cards</h1>
        <div className="game-bank-tag">{selectedBank.emoji} {selectedBank.name}</div>
      </header>

      <div className="tabs">
        <button className={!showAll ? 'tab active' : 'tab'} onClick={() => setShowAll(false)}>
          Flash Cards
        </button>
        <button className={showAll ? 'tab active' : 'tab'} onClick={() => setShowAll(true)}>
          Tous les mots
        </button>
      </div>

      {!showAll ? (
        <>
          <div className="score-row">
            <span className="score-item correct-score">✓ {correctCount} justes</span>
            <span className="score-remaining">{remaining} restantes</span>
            <span className="score-item wrong-score">✗ {wrongCount} erreurs</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill correct-fill"
              style={{ width: `${((total - remaining) / total) * 100}%` }}
            />
          </div>

          <div
            className={`card-scene ${feedback ? `feedback-${feedback}` : ''}`}
            onClick={() => !flipped && setFlipped(true)}
          >
            <div className={`card ${flipped ? 'flipped' : ''} ${noTransition ? 'no-transition' : ''}`}>
              <div className={`card-face card-front ${mode}`}>
                <span className={`lang-tag ${mode}`}>{frontLang}</span>
                <p className="word">{frontWord}</p>
                {!flipped && <p className="hint">Cliquez pour voir la réponse</p>}
              </div>
              <div className={`card-face card-back ${mode === 'en' ? 'fr' : 'en'}`}>
                <span className={`lang-tag ${mode === 'en' ? 'fr' : ''}`}>{backLang}</span>
                <p className="word">{backWord}</p>
                <p className={`hint ${mode === 'en' ? 'en-hint' : 'fr-hint'}`}>{frontWord}</p>
              </div>
            </div>
          </div>

          {flipped && !feedback && (
            <div className="answer-buttons">
              <button className="btn-wrong" onClick={() => handleAnswer(false)}>
                <span className="btn-icon">✗</span>
                Faux
              </button>
              <button className="btn-correct" onClick={() => handleAnswer(true)}>
                <span className="btn-icon">✓</span>
                Juste
              </button>
            </div>
          )}

          {!flipped && (
            <p className="flip-hint">Retournez la carte avant de répondre</p>
          )}
        </>
      ) : (
        <div className="all-words">
          {selectedBank.cards.map((c, i) => {
            const inDeck = deck.some(d => d.en === c.en)
            return (
              <div key={i} className={`word-row ${!inDeck ? 'mastered' : ''}`}>
                {!inDeck && <span className="mastered-badge">✓</span>}
                <span className={`word-primary ${mode}`}>
                  {mode === 'en' ? c.en : c.fr}
                </span>
                <span className="arrow">→</span>
                <span className="word-secondary">
                  {mode === 'en' ? c.fr : c.en}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
