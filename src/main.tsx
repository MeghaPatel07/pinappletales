import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles/tokens.css'
import './styles/base.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container #root was not found in the document.')
}

const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Prerendered documents ship with markup inside #root, so hydrate those and
// only mount from scratch when the shell is empty (e.g. `vite dev`).
if (container.hasChildNodes()) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}
