/// sefty
// sefty
/// sefty

const clientId = 'a43aa0ff9fc54efcadfda8fea991461b'
const redirectUri = 'https://spotify-idle-page.vercel.app'
const scopes = 'user-read-playback-state user-read-currently-playing user-read-playback-position user-read-private user-top-read'

let accessToken = ''
let currentSongId = null

document.getElementById('login-button').addEventListener('click', () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`
  window.location.href = authUrl
})

function getAccessTokenFromUrl() {
  const hash = window.location.hash
  if (hash) {
    const params = new URLSearchParams(hash.substring(1))
    accessToken = params.get('access_token')
    window.location.hash = ''
  }
}

async function fetchCurrentSong() {
  if (!accessToken) return

  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (response.ok) {
    const data = await response.json()

    if (data.item) {
      const newSongId = data.item.id

      if (newSongId !== currentSongId) {
        currentSongId = newSongId

        const albumCover = document.getElementById('album-cover')
        const songTitle = document.getElementById('song-title')
        const songDesc = document.getElementById('desc')

        songTitle.classList.add('fade-out')
        songDesc.classList.add('fade-out')
        albumCover.classList.add('fade-out')

        setTimeout(() => {
          const cleanedTitle = data.item.name.replace(/\(feat\.[^\)]+\)/, '').trim()

          albumCover.src = data.item.album.images[0].url
          songTitle.textContent = cleanedTitle
          songDesc.textContent = `${data.item.artists.map(artist => artist.name).join(', ')} • ${data.item.album.name}`

          songTitle.classList.remove('fade-out')
          songDesc.classList.remove('fade-out')
          albumCover.classList.remove('fade-out')
          songTitle.classList.add('fade-in')
          songDesc.classList.add('fade-in')
          albumCover.classList.add('fade-in')

          setTimeout(() => {
            songTitle.classList.remove('fade-in')
            songDesc.classList.remove('fade-in')
            albumCover.classList.remove('fade-in')
          }, 500)
        }, 500)
      }
    } else {
      document.getElementById('song-title').textContent = 'No song is currently playing'
      document.getElementById('desc').textContent = ''
      document.getElementById('album-cover').src = ''
      currentSongId = null
    }
  } else {
    console.error(response.status, response.statusText)
  }
}

async function fetchQueue() {
  if (!accessToken) return

  const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (response.ok) {
    const data = await response.json()
    const queueList = document.getElementById('queue-list')
    queueList.innerHTML = ''

    data.queue.forEach(track => {
      const li = document.createElement('li')
      li.textContent = `${track.name.replace(/\(feat\.[^\)]+\)/, '').trim()} • ${track.artists.map(artist => artist.name).join(', ')}`
      queueList.appendChild(li)
    })
  } else if (response.status === 403) {
    document.getElementById('premium-info').style = 'display: block'
  } else {
    console.error(response.status, response.statusText)
  }
}

async function fetchUserProfile() {
  if (!accessToken) return

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (response.ok) {
    const data = await response.json()
    
    document.getElementById('profile-name').textContent = `${data.display_name || 'User'}`
    
    const profileImage = data.images.length > 0 ? data.images[0].url : 'default-profile-image.jpg'
    document.getElementById('profile-pic').src = profileImage

    if (data.product === 'premium') {
      document.getElementById('profile-status').textContent = 'Premium'
    } else {
      document.getElementById('profile-status').textContent = 'Free'
    }
  } else {
    console.error(response.status, response.statusText)
  }
}

function truncateTitle(title, maxLength = 8) {
  if (title.length > maxLength) {
    return title.slice(0, maxLength) + '...'
  }
  return title
}

async function fetchUserStats() {
  if (!accessToken) return

  try {
    const artistResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=3&time_range=short_term', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const songResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=3&time_range=short_term', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (artistResponse.ok && songResponse.ok) {
      const topArtists = await artistResponse.json()
      const topSongs = await songResponse.json()

      const artistElements = [
        { img: 'first=artist-img', name: 'first-artist-name' },
        { img: 'second=artist-img', name: 'second-artist-name' },
        { img: 'third=artist-img', name: 'third-artist-name' },
      ]

      topArtists.items.forEach((artist, index) => {
        if (artistElements[index]) {
          document.getElementById(artistElements[index].img).src = artist.images[0]?.url || 'default-artist.jpg'
          document.getElementById(artistElements[index].name).textContent = artist.name
        }
      })

      const songElements = [
        { img: 'first=song-img', name: 'first-song-name' },
        { img: 'second=song-img', name: 'second-song-name' },
        { img: 'third=song-img', name: 'third-song-name' },
      ]

      topSongs.items.forEach((song, index) => {
        if (songElements[index]) {
          document.getElementById(songElements[index].img).src = song.album.images[0]?.url || 'default-song.jpg'
          document.getElementById(songElements[index].name).textContent = song.name
        }
      })
    } else {
      console.error(artistResponse.status, songResponse.status)
    }
  } catch (error) {
    console.error(error)
  }
}

document.getElementById('menu-button').addEventListener('click', () => {
  const popupMenu = document.getElementById('popup-menu')
  const main = document.querySelector('main')
  
  if (popupMenu.style.display === 'none' || popupMenu.style.display === '') {
    popupMenu.style.display = 'flex'
    main.classList.add('background-blur')
  } else if (popupMenu.style.display === 'flex') {
    popupMenu.style.display = 'none'
    main.classList.remove('background-blur')
  }
})

function logout() {
  accessToken = ''

  document.getElementById('menu-button').style.display = 'none'
  document.getElementById('after-login').style.display = 'none'
  document.getElementById('login-button').style.display = 'block'
  document.getElementById('popup-menu').style.display = 'none'
  document.querySelector('main').classList.remove('background-blur')
}

document.getElementById('logout').addEventListener('click', () => {
  logout()
})

async function runScript() {
  if (accessToken) {
    document.getElementById('menu-button').style.display = 'block'
    document.getElementById('after-login').style.display = 'flex'
    document.getElementById('login-button').style.display = 'none'
    await fetchCurrentSong()
    await fetchQueue()
    await fetchUserProfile()
    await fetchUserStats()
  } else {
    document.getElementById('menu-button').style.display = 'none'
    document.getElementById('after-login').style.display = 'none'
    document.getElementById('login-button').style.display = 'block'
  }
}

getAccessTokenFromUrl()
runScript()
setInterval(runScript, 1000)


document.addEventListener("DOMContentLoaded", () => {
  // dark mode
  let darkmode = localStorage.getItem("darkmode")
  const darkModeBtn = document.getElementById("dark")

  const enableDarkMode = () => {
    document.body.classList.add("dark-mode")
    document.body.classList.remove("ultra-dark", "light-mode")
    localStorage.setItem("darkmode", "active")
    localStorage.setItem("ultradarkmode", null)
    localStorage.setItem("lightmode", null)
  }

  if (darkmode === "active") enableDarkMode()

  darkModeBtn?.addEventListener("click", () => {
    darkmode = localStorage.getItem("darkmode")
    if (darkmode !== "active") {
      enableDarkMode()
    }
  })

  // ultra dark mode
  let ultradarkmode = localStorage.getItem("ultradarkmode")
  const ultradarkModeBtn = document.getElementById("ultra-dark")

  const enableUltraDarkMode = () => {
    document.body.classList.add("ultra-dark")
    document.body.classList.remove("dark-mode", "light-mode")
    localStorage.setItem("ultradarkmode", "active")
    localStorage.setItem("darkmode", null)
    localStorage.setItem("lightmode", null)
  }

  if (ultradarkmode === "active") enableUltraDarkMode()

  ultradarkModeBtn?.addEventListener("click", () => {
    ultradarkmode = localStorage.getItem("ultradarkmode")
    if (ultradarkmode !== "active") {
      enableUltraDarkMode()
    }
  })

  // light mode
  let lightmode = localStorage.getItem("lightmode")
  const lightModeBtn = document.getElementById("light")

  const enableLightMode = () => {
    document.body.classList.add("light-mode")
    document.body.classList.remove("dark-mode", "ultra-dark")
    localStorage.setItem("lightmode", "active")
    localStorage.setItem("darkmode", null)
    localStorage.setItem("ultradarkmode", null)
  }

  if (lightmode === "active") enableLightMode()

  lightModeBtn?.addEventListener("click", () => {
    lightmode = localStorage.getItem("lightmode")
    if (lightmode !== "active") {
      enableLightMode()
    }
  })
})

const queueContainer = document.getElementById('queue-list');
const statsContainer = document.getElementById('stats-container');

function showQueue() {
  statsContainer.classList.remove('visible')
  statsContainer.classList.add('fade-out');

  queueContainer.classList.remove('fade-out')
  queueContainer.classList.add('fade-in')
}

function showStats() {
  queueContainer.classList.remove('visible')
  queueContainer.classList.add('fade-out')

  statsContainer.classList.remove('fade-out')
  statsContainer.classList.add('fade-in')
}

document.getElementById('queue-button').addEventListener('click', showQueue)
document.getElementById('stats-button').addEventListener('click', showStats)


document.getElementById("stats-button").addEventListener("click", () => {
  document.getElementById("queue-list").style.display = "none"
  document.getElementById("stats-container").style.display = "flex"
  document.getElementById("queue-button").classList.remove("chosen-control")
  document.getElementById("stats-button").classList.add("chosen-control")
})

document.getElementById("queue-button").addEventListener("click", () => {
  document.getElementById("queue-list").style.display = "block"
  document.getElementById("stats-container").style.display = "none"
  document.getElementById("queue-button").classList.add("chosen-control")
  document.getElementById("stats-button").classList.remove("chosen-control")
})