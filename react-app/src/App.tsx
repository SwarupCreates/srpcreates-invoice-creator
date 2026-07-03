import { useEffect, useState } from 'react'
import './App.css'

type UserProfile = {
  login: string
  avatarUrl: string
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const storedLogin = localStorage.getItem('gh_login')
    const storedAvatar = localStorage.getItem('gh_avatar')

    if (storedLogin && storedAvatar) {
      setUser({ login: storedLogin, avatarUrl: storedAvatar })
      return
    }

    const params = new URLSearchParams(window.location.search)
    const login = params.get('login')
    const avatar = params.get('avatar')

    if (login && avatar) {
      const profile = { login, avatarUrl: avatar }
      setUser(profile)
      localStorage.setItem('gh_login', login)
      localStorage.setItem('gh_avatar', avatar)
      window.history.replaceState({}, document.title, '/')
    }
  }, [])

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github/login'
  }

  const handleLogout = () => {
    localStorage.removeItem('gh_login')
    localStorage.removeItem('gh_avatar')
    setUser(null)
  }

  return (
    <main className="app-shell">
      <section className="card">
        {!user ? (
          <>
            <p className="eyebrow">Hello world, please login.</p>
            <h1>Invoice Generator</h1>
            <p className="subtitle">
              Sign in with GitHub to continue using the app.
            </p>
            <button type="button" className="primary-button" onClick={handleGitHubLogin}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="github-icon">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577
                    0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73
                    1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.805 1.305 3.49.998.108-.775.42-1.305.763-1.605-2.665-.305-5.467-1.335-5.467-5.933
                    0-1.31.468-2.382 1.236-3.22-.124-.303-.536-1.525.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404
                    2.29-1.552 3.296-1.23 3.296-1.23.655 1.65.243 2.873.12 3.176.77.838 1.235 1.91 1.235 3.22
                    0 4.61-2.807 5.625-5.48 5.92.43.37.814 1.1.814 2.22 0 1.605-.015 2.896-.015 3.286
                    0 .32.216.694.825.576C20.565 21.795 24 17.297 24 12c0-6.63-5.37-12-12-12Z"
                />
              </svg>
              Continue with GitHub
            </button>
          </>
        ) : (
          <>
            <p className="eyebrow">Hello world</p>
            <h1>Welcome to Invoice Generator</h1>
            <div className="profile-card">
              <img src={user.avatarUrl} alt={`${user.login} avatar`} className="avatar" />
              <div>
                <p className="signed-in">Signed in as</p>
                <p className="profile-login">{user.login}</p>
              </div>
            </div>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        )}
      </section>
    </main>
  )
}

export default App
