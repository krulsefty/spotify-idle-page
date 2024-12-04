/// sefty
// sefty
/// sefty

const clientId = 'a43aa0ff9fc54efcadfda8fea991461b'
const redirectUri = 'http://127.0.0.1:5500/index.html'
const scopes = 'user-read-playback-state user-read-currently-playing user-read-playback-position user-read-private'

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
  if (!accessToken) return;

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
    console.error('Error fetching song:', response.status, response.statusText)
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
    console.error('Error fetching queue:', response.status, response.statusText)
  }
}

async function fetchUserProfile() {
  if (!accessToken) return;

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (response.ok) {
    const data = await response.json()
    
    document.getElementById('profile-name').textContent = `${data.display_name || 'User'}`
    
    const profileImage = data.images.length > 0 ? data.images[0].url : 'default-profile-image.jpg'
    document.getElementById('profile-pic').src = profileImage

    if (data.product === 'premium') {
      document.getElementById('profile-status').textContent = 'Premium';
    } else {
      document.getElementById('profile-status').textContent = 'Free';
    }
  } else {
    console.error('Error fetching user profile:', response.status, response.statusText)
  }
}


async function runScript() {
  if (accessToken) {
    document.getElementById('menu-button').style.display = 'block'
    document.getElementById('after-login').style.display = 'flex'
    document.getElementById('login-button').style.display = 'none'
    await fetchCurrentSong()
    await fetchQueue()
    await fetchUserProfile()
  } else {
    document.getElementById('menu-button').style.display = 'none'
    document.getElementById('after-login').style.display = 'none'
    document.getElementById('login-button').style.display = 'block'
  }
}

getAccessTokenFromUrl()
runScript()
setInterval(runScript, 1000)

document.getElementById('logout').addEventListener('click', () => {
  logout()
})

function logout() {
  accessToken = ''

  document.getElementById('menu-button').style.display = 'none'
  document.getElementById('after-login').style.display = 'none'
  document.getElementById('login-button').style.display = 'block'
  document.getElementById('popup-menu').style.display = 'none'
  document.querySelector('main').classList.remove('background-blur')
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

let lightmode = localStorage.getItem("lightmode")
const themeSwitch = document.getElementById("theme-switch")

const enableLightmode = () => {
  document.body.classList.add("light-mode")
  localStorage.setItem("lightmode", "active")
}

const disableLightmode = () => {
  document.body.classList.remove("light-mode")
  localStorage.setItem("lightmode", null)
}

if (lightmode === "active") enableLightmode()

themeSwitch.addEventListener("click", () => {
  lightmode = localStorage.getItem("lightmode")
  lightmode !== "active" ? enableLightmode() : disableLightmode()
})